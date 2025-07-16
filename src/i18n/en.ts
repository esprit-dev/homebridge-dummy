const en = {

  accessory: {

    missingRequired: '%s is missing required config variable %s',

    command: {
      executed: '%s executed command',
      error: '%s failed to execute command',
    },

    lightbulb: {
      brightness: '%s brightness is %s',
      stateOn: '%s is on %s%',
    },

    lock: {
      secured: '%s is locked',
      unsecured: '%s is unlocked',
    },

    onOff: {
      stateOn: '%s is on',
      stateOff: '%s is off',
    },

    position: {
      closed: '%s is closed',
      open: '%s is open',
    },

    timer: {
      cancel: 'Cancelled the timer for %s',
      reset: 'Reset the timer for %s',
      setSeconds: '%s is waiting %s seconds',
      setMinutes: '%s is waiting %s minutes',
      setHours: '%s is waiting %s hours',
    },
  },

  config: {
    migrate: 'Are you upgrading from an earlier version?',
    migrationDetails1: 'HomeKit automations using %s accessories will need to be reconfigured!',
    migrationDetails2: 'Please downgrade to v0.9.2 or earlier if you want to keep your current setup.',
    migrationDetails3: '%s can try to recreate your accessories, but you will still need reconfigure HomeKit automations.',
    migrationDetails4: 'Would you like to recreate your accessories now?',
    migrationDetails5: 'For more details, please visit %s',
    migrationRestartTitle: 'Restart Homebridge',
    migrationRestartDescription: 'Please restart Homebridge to begin %s migration',
    support: 'For documentation and support please visit %s',
    thankYou: 'Thank you for installing %s',
    yes: 'Yes',
    no: 'No',

    description: {
      commands: 'Execute arbitration commands when the accessory changes state',
      random: 'Delay will be randomized with the above value as a maximum',
      timer: 'Optional settings to automatically toggle the accessory',
    },

    enumNames: {
      carbonDioxideSensor:'Carbon Dioxide',
      carbonMonoxideSensor: 'Carbon Monoxide',
      closed: 'Closed',
      contactSensor: 'Contact',
      door: 'Door',
      hours: 'Hours',
      leakSensor: 'Leak',
      lightbulb: 'Lightbulb',
      lockMechanism: 'Lock',
      off: 'Off',
      occupancySensor: 'Occupancy',
      on: 'On',
      open: 'Open',
      outlet: 'Outlet',
      minutes: 'Minutes',
      motionSensor: 'Motion',
      seconds: 'Seconds',
      secured: 'Locked',
      smokeSensor: 'Smoke',
      switch: 'Switch',
      unsecured: 'Unlocked',
      window: 'Window',
      windowCovering: 'Window Convering (Blinds)',
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
      defaultBrightness: 'Default Brightness',
      defaultPosition: 'Default Position',
      defaultState: 'Default State',
      delay: 'Delay',
      disableLogging: 'Disable Logging',
      groupName: 'Group Name (Beta)',
      name: 'Name',
      options: 'Additional Settings',
      resetOnRestart: 'Reset on Restart',
      timer: 'Timer',
      sensor: 'Attach Sensor',
      type: 'Type',
      units: 'Units',
      random: 'Random',
    },
  },

  sensor: {

    carbonDioxide: {
      active: '%s detected carbon dioxide',
      inactive: '%s stopped detecting carbon dioxide',
    },

    carbonMonoxide: {
      active: '%s detected carbon monoxide',
      inactive: '%s stopped detecting carbon monoxide',
    },

    contact: {
      active: '%s detected contact',
      inactive: '%s stopped detecting contact',
    },

    leak: {
      active: '%s detected a leak',
      inactive: '%s stopped detecting leaks',
    },

    motion: {
      active: '%s detected motion',
      inactive: '%s stopped detecting motion',
    },

    occupancy: {
      active: '%s detected occupancy',
      inactive: '%s stopped detecting occupancy',
    },

    smoke: {
      active: '%s detected smoke',
      inactive: '%s stopped detecting smoke',
    },
  },

  startup: {
    migrationBridge: '‼️ Please restart Homebridge one more time for migration to take full effect ‼️',
    migrationComplete: 'Successfully migrated %s accessories!',
    migrationNoAccessories: 'Unable to find any accessories to migrate',
    migrationIgnore: 'You may safely ignore \'No plugin was found…\' errors — they should go away the next time you restart Homebridge',
    migrationFailed: 'Sorry, something went wrong with the accessory migration',
    migrationRevert: 'If you encounter problems, you can find a backup config.json.bak in your Homebridge directory',
    newAccessory: 'Adding new accessory:',
    removeAccessory: 'Removing accessory:',
    restoringAccessory: 'Restoring accessory:',
    setupComplete: '✓ Setup complete',
    unsupportedType: 'Unsupported accessory type %s',
    welcome: [
      'Please ★ this plugin on GitHub if you\'re finding it useful! https://github.com/mpatfield/homebridge-dummy',
      'Would you like to sponsor this plugin? https://github.com/sponsors/mpatfield',
      'Please rate us on HOOBS! https://plugins.hoobs.org/plugin/homebridge-dummy',
      'Want to see this plugin in your own language? Please visit https://github.com/mpatfield/homebridge-dummy/issues/105',
    ],
  },
};

export default en;