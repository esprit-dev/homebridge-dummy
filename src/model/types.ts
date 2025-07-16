import { AccessoryConfig, CharacteristicValue, PlatformConfig } from 'homebridge';

export type ServiceType = typeof import('homebridge').Service;
export type CharacteristicType = typeof import('homebridge').Characteristic;

export enum AccessoryType {
  Door = 'Door',
  Lightbulb = 'Lightbulb',
  LockMechanism = 'LockMechanism',
  Outlet = 'Outlet',
  Switch = 'Switch',
  Window = 'Window',
  WindowCovering = 'WindowCovering'
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

export enum DefaultLockState {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
}

export enum DefaultPosition {
  OPEN = 'open',
  CLOSED = 'closed',
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

export type DummyPlatformConfig = PlatformConfig & {
  accessories?: DummyConfig[];
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
  id: string,
  name: string,
  type: AccessoryType,
  groupName?: string,
  timer?: TimerConfig,
  resetOnRestart?: boolean,
  disableLogging?: boolean,
}

export type OnOffConfig = DummyConfig & {
  defaultOn?: CharacteristicValue,
  sensor?: SensorType,
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

export type PositionConfig = DummyConfig & {
  defaultPosition?: DefaultPosition,
  commandOpen?: string,
  commandClose?: string,
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