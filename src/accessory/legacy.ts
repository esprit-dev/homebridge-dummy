import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import { CharacteristicType, LegacyAccessoryConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { storageGet, storageSet } from '../tools/storage.js';
import getVersion from '../tools/version.js';

export const SUFFIX_STATE = '_state';

export const LEGACY_ACCESSORY_NAME = 'DummySwitch';

export class LegacyAccessory {
  private readonly log: Log | undefined;

  private readonly accessoryService: Service;

  private readonly name: string;

  private readonly isStateful: boolean;
  private readonly isRandom: boolean;
  private readonly isResettable: boolean;

  constructor(
    log: Log,
    accessory: PlatformAccessory,
    config: LegacyAccessoryConfig,
    readonly Service: ServiceType,
    readonly Characteristic: CharacteristicType,
    readonly persistPath: string,
  ) {
    this.log = config.disableLogging ? undefined : log;

    this.name = config.name;

    this.isStateful = config.stateful ?? false;

    this.isResettable = config.resettable ?? false;
    this.isRandom = config.random ?? false;

    const serviceType = Service.Switch;

    this.accessoryService = accessory.getService(serviceType) || accessory.addService(serviceType);

    accessory.getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Name, this.name)
      .setCharacteristic(this.Characteristic.ConfiguredName, this.name)
      .setCharacteristic(this.Characteristic.Manufacturer, 'Homebridge')
      .setCharacteristic(this.Characteristic.SerialNumber, 'Dummy-' + this.name.replace(/\s/g, '-'))
      .setCharacteristic(this.Characteristic.FirmwareRevision, getVersion());

    this.finishSetup();
  }

  public static identifier(config: LegacyAccessoryConfig): string {
    return `DummySwitch:${config.name}`;
  }

  private async finishSetup() {

    if (this.isStateful) {
      const state = await storageGet(this.persistPath, this.storageKey(SUFFIX_STATE)) === 'true';
      this.accessoryService.setCharacteristic(this.Characteristic.On, state);
    }

    this.accessoryService.getCharacteristic(this.Characteristic.On)
      .onSet(this._setOn.bind(this));
  }

  private storageKey(suffix: string): string {
    return this.name.replace(/\s/g, '_').toLowerCase() + suffix;
  }

  private randomize(timeout: number | undefined): number | undefined {
    return timeout ? Math.floor(Math.random() * (timeout + 1)) : undefined;
  }

  private async _setOn(value: CharacteristicValue): Promise<void> {

    if (this.isStateful) {
      await storageSet(this.persistPath, this.storageKey(SUFFIX_STATE), value.toString());
      return;
    }

    // const delay = this.isRandom ? this.randomize(this.timeout) : this.timeout;
    // if (!delay) {
    //   return;
    // }
  };
}
