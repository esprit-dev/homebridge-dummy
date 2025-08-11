import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import { strings } from '../i18n/i18n.js';

import { CharacteristicType, SensorType as Type, SensorCharacteristic as Char, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';

type SensorStrings = { active: string, inactive: string };
type SensorInfo = { characteristic: Char, strings: SensorStrings };

const INFO_MAP: { [key in Type]: SensorInfo } = {
  [Type.CarbonDioxideSensor]: { characteristic: Char.CarbonDioxideDetected, strings: strings.sensor.carbonDioxide },
  [Type.CarbonMonoxideSensor]: { characteristic: Char.CarbonMonoxideDetected, strings: strings.sensor.carbonMonoxide },
  [Type.ContactSensor]: { characteristic: Char.ContactSensorState, strings: strings.sensor.contact },
  [Type.LeakSensor]: { characteristic: Char.LeakDetected, strings: strings.sensor.leak },
  [Type.MotionSensor]: { characteristic: Char.MotionDetected, strings: strings.sensor.motion },
  [Type.OccupancySensor]: { characteristic: Char.OccupancyDetected, strings: strings.sensor.occupancy },
  [Type.SmokeSensor]: { characteristic: Char.SmokeDetected, strings: strings.sensor.smoke },
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
    type?: Type,
  ): SensorAccessory | undefined {

    if (type) {
      return new SensorAccessory(type, Service, Characteristic, accessory, caller, log, disableLogging);
    }

    SensorAccessory.removeUnwantedServices(Service, accessory);
  }

  private static removeUnwantedServices(Service: ServiceType, accessory: PlatformAccessory, keep?: Type) {
    for (const type of Object.values(Type)) {
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
    readonly type: Type,
    Service: ServiceType,
    readonly Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    readonly caller: string,
    readonly log: Log,
    readonly disableLogging?: boolean,
  ) {

    this.sensorService = accessory.getService(Service[type]) || accessory.addService(Service[type]);

    const characteristicInstance = Characteristic[this.sensorInfo.characteristic];
    this.sensorService.getCharacteristic(characteristicInstance)
      .onGet(this.onGet.bind(this));

    SensorAccessory.removeUnwantedServices(Service, accessory, type);
  }

  protected async onGet(): Promise<CharacteristicValue> {
    return this._active;
  }

  private get sensorInfo(): SensorInfo {
    return INFO_MAP[this.type];
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