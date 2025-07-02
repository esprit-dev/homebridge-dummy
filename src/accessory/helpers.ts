import { PlatformAccessory } from 'homebridge';

import { DummyAccessory } from './base.js';
import { LightbulbAccessory } from './lightbulb.js';
import { OutletAccessory } from './outlet.js';
import { SwitchAccessory } from './switch.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType, CharacteristicType, DummyConfig, LightbulbConfig, OutletConfig, ServiceType, SwitchConfig } from '../model/types.js';

import { Log } from '../tools/log.js';

export function createAccessory(
  Service: ServiceType,
  Characteristic: CharacteristicType,
  accessory: PlatformAccessory,
  config: DummyConfig,
  log: Log,
  persistPath: string,
  isGrouped: boolean = false,
): DummyAccessory<DummyConfig> | null {

  switch(config.type) {
  case AccessoryType.Lightbulb:
    return new LightbulbAccessory(Service, Characteristic, accessory, config as LightbulbConfig, log, persistPath, isGrouped);
  case AccessoryType.Outlet:
    return new OutletAccessory(Service, Characteristic, accessory, config as OutletConfig, log, persistPath, isGrouped);
  case AccessoryType.Switch:
    return new SwitchAccessory(Service, Characteristic, accessory, config as SwitchConfig, log, persistPath, isGrouped);
  default:
    log.error(strings.startup.unsupportedType, `'${config.type}'`);
    return null;
  }
}