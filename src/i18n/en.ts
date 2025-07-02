const en = {

  accessory: {

    missingRequired: '%s is missing required config variable %s',

    lightbulb: {
      brightness: '%s brightness is %s',
      stateOn: '%s is on %s%',
    },

    onOff: {
      stateOn: '%s is on',
      stateOff: '%s is off',
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
    migrationDetails1: 'There are significant code changes in this version',
    migrationDetails2: 'HomeKit automations using %s accessories will need to be reconfigured!',
    migrationDetails3: '%s will try to migrate your accessories so they won\'t need to be recreated in Homebridge',
    migrationDetails4: 'Would you like to migrate now?',
    migrationDetails5: 'For more details, please visit %s',
    migrationRestartTitle: 'Restart Homebridge',
    migrationRestartDescription: 'Please restart Homebridge to begin %s migration',
    support: 'For documentation and support please visit %s',
    thankYou: 'Thank you for installing %s',
    yes: 'Yes',
    no: 'No',

    description: {
      random: 'Delay will be randomized with the above value as a maximum',
      timer: 'Optional settings to automatically toggle the accessory',
    },

    enumNames: {
      hours: 'Hours',
      lightbulb: 'Lightbulb',
      minutes: 'Minutes',
      seconds: 'Seconds',
      switch: 'Switch',
    },

    title: {
      accessory: 'Accessory',
      defaultBrightness: 'Default Brightness',
      defaultOn: 'Default to On',
      delay: 'Delay',
      disableLogging: 'Disable Logging',
      name: 'Name',
      options: 'Additional Settings',
      resetOnRestart: 'Reset on Restart',
      timer: 'Timer',
      type: 'Type',
      units: 'Units',
      random: 'Random',
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