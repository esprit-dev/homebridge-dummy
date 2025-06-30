import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';

import { DummyAccessory } from '../accessory/base.js';
import { LightbulbAccessory } from '../accessory/lightbulb.js';
import { SwitchAccessory } from '../accessory/switch.js';

import { setLanguage, strings } from '../i18n/i18n.js';

import { AccessoryType, DummyAccessoryConfig, DummyPlatformConfig, LightbulbConfig, SwitchConfig } from '../model/types.js';

import getVersion from '../tools/version.js';
import { Log } from '../tools/log.js';
import { migrateAccessories } from '../tools/configMigration.js';

export class HomebridgeDummyPlatform implements DynamicPlatformPlugin {
  private readonly Service;
  private readonly Characteristic;

  private readonly config: DummyPlatformConfig;

  private readonly log: Log;

  private readonly cachedAccessories: Map<string, PlatformAccessory> = new Map();
  private readonly dummyAccessories: (DummyAccessory)[] = [];

  constructor(
    logger: Logger,
    config: PlatformConfig,
    private readonly api: API,
  ) {

    this.config = config as DummyPlatformConfig;

    const userLang = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
    setLanguage(userLang);

    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    this.log = new Log(logger);

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
    this.cachedAccessories.set(accessory.context.identifier, accessory);
  }

  private teardown() {
    this.dummyAccessories.forEach( accessory => {
      accessory.teardown();
    });
  }

  private async setup(): Promise<void> {
   
    const keepIdentifiers = new Set<string>();

    const accessories: DummyAccessoryConfig[] = this.config.accessories || [];
    if (this.config.migrationNeeded) {
      const migratedAccessories = await migrateAccessories(this.log, this.api.user.configPath()) ?? [];
      accessories.push(...migratedAccessories);
    }
    
    const persistPath = this.api.user.persistPath();

    const newAccessories: PlatformAccessory[] = [];

    for (const accessoryConfig of accessories) {

      const id = DummyAccessory.identifier(accessoryConfig);
      keepIdentifiers.add(id);

      let accessory = this.cachedAccessories.get(id);
      if (!accessory) {

        const name = accessoryConfig.name;
        this.log.always(strings.startup.newAccessory, name);

        const uuid = this.api.hap.uuid.generate(id);

        accessory = new this.api.platformAccessory(name, uuid);
        accessory.context.identifier = id;

        newAccessories.push(accessory);
        this.cachedAccessories.set(id, accessory);
      }

      let dummyAccessory: DummyAccessory;
      switch(accessoryConfig.type) {
      case AccessoryType.Lightbulb:
        dummyAccessory = new LightbulbAccessory(this.Service, this.Characteristic, accessory, accessoryConfig as LightbulbConfig, this.log, persistPath);
        break;
      case AccessoryType.Switch:
        dummyAccessory = new SwitchAccessory(this.Service, this.Characteristic, accessory, accessoryConfig as SwitchConfig, this.log, persistPath);
        break;
      default:
        this.log.error(strings.startup.unsupportedType, `'${accessoryConfig.type}'`);
        continue;
      }

      this.dummyAccessories.push(dummyAccessory);
    };

    if (newAccessories.length) {
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, newAccessories);
    }

    this.cachedAccessories.forEach(accessory => {
      if (!keepIdentifiers.has(accessory.context.identifier)) {
        this.removeCachedAccessory(accessory);
      }
    });

    const randIndex = Math.floor(Math.random() * strings.startup.welcome.length);
    this.log.always(strings.startup.setupComplete, strings.startup.welcome[randIndex]);
  }
  
  private removeCachedAccessory(accessory: PlatformAccessory) {
    this.log.always(strings.startup.removeAccessory, accessory.displayName);
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    this.cachedAccessories.delete(accessory.context.identifier);
  }
}