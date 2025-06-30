const en = {

  accessory: {

    missingRequired: '%s is missing required config variable %s',

    lightbulb: {
      brightness: '%s brightness is %s',
      stateOn: '%s is on with brightness %s%',
    },

    onOff: {
      stateOn: '%s is on',
      stateOff: '%s is off',
    },

    timer: {
      cancel: '%s cancelled the timer',
      reset: '%s reset the timer',
      setSeconds: '%s is waiting %s seconds',
      setMinutes: '%s is waiting %s minutes',
      setHours: '%s is waiting %s hours',
    },
  },

  config: {
    migrate: 'Are you upgrading from an earlier version?',
    migrationDetails1: 'Please restart %s TWICE and we will try to migrate your existing accessories.',
    migrationDetails2: 'For more details, please visit %s.',
    support: 'For documentation and support please visit %s',
    thankYou: 'Thank you for installing %s',
    yes: 'Yes',
    no: 'No',

    description: {
    },

    title: {
      accessories: 'Accessories',
      accessory: 'Accessory',
      disableLogging: 'Disable Logging',
      name: 'Name',
    },
  },

  startup: {
    migrationComplete: 'Accessories have been successfully migrated!',
    migrationFailed: 'Sorry, something went wrong with the accessory migration.',
    migrationRevert: 'If you encounter problems, you can find a backup config.json.bak in your Homebridge directory.',
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