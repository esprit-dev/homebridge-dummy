export type ServiceType = typeof import('homebridge').Service;
export type CharacteristicType = typeof import('homebridge').Characteristic;

export enum AccessoryType {
  Lightbulb = 'Lightbulb',
  Switch = 'Switch'
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
  accessories?: DummyAccessoryConfig[];
  _bridge?: ChildBridge;
  verbose?: boolean;
  migrationNeeded?: boolean;
}

export enum TimeUnits {
  MILLIS = 'MILLIS',
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

export type DummyAccessoryConfig = {
  name: string,
  type: AccessoryType,
  legacy?: boolean,
  timer?: TimerConfig,
  disableLogging?: boolean,
}

export type OnOffConfig = DummyAccessoryConfig & {
  defaultOn: boolean,
}

export type SwitchConfig = OnOffConfig & {
}

export type LightbulbConfig = OnOffConfig & {
  defaultBrightness: number,
}