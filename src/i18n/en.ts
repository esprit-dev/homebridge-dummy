const en = {

  accessory: {

    invalidCron: '%s has an invalid cron expression %s', // accessory name, cron string
    missingRequired: '%s is missing required config variable %s', // accessory name, variable name
    badValueType: '%s expected type %s but was %s', // accessory name, variable type, variable type

    command: {
      executed: '%s executed command', // accessory name
      error: '%s failed to execute command', // accessory name
    },

    lightbulb: {
      brightness: '%s brightness is %s%', // accessory name, number
      stateOn: '%s is on, brightness is %s%', // accessory name, number
    },

    lock: {
      secured: '%s is locked', // accessory name
      unsecured: '%s is unlocked', // accessory name
    },

    onOff: {
      stateOn: '%s is on', // accessory name
      stateOff: '%s is off', // accessory name
    },

    position: {
      closed: '%s is closed', // accessory name
      open: '%s is open', // accessory name
    },

    thermostat: {
      auto: '%s set to Auto', // accessory name
      cool: '%s set to Cool', // accessory name
      heat: '%s set to Heat', // accessory name
      off: '%s set to Off', // accessory name
      temperatureC: '%s set to %s°C', // accessory name, number
      temperatureF: '%s set to %s°F', // accessory name, number
      unsupportedFunction: '%s is unsupported for thermostats', // function name
    },

    timer: {
      cancel: 'Cancelled the timer for %s', // accessory name
      setMilliseconds: '%s is waiting %s milliseconds', // accessory name, number
      setSeconds: '%s is waiting %s seconds', // accessory name, number
      setMinutes: '%s is waiting %s minutes',  // accessory name, number
      setHours: '%s is waiting %s hours', // accessory name, number
    },

    schedule: {
      cron: '%s starting schedule cronjob', // accessory name
      intervalMilliseconds: '%s scheduled for %s milliseconds', // accessory name, number
      intervalSeconds: '%s scheduled for %s seconds', // accessory name, number
      intervalMinutes: '%s scheduled for %s minutes', // accessory name, number
      intervalHours: '% scheduled for %s hours', // accessory name, number
    },
  },

  config: {
    migrate: 'Are you upgrading from an earlier version?',
    migrationDetails1: 'HomeKit scenes and automations using %s accessories will need to be reconfigured!', // plugin name
    migrationDetails2: 'Please downgrade to v0.9.2 or earlier if you want to keep your current setup.',
    migrationDetails3: '%s can try to recreate your accessories, but you will still need reconfigure HomeKit scenes and automations.', // plugin name
    migrationDetails4: 'Would you like to recreate your accessories now?',
    migrationDetails5: 'For more details, please visit %s', // url
    migrationRestartTitle: 'Restart Homebridge',
    migrationRestartDescription: 'Please restart Homebridge to begin %s migration', // plugin name
    support: 'For documentation and support please visit %s', // url
    thankYou: 'Thank you for installing %s', // plugin name
    yes: 'Yes',
    no: 'No',

    description: {
      commands: 'Execute arbitrary commands (e.g. curl) when the accessory changes state',
      cron: 'Visit crontab.guru for help',
      random: 'Time will be randomized with the above value as a maximum',
      timerControlled: 'Instead of mirroring accessory, sensor will be activated when accessory auto-resets',
      timer: 'Return the accessory to its default value after the specified delay',
      schedule: 'Set the accessory to its opposite (non-default) value at specified interval or times',
    },

    enumNames: {
      auto: 'Auto',
      carbonDioxideSensor:'Carbon Dioxide',
      carbonMonoxideSensor: 'Carbon Monoxide',
      celsius: '°C',
      closed: 'Closed',
      contactSensor: 'Contact',
      cool: 'Cool',
      cron: 'Cron',
      custom: 'Custom',
      daily: 'Daily',
      door: 'Door',
      fahrenheit: '°F',
      heat: 'Heat',
      hourly: 'Hourly',
      hours: 'Hours',
      interval: 'Interval',
      leakSensor: 'Leak',
      lightbulb: 'Lightbulb',
      lockMechanism: 'Lock',
      minutely: 'Every Minute',
      monthly: 'Monthly',
      off: 'Off',
      occupancySensor: 'Occupancy',
      on: 'On',
      open: 'Open',
      outlet: 'Outlet',
      milliseconds: 'Milliseconds',
      minutes: 'Minutes',
      motionSensor: 'Motion',
      secondly: 'Every Second',
      seconds: 'Seconds',
      secured: 'Locked',
      smokeSensor: 'Smoke',
      switch: 'Switch',
      thermostat: 'Thermostat',
      unsecured: 'Unlocked',
      weekdays: 'Weekdays',
      weekends: 'Weekends',
      weekly: 'Weekly',
      window: 'Window',
      windowCovering: 'Window Convering (Blinds)',
      yearly: 'Annually',
    },

    title: {
      accessory: 'Accessory',
      commands: 'Commands',
      commandClose: 'Close Command',
      commandOn: 'On Command',
      commandOff: 'Off Command',
      commandOpen: 'Open Command',
      commandLock: 'Lock Command',
      commandUnlock: 'Unlock Command',
      commandTemperature: 'Temperature Changed Command',
      cron: 'Cron',
      cronCustom: 'Custom Cron',
      defaultBrightness: 'Default Brightness',
      defaultPosition: 'Default Position',
      defaultState: 'Default State',
      defaultTemperature: 'Default Temperature',
      delay: 'Delay',
      disableLogging: 'Disable Logging',
      groupName: 'Group Name',
      interval: 'Interval',
      name: 'Name',
      preset: 'Preset',
      resetOnRestart: 'Reset on Restart',
      timer: 'Auto-Reset Timer',
      timerControlled: 'Activate Sensor on Auto-Reset',
      schedule: 'Schedule',
      sensor: 'Attach Sensor',
      type: 'Type',
      units: 'Units',
      random: 'Randomize',
    },
  },

  sensor: {

    carbonDioxide: {
      active: '%s detected carbon dioxide', // accessory name
      inactive: '%s stopped detecting carbon dioxide', // accessory name
    },

    carbonMonoxide: {
      active: '%s detected carbon monoxide', // accessory name
      inactive: '%s stopped detecting carbon monoxide', // accessory name
    },

    contact: {
      active: '%s detected contact', // accessory name
      inactive: '%s stopped detecting contact', // accessory name
    },

    leak: {
      active: '%s detected a leak', // accessory name
      inactive: '%s stopped detecting leaks', // accessory name
    },

    motion: {
      active: '%s detected motion', // accessory name
      inactive: '%s stopped detecting motion', // accessory name
    },

    occupancy: {
      active: '%s detected occupancy', // accessory name
      inactive: '%s stopped detecting occupancy', // accessory name
    },

    smoke: {
      active: '%s detected smoke', // accessory name
      inactive: '%s stopped detecting smoke', // accessory name
    },
  },

  startup: {
    migrationBridge: '‼️ Please restart Homebridge one more time for migration to take full effect ‼️',
    migrationComplete: 'Successfully migrated %s accessories!', // number
    migrationNoAccessories: 'Unable to find any accessories to migrate',
    migrationIgnore: 'You may safely ignore \'No plugin was found…\' errors — they should go away the next time you restart Homebridge',
    migrationFailed: 'Sorry, something went wrong with the accessory migration',
    migrationRevert: 'If you encounter problems, you can find a backup config.json.bak in your Homebridge directory',
    newAccessory: 'Adding new accessory:',
    removeAccessory: 'Removing accessory:',
    restoringAccessory: 'Restoring accessory:',
    setupComplete: '✓ Setup complete',
    unsupportedType: 'Unsupported accessory type %s', // accessory type
    welcome: [
      'Please ★ this plugin on GitHub if you\'re finding it useful! https://github.com/mpatfield/homebridge-dummy',
      'Would you like to sponsor this plugin? https://github.com/sponsors/mpatfield',
      'Please rate us on HOOBS! https://plugins.hoobs.org/plugin/homebridge-dummy',
      'Want to see this plugin in your own language? Please visit https://github.com/mpatfield/homebridge-dummy/issues/105',
    ],
  },
};

export default en;