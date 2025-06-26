import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';

import { setLanguage, strings } from '../i18n/i18n.js';

import getVersion from '../tools/version.js';
import { Log } from '../tools/log.js';
import { migrateAccessories } from '../tools/configMigration.js';
import { LegacyAccessoryConfig, MigrationState } from '../model/types.js';
import { LegacyAccessory } from '../accessory/legacy.js';

export class HomebridgeDummyPlatform implements DynamicPlatformPlugin {
  public readonly Service;
  public readonly Characteristic;

  public readonly log: Log;

  private readonly cachedAccessories: Map<string, PlatformAccessory> = new Map();
  private readonly dummyAccessories: (LegacyAccessory)[] = [];

  constructor(
    logger: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {

    const userLang = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
    setLanguage(userLang);

    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    this.log = new Log(logger, config.verbose);

    this.log.always(
      'v%s | System %s | Node %s | HB v%s | HAPNodeJS v%s',
      getVersion(),
      process.platform,
      process.version,
      api.serverVersion,
      api.hap.HAPLibraryVersion(),
    );

    this.api.on('didFinishLaunching', () => {
      this.setup();
    });

    this.api.on('shutdown', () => {
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

    let legacyAccessories: LegacyAccessoryConfig[] | undefined = undefined;
    if (this.config.migrate === MigrationState.NEEDED) {
      legacyAccessories = await migrateAccessories(this.log, this.api.user.configPath());
    } else {
      legacyAccessories = this.config.legacyAccessories;
    }
    
    legacyAccessories?.forEach( (legacyConfig: LegacyAccessoryConfig) => {
      const id = LegacyAccessory.identifier(legacyConfig);
      keepIdentifiers.add(id);

      let accessory = this.cachedAccessories.get(id);
      if (!accessory) {

        const name = legacyConfig.name;
        this.log.always(strings.startup.newAccessory, name);

        const uuid = this.api.hap.uuid.generate(id);

        accessory = new this.api.platformAccessory(name, uuid);
        accessory.context.identifier = id;

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);

        this.cachedAccessories.set(id, accessory);
      }

      const dummyAccessory = new LegacyAccessory(this.log, accessory, legacyConfig, this.Service, this.Characteristic, this.api.user.persistPath());
      this.dummyAccessories.push(dummyAccessory);
    });

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