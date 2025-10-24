import { AccessoryConfig, CharacteristicValue, PlatformConfig } from 'homebridge';

export type ServiceType = typeof import('homebridge').Service;
export type CharacteristicType = typeof import('homebridge').Characteristic;

import {
  AccessoryType, DefaultLockState, DefaultOnState, DefaultPosition, DefaultThermostatState,
  ScheduleType, SensorType, TemperatureUnits, TimePeriod, TimeUnits,
} from './enums.js';

export type LegacyAccessoryConfig = AccessoryConfig & {
  name: string;
  dimmer?: boolean;
  brightness?: number;
  stateful?: boolean;
  reverse?: boolean;
  time?: number;
  resettable?: boolean;
  random?: boolean;
  disableLogging?: boolean;
}

export type DummyPlatformConfig = PlatformConfig & {
  accessories?: DummyConfig[];
  migrationNeeded?: boolean;
  webhookPort?: number,
  verbose?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Assertable = {
}

export type ScheduleConfig = Assertable & {
  type: ScheduleType,
  interval?: number,
  units?: TimeUnits,
  random?: boolean,
  cron?: string,
  cronCustom?: string,
}

export type TimerConfig = Assertable & {
  delay: number,
  units: TimeUnits,
  random?: boolean,
}

export type SensorConfig = Assertable & {
  type: SensorType,
  timerControlled?: boolean,
}

export type LimiterConfig = Assertable & {
  id?: string,
  limit: number,
  units: TimeUnits,
  period: TimePeriod,
}

export type DummyConfig = {
  id: string,
  name: string,
  type: AccessoryType,
  groupName?: string,
  sensor?: SensorType | SensorConfig,
  timer?: TimerConfig,
  schedule?: ScheduleConfig,
  limiter?: LimiterConfig,
  resetOnRestart?: boolean,
  enableWebook?: boolean,
  disableLogging?: boolean,
}

export type OnOffConfig = DummyConfig & {
  defaultOn?: CharacteristicValue, // Deprecated
  defaultState?: DefaultOnState,
  commandOn?: string,
  commandOff?: string,
}

export type OutletConfig = OnOffConfig & {
}

export type LightbulbConfig = OnOffConfig & {
  defaultBrightness?: CharacteristicValue,
}

export type SwitchConfig = OnOffConfig & {
}

export type LockConfig = DummyConfig & {
  defaultLockState?: DefaultLockState;
  commandLock?: string,
  commandUnlock?: string,
}

export type ThermostatConfig = DummyConfig & {
  temperatureUnits?: TemperatureUnits
  defaultThermostatState?: DefaultThermostatState;
  defaultTemperature?: number;
  commandOn?: string,
  commandOff?: string,
  commandTemperature?: string,
}

export type PositionConfig = DummyConfig & {
  defaultPosition?: DefaultPosition,
  commandOpen?: string,
  commandClose?: string,
}

export type GarageDoorConfig = PositionConfig & {
}

export type DoorConfig = PositionConfig & {
}

export type WindowConfig = PositionConfig & {
}

export type BlindConfig = PositionConfig & {
}

export type GroupConfig = {
  accessories: DummyConfig[];
}