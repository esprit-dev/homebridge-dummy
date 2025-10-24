import { API, DynamicPlatformPlugin, Logger, PlatformAccessory } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';

import { DummyAccessory, DummyAccessoryDependency } from '../accessory/base.js';
import { GroupAccessory, GroupAccessoryDependency } from '../accessory/group.js';
import { createDummyAccessory } from '../accessory/helpers.js';

import { setLanguage, strings } from '../i18n/i18n.js';

import { DummyConfig, DummyPlatformConfig, GroupConfig } from '../model/types.js';

import { migrateAccessories } from '../tools/configMigration.js';
import { Log } from '../tools/log.js';
import getVersion from '../tools/version.js';
import { WebhookManager } from '../model/webhook.js';
import { Storage } from '../tools/storage.js';
import { ConditionManager } from '../model/conditions.js';

export class HomebridgeDummyPlatform implements DynamicPlatformPlugin {
  private readonly Service;
  private readonly Characteristic;

  private readonly log: Log;

  private readonly platformAccessories: Map<string, PlatformAccessory> = new Map();
  private readonly dummyAccessories: (DummyAccessory<DummyConfig> | GroupAccessory)[] = [];

  private webhookManager: WebhookManager;

  constructor(
    logger: Logger,
    private readonly config: DummyPlatformConfig,
    private readonly api: API,
  ) {

    const userLang = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
    setLanguage(userLang);

    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    this.log = new Log(logger, config.verbose === true);
    this.webhookManager = new WebhookManager(this.Characteristic, this.log, config.webhookPort);

    this.log.always(
      'v%s | System %s | Node %s | HB v%s | HAPNodeJS v%s',
      getVersion(),
      process.platform,
      process.version,
      api.serverVersion,
      api.hap.HAPLibraryVersion(),
    );

    api.on('didFinishLaunching', () => {
      this.setup();
    });

    api.on('shutdown', () => {
      this.teardown();
    });
  }

  configureAccessory(platformAccessory: PlatformAccessory): void {
    this.log.always(strings.startup.restoringAccessory, platformAccessory.displayName);
    this.platformAccessories.set(platformAccessory.context.identifier, platformAccessory);
  }

  private teardown() {
    this.dummyAccessories.forEach( accessory => {
      accessory.teardown();
    });
  }

  private async setup(): Promise<void> {

    await Storage.init(this.api.user.persistPath());

    const keepIdentifiers = new Set<string>();

    const accessories: DummyConfig[] = this.config.accessories || [];
    if (this.config.migrationNeeded) {
      const migratedAccessories = await migrateAccessories(this.log, this.api.user.configPath()) ?? [];
      accessories.push(...migratedAccessories);
    }

    const groupAccessories = new Map<string, GroupConfig>();

    const conditionManager = new ConditionManager(this.log);

    for (const accessoryConfig of accessories) {

      if (accessoryConfig.groupName?.length) {
        const groupConfig: GroupConfig = groupAccessories.get(accessoryConfig.groupName) || { accessories: [] };
        groupConfig.accessories.push(accessoryConfig);
        groupAccessories.set(accessoryConfig.groupName, groupConfig);
        continue;
      }

      const id = DummyAccessory.identifier(accessoryConfig);
      keepIdentifiers.add(id);

      const platformAccessory = this.platformAccessories.get(id) ?? this.createPlatformAccessory(id, accessoryConfig.name);

      const dependency: DummyAccessoryDependency<DummyConfig> = {
        Service: this.Service,
        Characteristic: this.Characteristic,
        platformAccessory: platformAccessory,
        config: accessoryConfig,
        conditionManager: conditionManager,
        log: this.log,
        isGrouped: false,
      };

      const dummyAccessory = createDummyAccessory(dependency);
      if (!dummyAccessory) {
        continue;
      }

      if (accessoryConfig.enableWebook) {
        this.webhookManager.registerAccessory(dummyAccessory);
      }

      this.dummyAccessories.push(dummyAccessory);
    }

    for (const groupName of groupAccessories.keys()) {

      const groupConfig: GroupConfig = groupAccessories.get(groupName)!;

      const id = GroupAccessory.identifier(groupName);
      keepIdentifiers.add(id);

      const platformAccessory = this.platformAccessories.get(id) ?? this.createPlatformAccessory(id, groupName);

      const dependency: GroupAccessoryDependency = {
        Service: this.Service,
        Characteristic: this.Characteristic,
        platformAccessory: platformAccessory,
        conditionManager: conditionManager,
        log: this.log,
      };

      const groupAccessory = new GroupAccessory(dependency, groupConfig, this.webhookManager);
      this.dummyAccessories.push(groupAccessory);
    }

    this.platformAccessories.forEach(accessory => {
      if (!keepIdentifiers.has(accessory.context.identifier)) {
        this.removeCachedAccessory(accessory);
      }
    });

    this.webhookManager.startServer();

    const randIndex = Math.floor(Math.random() * strings.startup.welcome.length);
    this.log.always(`${strings.startup.setupComplete}\n${strings.startup.welcome[randIndex]}`);
  }

  private createPlatformAccessory(id: string, name: string): PlatformAccessory {

    this.log.always(strings.startup.newAccessory, name);

    const uuid = this.api.hap.uuid.generate(id);

    const accessory = new this.api.platformAccessory(name, uuid);
    accessory.context.identifier = id;

    this.platformAccessories.set(id, accessory);

    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);

    return accessory;
  }

  private removeCachedAccessory(platformAccessory: PlatformAccessory) {
    this.log.always(strings.startup.removeAccessory, platformAccessory.displayName);
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [platformAccessory]);
    this.platformAccessories.delete(platformAccessory.context.identifier);
  }
}