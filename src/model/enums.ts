export enum AccessoryType {
  Door = 'Door',
  GarageDoorOpener = 'GarageDoorOpener',
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

export enum ConditionOperator {
  AND = 'and',
  OR = 'or'
}

export enum OnState {
  ON = 'on',
  OFF = 'off',
}

export function isValidOnState(input?: OnState): boolean {
  return input === undefined || Object.values(OnState).includes(input);
}

export enum LockState {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
}

export function isValidLockState(input?: LockState): boolean {
  return input === undefined || Object.values(LockState).includes(input);
}

export enum Position {
  OPEN = 'open',
  CLOSED = 'closed',
}

export function isValidPosition(input?: Position): boolean {
  return input === undefined || Object.values(Position).includes(input);
}

export type AccessoryState = OnState | Position | LockState;

export function getStateType(input: AccessoryState): typeof OnState | typeof LockState | typeof Position | undefined {

  if (isValidOnState(input as OnState)) {
    return OnState;
  }

  if (isValidPosition(input as Position)) {
    return Position;
  }

  if (isValidLockState(input as LockState)) {
    return LockState;
  }
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

export enum TimePeriod {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
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
  TargetDoorState = 'TargetDoorState',
  TargetHeatingCoolingState = 'TargetHeatingCoolingState',
  TargetPosition = 'TargetPosition',
  TargetTemperature = 'TargetTemperature',
}

export function printableValues<T>(o: { [s: string]: T; } | ArrayLike<T>): string {
  return Object.values(o).map(value => `'${value}'`).join(', ');
}