export type ServiceType = typeof import('homebridge').Service;
export type CharacteristicType = typeof import('homebridge').Characteristic;

type AccessoryType = 'Switch';

export enum MigrationState {
  NEEDED = 'NEEDED',
  SKIPPED = 'SKIPPED',
  COMPLETE = 'COMPLETE',
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

// TODO remove
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
  accessories: DummyAccessoryConfig[];
  legacyAccessories: LegacyAccessoryConfig[];
  migration: MigrationState;
  _bridge?: ChildBridge;
  verbose: boolean;
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
}

export type DummyAccessoryConfig = {
  name: string,
  type: AccessoryType,
  legacy?: boolean,
  timer?: TimerConfig,
  disableLogging: boolean,
}

export type OnOffConfig = DummyAccessoryConfig & {
  defaultOn: boolean,
}

export type SwitchConfig = OnOffConfig & {
}