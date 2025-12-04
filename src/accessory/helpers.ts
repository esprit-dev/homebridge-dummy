import { DummyAccessory, DummyAccessoryDependency } from './base.js';
import { BlindAccessory } from './position/blind.js';
import { DoorAccessory } from './position/door.js';
import { GarageDoorAccessory } from './position/garage.js';
import { LightbulbAccessory } from './onoff/lightbulb.js';
import { LockAccessory } from './lock.js';
import { OutletAccessory } from './onoff/outlet.js';
import { SwitchAccessory } from './onoff/switch.js';
import { ThermostatAccessory } from './thermostat.js';
import { ValveAccessory } from './valve.js';
import { WindowAccessory } from './position/window.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType } from '../model/enums.js';
import { DummyConfig } from '../model/types.js';

export function createDummyAccessory(dependency: DummyAccessoryDependency<DummyConfig>): DummyAccessory<DummyConfig> | null {

  switch(dependency.config.type) {
  case AccessoryType.Door:
    return new DoorAccessory(dependency);
  case AccessoryType.GarageDoorOpener:
    return new GarageDoorAccessory(dependency);
  case AccessoryType.Lightbulb:
    return new LightbulbAccessory(dependency);
  case AccessoryType.LockMechanism:
    return new LockAccessory(dependency);
  case AccessoryType.Outlet:
    return new OutletAccessory(dependency);
  case AccessoryType.Switch:
    return new SwitchAccessory(dependency);
  case AccessoryType.Thermostat:
    return new ThermostatAccessory(dependency);
  case AccessoryType.Valve:
    return new ValveAccessory(dependency);
  case AccessoryType.Window:
    return new WindowAccessory(dependency);
  case AccessoryType.WindowCovering:
    return new BlindAccessory(dependency);
  default:
    dependency.log.error(strings.startup.unsupportedType, `'${dependency.config.type}'`);
    return null;
  }
}