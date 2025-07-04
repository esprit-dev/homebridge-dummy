import { PlatformAccessory } from 'homebridge';

import { DummyAccessory } from './base.js';
import { BlindAccessory } from './blind.js';
import { DoorAccessory } from './door.js';
import { LightbulbAccessory } from './lightbulb.js';
import { LockAccessory } from './lock.js';
import { OutletAccessory } from './outlet.js';
import { SwitchAccessory } from './switch.js';
import { WindowAccessory } from './window.js';

import { strings } from '../i18n/i18n.js';

import * as Types from '../model/types.js';

import { Log } from '../tools/log.js';

export function createAccessory(
  Service: Types.ServiceType,
  Characteristic: Types.CharacteristicType,
  accessory: PlatformAccessory,
  config: Types.DummyConfig,
  log: Log,
  persistPath: string,
  isGrouped: boolean = false,
): DummyAccessory<Types.DummyConfig> | null {

  switch(config.type) {
  case Types.AccessoryType.Door:
    return new DoorAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case Types.AccessoryType.Lightbulb:
    return new LightbulbAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case Types.AccessoryType.LockMechanism:
    return new LockAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case Types.AccessoryType.Outlet:
    return new OutletAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case Types.AccessoryType.Switch:
    return new SwitchAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case Types.AccessoryType.Window:
    return new WindowAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case Types.AccessoryType.WindowCovering:
    return new BlindAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  default:
    log.error(strings.startup.unsupportedType, `'${config.type}'`);
    return null;
  }
}