import { PlatformAccessory } from 'homebridge';

import { DummyAccessory } from './base.js';
import { createDummyAccessory } from './helpers.js';

import { CharacteristicType, DummyConfig, GroupConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { PLATFORM_NAME, PLUGIN_ALIAS } from '../homebridge/settings.js';
import getVersion from '../tools/version.js';

export class GroupAccessory {

  public static identifier(groupName: string): string {
    return `${PLATFORM_NAME}:Group:${groupName.replace(/\s+/g,'')})}`;
  }

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

    const keepSubtypes = new Set<string>();

    for (const dummyConfig of config.accessories) {

      const dummyAccessory = createDummyAccessory(this.Service, this.Characteristic, accessory, dummyConfig, this.log, persistPath, true);
      if (!dummyAccessory) {
        continue;
      }

      keepSubtypes.add(dummyAccessory.subtype!);
      this.accessories.push(dummyAccessory);
    };

    for (const service of [...accessory.services]) {
      if (service.subtype && !keepSubtypes.has(service.subtype)) {
        accessory.removeService(service);
      }
    }
  }

  public teardown() {
    this.accessories.forEach( accessory => {
      accessory.teardown();
    });
  }
}