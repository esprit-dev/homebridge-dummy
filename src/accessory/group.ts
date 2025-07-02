import { PlatformAccessory } from 'homebridge';

import { DummyAccessory } from './base.js';
import { createAccessory } from './helpers.js';

import { CharacteristicType, DummyConfig, GroupConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { PLUGIN_ALIAS } from '../homebridge/settings.js';
import getVersion from '../tools/version.js';

export class GroupAccessory {

  private readonly accessories: (DummyAccessory<DummyConfig>)[] = [];

  constructor(
    protected readonly Service: ServiceType,
    protected readonly Characteristic: CharacteristicType,
    protected readonly accessory: PlatformAccessory,
    protected readonly config: GroupConfig,
    protected readonly log: Log,
    protected readonly persistPath: string,
  ) {

    accessory.getService(Service.AccessoryInformation)!
      .setCharacteristic(Characteristic.Manufacturer, PLUGIN_ALIAS)
      .setCharacteristic(Characteristic.Model, GroupAccessory.name)
      .setCharacteristic(Characteristic.SerialNumber, accessory.UUID)
      .setCharacteristic(Characteristic.FirmwareRevision, getVersion());

    for (const dummyConfig of config.accessories) {

      const dummyAccessory = createAccessory(this.Service, this.Characteristic, accessory, dummyConfig, this.log, persistPath, true);
      if (!dummyAccessory) {
        continue;
      }

      this.accessories.push(dummyAccessory);
    };
  }

  public teardown() {
    this.accessories.forEach( accessory => {
      accessory.teardown();
    });
  }
}