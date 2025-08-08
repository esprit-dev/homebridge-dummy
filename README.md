
<p align="center">
<img src="https://github.com/mpatfield/homebridge-dummy/blob/latest/img/banner.png?raw=true" width="600">
</p>

<span align="center">

# homebridge-dummy

Homebridge plugin to create fake accessories for assisting with advanced Apple HomeKit automations

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![hoobs-certified](https://badgen.net/badge/HOOBS/certified/yellow)](https://plugins.hoobs.org/plugin/homebridge-dummy)
[![npm](https://img.shields.io/npm/dw/homebridge-dummy)](https://www.npmjs.com/package/homebridge-dummy)
[![npm](https://img.shields.io/npm/dt/homebridge-dummy)](https://www.npmjs.com/package/homebridge-dummy)

</span>

## Disclaimer

Any issues or damage resulting from use of this plugin are not the fault of the developer. Use at your own risk.

## v1.0 Migration

### tl;dr

‼️ There are significant code changes between v0.9 and v1.0 which means you will need to reconfigure HomeKit automations after upgrading. Homebridge Dummy will try to help migrate old accessories.

### Why?

The original HomebridgeDummy was written almost 10 years ago and uses the now deprecated [Accessory Plugin](https://developers.homebridge.io/#/api/accessory-plugins) architecture.

While this still works okay for now, migrating the code to use [Platform Plugins](https://developers.homebridge.io/#/api/platform-plugins) will future-proof Homebridge Dummy and allow for more modern and robust design patterns.

The architecture used in v1.0 will make it much easier to improve and extend this plugin going forward and already includes several new features.

### Drawbacks

Unfortunately, there is no built-in way to migrate existing accessory plugins to platform plugins. This means that all accessories will be considered "new" by HomeKit, so any existing automations or room setups will be lost.

However, Homebridge Dummy will try to help migrate the accessory configurations to the new system to prevent you having to set them all up again in Homebridge.

### Migration Flow

⚠️ Please make sure to restart both Homebridge Service AND Homebridge UI after upgrading to v1.0 or you will experience issues with Homebridge Dummy configuration.

Once you have installed v1.0, click on the icon to configure the Homebridge Dummy plugin in the Homebridge UI and it will walk you through the necessary questionnaire.

Alternatively, you can add the following to "platforms" in your config.json

```json
{
    "name": "Homebridge Dummy",
    "platform": "HomebridgeDummy",
    "migrationNeeded": true
}
```

You will need to restart Homebridge after completing the flow for changes to take effect.

⚠️ If you are using child bridges with v0.9, you may need to restart Homebridge _twice_ for migrated accessories to show up correctly.

You may safely ignore any "No plugin was found…" errors you see in the Homebridge logs. These should go away after a few Homebridge restarts.

### Problems?

This is an experimental flow and may not work as intended. If you see "Sorry, something went wrong with the accessory migration" or encounter other issues, please [create an issue](https://github.com/mpatfield/homebridge-dummy/issues/new?template=new-issue.md).

The first thing the flow does is create a backup called `config.json.bak` in your Homebridge directory. If all else fails, you can replace your `config.json` with the backup and downgrade to Homebridge Dummy v0.9 to restore your previous accessories.

## About

With this plugin, you can create any number of fake accessories that will do nothing when triggered. This can be very useful for advanced automation with HomeKit scenes.

Currently, only Lightbulbs, Locks, Outlets, and Switches are supported. If there is a particular device you'd like to see supported, please [create an issue](https://github.com/mpatfield/homebridge-dummy/issues/new?template=new-issue.md).

## Configuration

Using the Homebridge Config UI is the easiest way to set up this plugin. However, if you wish to do things manually then you will need to add the following to your Homebridge `config.json`:

```json
{
    "name": "Homebridge Dummy",
    "accessories": [
        {
            "id": "string",
            "name": "string",
            "type": "Door | Lightbulb | LockMechanism | Outlet | Switch | Thermostat | Window | WindoCovering",
            "groupName": "string",
            "timer": {
                "delay": number,
                "units": "MILLISECONDS | SECONDS | MINUTES | HOURS",
                "random": true | false
            },
            "trigger": {
                "type": "INTERVAL" | "CRON",
                "interval": number,
                "units": "MILLISECONDS | SECONDS | MINUTES | HOURS",
                "random": true | false,
                "cron": "string"
            },
            "sensor": "CarbonDioxideSensor | CarbonMonoxideSensor | ContactSensor | LeakSensor | MotionSensor | OccupancySensor | SmokeSensor",
            "temperatureUnits": "C" | "F",
            "fade": true | false,
            "defaultOn": true | false,
            "defaultBrightness": 0-100,
            "defaultLockState": "locked" | "unlocked",
            "defaultPosition": "open" | "closed",
            "defaultThermostatState": "auto" | "heat" | "cool" | "off",
            "defaultTemperature": number,
            "commandOn": "string",
            "commandOff": "string",
            "commandLock": "string",
            "commandUnlock": "string",
            "commandOpen": "string",
            "commandClose": "string",
            "commandTemperature": "string",
            "resetOnRestart": true | false,
            "disableLogging": true | false
        }
        // ...additional accessories...
    ],
    "platform": "HomebridgeDummy"
}
```

All fields are optional unless noted with an asterisk (*)

- `id`* - A unique identifier for the accessory. Changing this value will create a new accessory.

- `name`* - The display name for the accessory in HomeKit
- `type`* - The type of accessory: `Door`, `Lightbulb`, `LockMechanism`, `Outlet`, `Switch`, `Thermostat`, `Window`, or `WindowCovering`

- `groupName` - (Beta) Items sharing the same group name will be collected together in the Home app UI
    - ⚠️ Adding/removing/changing the group name will require you to reconfigure any HomeKit scenes or automations

- `timer.delay` — If defined, the switch will automatically toggle after this many milliseconds/seconds/minutes/hours
- `timer.units` — The units to use for delay above (`MILLISECONDS`, `SECONDS`, `MINUTES`, or `HOURS`). *Required if delay is set.
- `timer.random` — If true, the delay will be randomized with a maximum value of `timer.delay`

- `trigger.type` — Automatically set the accessory to it's non-default value
- `trigger.interval` — Trigger the accessory after this many milliseconds/seconds/minutes/hours. *Required if `trigger.type` = `INTERVAL`
- `trigger.units` — The units to use for the interval (`MILLISECONDS`, `SECONDS`, `MINUTES`, or `HOURS`) *Required if `trigger.type` = `INTERVAL`
- `trigger.random` — If true, the interval will be randomized with a maximum value of `trigger.interval`
- `trigger.cron` — The cron string for triggering the accessory.  *Required if `trigger.type` = `CRON`
    - See [crontab.guru](http://crontab.guru) for help

- `sensor` - Optionally attach a sensor that mirrors the state of the parent accessory
    - Only works with `Lightbulb`, `Outlet`, and `Switch`
    - Valid values are `CarbonDioxideSensor`, `CarbonMonoxideSensor`, `ContactSensor`, `LeakSensor`, `MotionSensor`, `OccupancySensor`, or `SmokeSensor`

- `temperatureUnits` - Units to use for thermostats, either 'C' or 'F'

- `fade` — If true, dimmer lightbulbs will fade gradually over the specified time interval. *Requires `timer` to be defined.

- `defaultOn` — Initial value. Default _ON_ = true, default _OFF_ = false

- `defaultBrightness` — If set, lightbulb will have additional dimmer settings with this default brightness percentage

- `defaultLockState` - The initial value for the lock, "locked" or "unlocked"

- `defaultPosition` — Initial position for the door/window/blinds, "open" or "closed"

- `defaultThermostatState` - The initial state for the thermostat, "auto", "heat", "cool", or "off"

- `defaultTemperature` - The default temperature for the thermostat in `temperatureUnits` defined above

- `onCommand` - Arbitraty command to execute when lightbulb/outlet/switch/thermostat turns on
- `offCommand` - Arbitraty command to execute when lightbulb/outlet/switch/thermostat turns off

- `lockCommand` - Arbitraty command to execute when lock mechanism is locked
- `unlockCommand` - Arbitraty command to execute when lock mechanism is unlocked

- `commandTemperature` - Arbitrary command to execute when temperature changes

- `resetOnRestart` _ If true, accessory will return to default state when Homebridge restarts

- `disableLogging` — If true, state changes will not be logged

## Examples

### Stateful Switch
```json
{
    "name": "Stateful",
    "type": "Switch"
}
```

### Timer Switch
```json
{
    "name": "Timer",
    "type": "Switch",
    "timer": {
        "delay": 10,
        "units": "SECONDS"
    }
}
```

### "Reversed" Switch (i.e. Default On)
```json
{
    "name": "Default On",
    "type": "Switch",
    "timer": {
        "delay": 5,
        "units": "SECONDS"
    },
    "defaultOn": true
}
```

### Timer Lightbulb
```json
{
    "name": "Lightbulb",
    "type": "Lightbulb",
    "timer": {
        "delay": 5,
        "units": "SECONDS"
    }
}
```

### Stateful Dimmer Lightbulb
```json
{
    "name": "Dimmer",
    "type": "Lightbulb",
    "defaultBrightness": 42
}
```

### Random Timer Switch
```json
{
    "name": "Random",
    "type": "Switch",
    "timer": {
        "delay": 2,
        "units": "MINUTES",
        "random": true
    }
}
```

### Lock
```json
{
    "name": "Lock",
    "type": "LockMechanism",
    "timer": {
        "delay": 10,
        "units": "MINUTES"
    },
    "defaultLockState": "locked"
}
```

### Motion Sensor Switch
```json
{
    "name": "Motion Switch",
    "type": "Switch",
    "timer": {
        "delay": 3,
        "units": "MINUTES"
    },
    "sensor": "MotionSensor"
}
```

### Door
```json
{
    "name": "Door",
    "type": "Door",
    "timer": {
        "delay": 20,
        "units": "SECONDS"
    },
    "defaultPosition": "closed"
}
```

### Group
```json
{
    "name": "Outlet 1",
    "type": "Outlet",
    "groupName": "Powerstrip"
},
{
    "name": "Outlet 2",
    "type": "Outlet",
    "groupName": "Powerstrip"
}
{
    "name": "Outlet 3",
    "type": "Outlet",
    "groupName": "Powerstrip"
}
```

### Hourly Trigger Switch
```json
{
    "name": "Hourly",
    "type": "Switch",
    "timer": {
        "delay": 1,
        "units": "SECONDS"
    },
    "trigger": {
        "type": "INTERVAL",
        "interval": 1,
        "units": "HOURS"
    }
}
```

### Thermostat
```json
{
    "name": "Thermostat",
    "type": "Thermostat",
    "temperatureUnits": "F",
    "defaultThermostatState": "heat",
    "defaultTemperature": 78
}
```

## Credits

Special thanks to [@nfarina](https://github.com/sponsors/nfarina) for creating the original version of this plugin and maintaining it for almost 10 (!!!) years

[Keryan Belahcene](https://www.instagram.com/keryan.me) for creating the [Flume](https://github.com/homebridge-plugins/homebridge-flume) banner image which was adapted for use with this plugin

Auto-Trigger feature inspired by [Homebridge Schedule](https://github.com/kbrashears5/typescript-homebridge-schedule) by [@kbrashears5](https://github.com/sponsors/kbrashears5)

And to the amazing creators/contributors of [Homebridge](https://homebridge.io) who made this plugin possible!