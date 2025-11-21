import fs from 'fs';

import { AccessoryConfig, BridgeConfiguration, PlatformConfig } from 'homebridge';

import { Log } from './log.js';

import { strings } from '../i18n/i18n.js';

import { LEGACY_ALIAS, PLATFORM_NAME } from '../homebridge/settings.js';

import { AccessoryType, OnState, ScheduleType, TimeUnits }  from '../model/enums.js';
import { DummyConfig, DummyPlatformConfig, LegacyAccessoryConfig, LightbulbConfig, OnOffConfig } from '../model/types.js';

function migrateAccessory(legacyConfig: LegacyAccessoryConfig): DummyConfig {

  const dummyConfig: DummyConfig = {
    id: crypto.randomUUID(),
    name: legacyConfig.name,
    type: AccessoryType.Switch,
    disableLogging: legacyConfig.disableLogging,
  };

  if (legacyConfig.reverse) {
    const onOffConfig = dummyConfig as OnOffConfig;
    onOffConfig.defaultState = OnState.ON;
  }

  if (legacyConfig.dimmer) {
    const lightbulbConfig = dummyConfig as LightbulbConfig;
    lightbulbConfig.type = AccessoryType.Lightbulb;
    lightbulbConfig.defaultBrightness = legacyConfig.brightness ?? 0;
  }

  if (!legacyConfig.stateful && legacyConfig.time) {
    dummyConfig.autoReset = {
      type: ScheduleType.TIMEOUT,
      time: legacyConfig.time,
      units: TimeUnits.MILLISECONDS,
      random: legacyConfig.random,
    };
  }

  return dummyConfig;
}

export async function migrateAccessories(log: Log, configPath: string): Promise<DummyConfig[] | undefined> {

  try {
    const config = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }));

    fs.writeFileSync(configPath + '.bak', JSON.stringify(config, null, 4));

    let dummyPlatformConfig: DummyPlatformConfig | undefined;
    for (const platformConfig of config.platforms as PlatformConfig[]) {

      if (platformConfig.platform !== PLATFORM_NAME) {
        continue;
      }

      dummyPlatformConfig = platformConfig as DummyPlatformConfig;

      break;
    }

    if (!dummyPlatformConfig) {
      log.error(strings.startup.migrationFailed);
      return;
    }

    dummyPlatformConfig.accessories = dummyPlatformConfig.accessories?.length ? dummyPlatformConfig.accessories : [];

    const migrated: DummyConfig[] = [];
    const others: AccessoryConfig[] = [];

    let childBridge: BridgeConfiguration | undefined;

    for (const accessoryConfig of config.accessories as AccessoryConfig[]) {

      if (accessoryConfig.accessory !== LEGACY_ALIAS) {
        others.push(accessoryConfig);
        continue;
      }

      const dummyConfig = migrateAccessory(accessoryConfig as LegacyAccessoryConfig);

      migrated.push(dummyConfig);
      dummyPlatformConfig.accessories.push(dummyConfig);

      if (accessoryConfig._bridge?.port) {
        childBridge = accessoryConfig._bridge;
      }
    }

    config.accessories = others;

    if (!dummyPlatformConfig._bridge) {
      dummyPlatformConfig._bridge = childBridge;
    }

    delete dummyPlatformConfig.migrationNeeded;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

    if (migrated.length === 0) {
      log.warning(strings.startup.migrationNoAccessories);
      return;
    }

    log.success(strings.startup.migrationComplete, migrated.length);
    log.warning(strings.startup.migrationRevert);

    if (childBridge) {
      log.error(strings.startup.migrationBridge);
    } else {
      log.warning(strings.startup.migrationIgnore);
    }

    return migrated;

  } catch (err) {
    log.error(strings.startup.migrationFailed, err);
  }
}