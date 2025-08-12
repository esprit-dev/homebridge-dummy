import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import { strings } from '../i18n/i18n.js';

import { CharacteristicType, SensorType, SensorCharacteristic as Char, ServiceType, SensorConfig } from '../model/types.js';

import { Log } from '../tools/log.js';

type SensorStrings = { active: string, inactive: string };
type SensorInfo = { characteristic: Char, strings: SensorStrings };

const INFO_MAP: { [key in SensorType]: SensorInfo } = {
  [SensorType.CarbonDioxideSensor]: { characteristic: Char.CarbonDioxideDetected, strings: strings.sensor.carbonDioxide },
  [SensorType.CarbonMonoxideSensor]: { characteristic: Char.CarbonMonoxideDetected, strings: strings.sensor.carbonMonoxide },
  [SensorType.ContactSensor]: { characteristic: Char.ContactSensorState, strings: strings.sensor.contact },
  [SensorType.LeakSensor]: { characteristic: Char.LeakDetected, strings: strings.sensor.leak },
  [SensorType.MotionSensor]: { characteristic: Char.MotionDetected, strings: strings.sensor.motion },
  [SensorType.OccupancySensor]: { characteristic: Char.OccupancyDetected, strings: strings.sensor.occupancy },
  [SensorType.SmokeSensor]: { characteristic: Char.SmokeDetected, strings: strings.sensor.smoke },
};

export class SensorAccessory {

  protected readonly sensorService?: Service;

  private _active: number = 0;

  static new(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    caller: string,
    log: Log,
    disableLogging?: boolean,
    sensor?: SensorConfig | SensorType,
  ): SensorAccessory | undefined {

    if (sensor) {

      if (typeof sensor === 'string') {
        sensor = {
          type: sensor,
        };
      }

      return new SensorAccessory(sensor, Service, Characteristic, accessory, caller, log, disableLogging);
    }

    SensorAccessory.removeUnwantedServices(Service, accessory);
  }

  private static removeUnwantedServices(Service: ServiceType, accessory: PlatformAccessory, keep?: SensorType) {
    for (const type of Object.values(SensorType)) {
      if (type === keep) {
        continue;
      }

      const existingService = accessory.getService(Service[type]);
      if (existingService) {
        accessory.removeService(existingService);
      }
    }
  }

  private constructor(
    readonly config: SensorConfig,
    Service: ServiceType,
    readonly Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    readonly caller: string,
    readonly log: Log,
    readonly disableLogging?: boolean,
  ) {

    this.sensorService = accessory.getService(Service[config.type]) || accessory.addService(Service[config.type]);

    const characteristicInstance = Characteristic[this.sensorInfo.characteristic];
    this.sensorService.getCharacteristic(characteristicInstance)
      .onGet(this.onGet.bind(this));

    SensorAccessory.removeUnwantedServices(Service, accessory, config.type);
  }

  protected async onGet(): Promise<CharacteristicValue> {
    return this._active;
  }

  private get sensorInfo(): SensorInfo {
    return INFO_MAP[this.config.type];
  }

  public get timerControlled(): boolean {
    return this.config.timerControlled === true;
  }

  public get active(): boolean {
    return this._active === 1;
  }

  public set active(isActive: boolean) {

    this._active = isActive ? 1 : 0;

    const characteristicInstance = this.Characteristic[this.sensorInfo.characteristic];
    this.sensorService?.updateCharacteristic(characteristicInstance, this._active);

    if (!this.disableLogging) {
      this.log?.always(isActive ? this.sensorInfo.strings.active :this.sensorInfo.strings.inactive, this.caller);
    }
  }
}