import { API, DynamicPlatformPlugin, Logger, PlatformAccessory } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';

import { DummyAccessory } from '../accessory/base.js';
import { GroupAccessory } from '../accessory/group.js';
import { createDummyAccessory } from '../accessory/helpers.js';

import { setLanguage, strings } from '../i18n/i18n.js';

import { DummyConfig, DummyPlatformConfig, GroupConfig } from '../model/types.js';

import { migrateAccessories } from '../tools/configMigration.js';
import { Log } from '../tools/log.js';
import getVersion from '../tools/version.js';
import { WebhookManager } from '../model/webhook.js';

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
    this.webhookManager = new WebhookManager(this.Characteristic, this.log);

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

  configureAccessory(accessory: PlatformAccessory): void {
    this.log.always(strings.startup.restoringAccessory, accessory.displayName);
    this.platformAccessories.set(accessory.context.identifier, accessory);
  }

  private teardown() {
    this.dummyAccessories.forEach( accessory => {
      accessory.teardown();
    });
  }

  private async setup(): Promise<void> {

    const keepIdentifiers = new Set<string>();

    const accessories: DummyConfig[] = this.config.accessories || [];
    if (this.config.migrationNeeded) {
      const migratedAccessories = await migrateAccessories(this.log, this.api.user.configPath()) ?? [];
      accessories.push(...migratedAccessories);
    }

    const persistPath = this.api.user.persistPath();

    const groupAccessories = new Map<string, GroupConfig>();

    for (const accessoryConfig of accessories) {

      if (accessoryConfig.groupName?.length) {
        const groupConfig: GroupConfig = groupAccessories.get(accessoryConfig.groupName) || { accessories: [] };
        groupConfig.accessories.push(accessoryConfig);
        groupAccessories.set(accessoryConfig.groupName, groupConfig);
        continue;
      }

      const id = DummyAccessory.identifier(accessoryConfig);
      keepIdentifiers.add(id);

      const accessory = this.platformAccessories.get(id) ?? this.createPlatformAccessory(id, accessoryConfig.name);

      const dummyAccessory = createDummyAccessory(this.Service, this.Characteristic, accessory, accessoryConfig, this.log, persistPath);
      if (!dummyAccessory) {
        continue;
      }

      if (accessoryConfig.enableWebook) {
        this.webhookManager.registerAccessory(dummyAccessory);
      }

      this.dummyAccessories.push(dummyAccessory);
    };

    for (const groupName of groupAccessories.keys()) {

      const groupConfig: GroupConfig = groupAccessories.get(groupName)!;

      const id = GroupAccessory.identifier(groupName);
      keepIdentifiers.add(id);

      const accessory = this.platformAccessories.get(id) ?? this.createPlatformAccessory(id, groupName);

      const groupAccessory = new GroupAccessory(this.Service, this.Characteristic, accessory, groupConfig, this.log, persistPath, this.webhookManager);
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

  private removeCachedAccessory(accessory: PlatformAccessory) {
    this.log.always(strings.startup.removeAccessory, accessory.displayName);
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    this.platformAccessories.delete(accessory.context.identifier);
  }
}