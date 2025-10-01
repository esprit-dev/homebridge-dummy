export enum AccessoryType {
  Door = 'Door',
  Lightbulb = 'Lightbulb',
  LockMechanism = 'LockMechanism',
  Outlet = 'Outlet',
  Switch = 'Switch',
  Thermostat = 'Thermostat',
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

export function isValidSensorType(input: SensorType): boolean {
  return Object.values(SensorType).includes(input);
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

export function isValidLockState(input?: DefaultLockState): boolean {
  return input === undefined || Object.values(DefaultLockState).includes(input);
}

export enum DefaultPosition {
  OPEN = 'open',
  CLOSED = 'closed',
}

export function isValidPosition(input?: DefaultPosition): boolean {
  return input === undefined || Object.values(DefaultPosition).includes(input);
}

export enum DefaultThermostatState {
  AUTO = 'auto',
  COOL = 'cool',
  HEAT = 'heat',
  OFF = 'off',
}

export function isValidThermostatState(input?: DefaultThermostatState): boolean {
  return input === undefined || Object.values(DefaultThermostatState).includes(input);
}

export enum TimeUnits {
  MILLISECONDS = 'MILLISECONDS',
  SECONDS = 'SECONDS',
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
}

export function isValidTimeUnits(input: TimeUnits): boolean {
  return Object.values(TimeUnits).includes(input);
}

export enum ScheduleType {
  INTERVAL = 'INTERVAL',
  CRON = 'CRON',
}

export enum TemperatureUnits {
  CELSIUS = 'C',
  FAHRENHEIT = 'F',
}

export function isValidTemperatureUnits(input?: TemperatureUnits): boolean {
  return input === undefined || Object.values(TemperatureUnits).includes(input);
}

export enum WebhookCommand {
  Brightness = 'Brightness',
  LockTargetState = 'LockTargetState',
  On = 'On',
  TargetHeatingCoolingState = 'TargetHeatingCoolingState',
  TargetPosition = 'TargetPosition',
  TargetTemperature = 'TargetTemperature',
}

export function printableValues<T>(o: { [s: string]: T; } | ArrayLike<T>): string {
  return Object.values(o).map(value => `'${value}'`).join(', ');
}