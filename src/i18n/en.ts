const en = {

  brightness: {
    set: 'Brightness = %s',
  },

  config: {

    continue: 'Continue %s',
    migrate: 'Are you upgrading from an earlier version?',
    migrationDetails1: 'Please restart %s TWICE and we will try to migrate your plugins.',
    migrationDetails2: 'For more details, please visit %s.',
    support: 'For documentation and support please visit %s',
    thankYou: 'Thank you for installing %s',
    yes: 'Yes',
    no: 'No',

    description: {
      brightness: 'Starting brightness',
      dimmer: 'Make the switch a dimmer instead of a toggle (on/off) switch',
      disableLogging: 'No state change information (On/Off) will be logged',
      name: 'Name',
      legacyAccessories: 'TODO',
      random: 'Randomize the time until a switch turns off',
      resettable: 'The timer will reset each time the switch is turned on',
      reverse: 'The switch\'s default state is on',
      stateful: 'The switch remains on instead of being automatically turned off',      
      time: 'The switch will turn off after this number of milliseconds',
    },

    title: {
      brightness: 'Brightness',
      dimmer: 'Dimmer',
      disableLogging: 'Disable Logging',
      name: 'Name',
      legacyAccessories: 'Legacy Accessories',
      legacyAccessory: 'Legacy Accessory',
      random: 'Random',
      resettable: 'Resettable',
      reverse: 'Reverse',
      stateful: 'Stateful',      
      time: 'Time',
    },
  },

  info: {
    dimmer: 'Dummy Dimmer',
    switch: 'Dummy Switch',
  },

  startup: {
    migrationComplete: 'Legacy accessories have been successfully migrated! Please restart %s now to see your accessories.',
    migrationFailed: 'Sorry, something went wrong with the migration of legacy accessories.',
    migrationRevert: 'If you encounter problems, you can find a backup config.json.bak in your Homebridge directory.',
    newAccessory: 'Adding new accessory:',
    removeAccessory: 'Removing accessory:',
    restoringAccessory: 'Restoring accessory:',
    setupComplete: '✓ Setup complete',
    welcome: [
      'Please ★ this plugin on GitHub if you\'re finding it useful! https://github.com/mpatfield/homebridge-dummy',
      'Would you like to sponsor this plugin? https://github.com/sponsors/mpatfield',
      'Please rate us on HOOBS! https://plugins.hoobs.org/plugin/homebridge-dummy',
      'Want to see this plugin in your own language? Please visit https://github.com/mpatfield/homebridge-dummy/issues/105',
    ],
  },

  switch: {
    delay_ms: 'Delaying %sms…',
    delay_s: 'Delaying %ss…',
    off: 'Off',
    on: 'On',
  },
};

export default en;