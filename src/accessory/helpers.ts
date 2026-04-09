import { DummyAccessory, DummyAccessoryDependency } from './base.js';

import { ButtonAccessory } from './button.js';
import { HumidifierAccessory } from './climate/humidifier.js';
import { ThermostatAccessory } from './climate/thermostat.js';
import { LockAccessory } from './lock.js';
import { LightbulbAccessory } from './onoff/lightbulb.js';
import { OutletAccessory } from './onoff/outlet.js';
import { SwitchAccessory } from './onoff/switch.js';
import { BlindAccessory } from './position/blind.js';
import { DoorAccessory } from './position/door.js';
import { WindowAccessory } from './position/window.js';
import { GarageDoorAccessory } from './position/garage.js';
import { HumiditySensorAccessory } from './sensor/humidity.js';
import { TemperatureSensorAccessory } from './sensor/temperature.js';
import { ValveAccessory } from './valve.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType } from '../model/enums.js';
import { DummyConfig } from '../model/types.js';

export function createDummyAccessory(dependency: DummyAccessoryDependency<DummyConfig>): DummyAccessory<DummyConfig> | null {

  switch(dependency.config.type) {
  case AccessoryType.Door:
    return new DoorAccessory(dependency);
  case AccessoryType.GarageDoorOpener:
    return new GarageDoorAccessory(dependency);
  case AccessoryType.HumidifierDehumidifier:
    return new HumidifierAccessory(dependency);
  case AccessoryType.HumiditySensor:
    return new HumiditySensorAccessory(dependency);
  case AccessoryType.Lightbulb:
    return new LightbulbAccessory(dependency);
  case AccessoryType.LockMechanism:
    return new LockAccessory(dependency);
  case AccessoryType.Outlet:
    return new OutletAccessory(dependency);
  case AccessoryType.StatelessProgrammableSwitch:
    return new ButtonAccessory(dependency);
  case AccessoryType.Switch:
    return new SwitchAccessory(dependency);
  case AccessoryType.TemperatureSensor:
    return new TemperatureSensorAccessory(dependency);
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