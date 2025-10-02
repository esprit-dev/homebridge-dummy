import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import { strings } from '../i18n/i18n.js';

import { SensorType, SensorCharacteristic, isValidSensorType, printableValues }  from '../model/enums.js';
import { CharacteristicType, ServiceType, SensorConfig } from '../model/types.js';

import { Timeout } from '../timeout/timeout.js';

import { Log } from '../tools/log.js';

type SensorStrings = { active: string, inactive: string };
type SensorInfo = { characteristic: SensorCharacteristic, strings: SensorStrings };

const INFO_MAP: { [key in SensorType]: SensorInfo } = {
  [SensorType.CarbonDioxideSensor]: { characteristic: SensorCharacteristic.CarbonDioxideDetected, strings: strings.sensor.carbonDioxide },
  [SensorType.CarbonMonoxideSensor]: { characteristic: SensorCharacteristic.CarbonMonoxideDetected, strings: strings.sensor.carbonMonoxide },
  [SensorType.ContactSensor]: { characteristic: SensorCharacteristic.ContactSensorState, strings: strings.sensor.contact },
  [SensorType.LeakSensor]: { characteristic: SensorCharacteristic.LeakDetected, strings: strings.sensor.leak },
  [SensorType.MotionSensor]: { characteristic: SensorCharacteristic.MotionDetected, strings: strings.sensor.motion },
  [SensorType.OccupancySensor]: { characteristic: SensorCharacteristic.OccupancyDetected, strings: strings.sensor.occupancy },
  [SensorType.SmokeSensor]: { characteristic: SensorCharacteristic.SmokeDetected, strings: strings.sensor.smoke },
};

export class SensorAccessory extends Timeout {

  protected readonly service: Service;

  private _active: number = 0;

  static new(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    caller: string,
    log: Log,
    disableLogging: boolean,
    sensor?: SensorConfig | SensorType,
  ): SensorAccessory | undefined {

    if (sensor) {

      if (typeof sensor === 'string') {
        sensor = {
          type: sensor,
        };
      }

      if (!isValidSensorType(sensor.type)) {
        log.error(strings.sensor.badType, caller, `'${sensor.type}'`, printableValues(SensorType));
        return;
      }

      return new SensorAccessory(sensor, Service, Characteristic, accessory, caller, log, disableLogging);
    }

    SensorAccessory.removeUnwantedServices(Service, accessory);

    return;
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
    private readonly config: SensorConfig,
    Service: ServiceType,
    private readonly Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    caller: string,
    log: Log,
    disableLogging: boolean,
  ) {

    super(caller, log, disableLogging);

    this.service = accessory.getService(Service[config.type]) || accessory.addService(Service[config.type]);

    const characteristicInstance = Characteristic[this.sensorInfo.characteristic];
    this.service.getCharacteristic(characteristicInstance)
      .onGet(this.onGet.bind(this));

    SensorAccessory.removeUnwantedServices(Service, accessory, config.type);
  }

  private async onGet(): Promise<CharacteristicValue> {
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

    this.reset();

    if (this.active === isActive) {
      return;
    }

    this._active = isActive ? 1 : 0;

    const characteristicInstance = this.Characteristic[this.sensorInfo.characteristic];
    this.service.updateCharacteristic(characteristicInstance, this._active);

    this.logIfDesired(isActive ? this.sensorInfo.strings.active :this.sensorInfo.strings.inactive);

    if (this.timerControlled && this.active) {
      this.timeout = setTimeout( () => {
        this.active = false;
      }, 1000);
    }
  }
}