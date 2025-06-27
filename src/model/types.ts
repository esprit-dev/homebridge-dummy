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
  legacyAccessories: LegacyAccessoryConfig[];
  migration: MigrationState;
  _bridge?: ChildBridge;
  verbose: boolean;
}