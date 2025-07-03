import { CharacteristicValue } from 'homebridge';

export type ServiceType = typeof import('homebridge').Service;
export type CharacteristicType = typeof import('homebridge').Characteristic;

export enum AccessoryType {
  Lightbulb = 'Lightbulb',
  LockMechanism = 'LockMechanism',
  Outlet = 'Outlet',
  Switch = 'Switch'
}

export enum SensorType {
  CarbonDioxideSensor = 'CarbonDioxideSensor',
  CarbonMonoxideSensor = 'CarbonMonoxideSensor',
  ContactSensor = 'ContactSensor',
  LeakSensor = 'LeakSensor',
  MotionSensor = 'MotionSensor',
  OccupancySensor = 'OccupancySensor',
  SmokeSensor = 'SmokeSensor',
}

export enum SensorCharacteristic {
  CarbonDioxideDetected = 'CarbonDioxideDetected',
  CarbonMonoxideDetected = 'CarbonMonoxideDetected',
  ContactSensorState = 'ContactSensorState',
  LeakDetected = 'LeakDetected',
  MotionDetected = 'MotionDetected',
  OccupancyDetected = 'OccupancyDetected',
  SmokeDetected = 'SmokeDetected',
}

export type ChildBridge = {
  username: string;
  port?: number;
  name?: string;
}

export type AccessoryConfig = {
  accessory: string;
  _bridge?: ChildBridge;
}

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

export type PlatformConfig = {
  platform: string;
}

export type DummyPlatformConfig = PlatformConfig & {
  accessories?: DummyConfig[];
  _bridge?: ChildBridge;
  migrationNeeded?: boolean;
}

export enum TimeUnits {
  SECONDS = 'SECONDS',
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Assertable = {
}

export type TimerConfig = Assertable & {
  delay: number,
  units: TimeUnits,
  random?: boolean,
}

export type DummyConfig = {
  name: string,
  type: AccessoryType,
  timer?: TimerConfig,
  resetOnRestart?: boolean,
  disableLogging?: boolean,
}

export type OnOffConfig = DummyConfig & {
  defaultOnOff?: CharacteristicValue,
  sensor?: SensorType,
}

export type OutletConfig = OnOffConfig & {
}

export type LightbulbConfig = OnOffConfig & {
  defaultBrightness?: CharacteristicValue,
}

export type SwitchConfig = OnOffConfig & {
}

export type LockConfig = DummyConfig & {
  defaultLockState?: CharacteristicValue;
}

export type GroupConfig = {
  accessories: DummyConfig[];
}