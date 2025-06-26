import fs from 'fs';

import { Log } from './log.js';

import { LEGACY_ACCESSORY_NAME } from '../accessory/legacy.js';

import { strings } from '../i18n/i18n.js';

import { PLATFORM_NAME } from '../homebridge/settings.js';

import { AccessoryConfig, DummyPlatformConfig, LegacyAccessoryConfig, MigrationState, PlatformConfig } from '../model/types.js';

// TODO need to handle child bridge case
export async function migrateAccessories(log: Log, configPath: string): Promise<LegacyAccessoryConfig[] | undefined> {

  try {
    const config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }));

    fs.writeFileSync(configPath + '.bak', JSON.stringify(config, null, 4));

    const toMigrate: LegacyAccessoryConfig[] = [];
    const others: AccessoryConfig[] = [];

    config.accessories.forEach( (accessoryConfig: AccessoryConfig) => {
      if (accessoryConfig.accessory === LEGACY_ACCESSORY_NAME) {
        toMigrate.push(accessoryConfig as LegacyAccessoryConfig);
      } else {
        others.push(accessoryConfig);
      }
    });
  
    config.accessories = others;

    config.platforms.forEach( (platformConfig: PlatformConfig) => {
      if (platformConfig.platform === PLATFORM_NAME) {
        const dummyPlatformConfig = platformConfig as DummyPlatformConfig;
        dummyPlatformConfig.legacyAccessories = toMigrate;
        dummyPlatformConfig.migration = MigrationState.COMPLETE;
      }
    });

    config.migrate = MigrationState.COMPLETE;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

    log.success(strings.startup.migrationComplete, 'Homebridge Dummy');
    log.always(strings.startup.migrationRevert);

    return toMigrate;

  } catch (err) {
    log.error(strings.startup.migrationFailed, err);
    return undefined;
  }
}