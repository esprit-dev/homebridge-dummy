import { PlatformAccessory } from 'homebridge';

import { DummyAccessory, DummyAccessoryDependency } from './base.js';
import { createDummyAccessory } from './helpers.js';

import { ConditionManager } from '../model/conditions.js';
import { CharacteristicType, DummyConfig, GroupConfig, ServiceType } from '../model/types.js';
import { WebhookManager } from '../model/webhook.js';

import { Log } from '../tools/log.js';
import { PLATFORM_NAME, PLUGIN_ALIAS } from '../homebridge/settings.js';
import getVersion from '../tools/version.js';

export type GroupAccessoryDependency = {
    Service: ServiceType,
    Characteristic: CharacteristicType,
    platformAccessory: PlatformAccessory,
    conditionManager: ConditionManager,
    log: Log
}

export class GroupAccessory {

  public static identifier(groupName: string): string {
    return `${PLATFORM_NAME}:Group:${groupName.replace(/\s+/g,'')})}`;
  }

  private readonly accessories: (DummyAccessory<DummyConfig>)[] = [];

  constructor(dependency: GroupAccessoryDependency, config: GroupConfig, webhookManager: WebhookManager) {

    dependency.platformAccessory.getService(dependency.Service.AccessoryInformation)!
      .setCharacteristic(dependency.Characteristic.Manufacturer, PLUGIN_ALIAS)
      .setCharacteristic(dependency.Characteristic.Model, GroupAccessory.name)
      .setCharacteristic(dependency.Characteristic.SerialNumber, dependency.platformAccessory.UUID)
      .setCharacteristic(dependency.Characteristic.FirmwareRevision, getVersion());

    const keepSubtypes = new Set<string>();

    for (const dummyConfig of config.accessories) {

      const accessoryDependency: DummyAccessoryDependency<DummyConfig> = {
        ...dependency,
        config: dummyConfig,
        isGrouped: true,
      };

      const dummyAccessory = createDummyAccessory(accessoryDependency);
      if (!dummyAccessory) {
        continue;
      }

      if (dummyConfig.enableWebook) {
        webhookManager.registerAccessory(dummyAccessory);
      }

      keepSubtypes.add(dummyAccessory.subtype!);
      this.accessories.push(dummyAccessory);
    };

    for (const service of [...dependency.platformAccessory.services]) {
      if (service.subtype && !keepSubtypes.has(service.subtype)) {
        dependency.platformAccessory.removeService(service);
      }
    }
  }

  public teardown() {
    this.accessories.forEach( accessory => {
      accessory.teardown();
    });
  }
}