import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import { strings } from '../../i18n/i18n.js';

import { CharacteristicType, SensorType, SensorCharacteristic, ServiceType } from '../../model/types.js';

import { Log } from '../../tools/log.js';

type SensorStrings = { active: string, inactive: string };
type SensorInfo = { characteristic: SensorCharacteristic, active: CharacteristicValue, inactive: CharacteristicValue, strings: SensorStrings };

const INFO_MAP: { [key in SensorType]: SensorInfo } = {
  [SensorType.MotionSensor]: { characteristic: SensorCharacteristic.MotionDetected, active: true, inactive: false, strings: strings.sensor.motion },
};

export class SensorAccessory {
 
  protected readonly sensorService?: Service;

  private _active: boolean = false;

  static init(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    caller: string,
    log: Log,
    disableLogging?: boolean,
    type?: SensorType,
  ): SensorAccessory | undefined {
    
    if (type) {
      return new SensorAccessory(type, Service, Characteristic, accessory, caller, log, disableLogging);
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
    readonly type: SensorType,
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
    return this.active ? this.sensorInfo.active : this.sensorInfo.inactive;
  }

  private get sensorInfo(): SensorInfo {
    return INFO_MAP[this.type];
  }

  public get active(): boolean {
    return this._active;
  }

  public set active(isActive: boolean) {

    this._active = isActive;

    const characteristicInstance = this.Characteristic[this.sensorInfo.characteristic];
    this.sensorService?.updateCharacteristic(characteristicInstance, isActive ? this.sensorInfo.active : this.sensorInfo.inactive);

    if (!this.disableLogging) {
      this.log?.always(isActive ? this.sensorInfo.strings.active :this.sensorInfo.strings.inactive, this.caller);
    }
  }
}