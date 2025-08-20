import { PlatformAccessory } from 'homebridge';

import { DummyAccessory } from './base.js';
import { BlindAccessory } from './position/blind.js';
import { DoorAccessory } from './position/door.js';
import { LightbulbAccessory } from './onoff/lightbulb.js';
import { LockAccessory } from './lock.js';
import { OutletAccessory } from './onoff/outlet.js';
import { SwitchAccessory } from './onoff/switch.js';
import { ThermostatAccessory } from './thermostat.js';
import { WindowAccessory } from './position/window.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType } from '../model/enums.js';
import { CharacteristicType, DummyConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';

export function createDummyAccessory(
  Service: ServiceType,
  Characteristic: CharacteristicType,
  accessory: PlatformAccessory,
  config: DummyConfig,
  log: Log,
  persistPath: string,
  isGrouped: boolean = false,
): DummyAccessory<DummyConfig> | null {

  switch(config.type) {
  case AccessoryType.Door:
    return new DoorAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case AccessoryType.Lightbulb:
    return new LightbulbAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case AccessoryType.LockMechanism:
    return new LockAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case AccessoryType.Outlet:
    return new OutletAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case AccessoryType.Switch:
    return new SwitchAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case AccessoryType.Thermostat:
    return new ThermostatAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case AccessoryType.Window:
    return new WindowAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  case AccessoryType.WindowCovering:
    return new BlindAccessory(Service, Characteristic, accessory, config, log, persistPath, isGrouped);
  default:
    log.error(strings.startup.unsupportedType, `'${config.type}'`);
    return null;
  }
}