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

export enum DefaultThermostatState {
  OFF = 'off',
  COOL = 'cool',
  HEAT = 'heat',
  AUTO = 'auto',
}

export enum TimeUnits {
  MILLISECONDS = 'MILLISECONDS',
  SECONDS = 'SECONDS',
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
}

export enum ScheduleType {
  INTERVAL = 'INTERVAL',
  CRON = 'CRON',
}

export enum TemperatureUnits {
  CELSIUS = 'C',
  FAHRENHEIT = 'F',
}