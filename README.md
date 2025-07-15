
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

‼️ There are significant code changes between v0.9 and v1.0 which means you will need to reconfigure HomeKit automations after upgrading. Homebridge Dummy will try to migrate old accessories in Homebridge so you don't need to recreate everything.

### Why?

The original HomebridgeDummy was written almost 10 years ago and uses the now deprecated [Accessory Plugin](https://developers.homebridge.io/#/api/accessory-plugins) architecture.

While this still works okay for now, migrating the code to use [Platform Plugins](https://developers.homebridge.io/#/api/platform-plugins) will future-proof Homebridge Dummy and allow for more modern and robust design patterns.

v1.0 doesn't include any new features but will make it much easier to improve and extend this plugin going forward.

### Drawbacks

Unfortunately, there is no built-in way to migrate existing accessory plugins to platform plugins. This means that all accessories will be considered "new" by HomeKit, so any existing automations or room setups will be lost.

However, Homebridge Dummy will try to migrate the accessory configurations to the new system to prevent you having to set them all up again in Homebridge.

### Migration Flow

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

⚠️ If you are using child bridges with v0.9, you will need to restart Homebridge _twice_ for migrated accessories to show up correctly.

You may safely ignore any "No plugin was found…" errors you see in the Homebridge logs. These should go away after a few Homebridge restarts.

### Problems?

This is a highly experimental flow and may not work as intended. If you see "Sorry, something went wrong with the accessory migration" or encounter other issues, please [create an issue](https://github.com/mpatfield/homebridge-dummy/issues/new?template=new-issue.md).

The first thing the flow does is create a backup called `config.json.bak` in your Homebridge directory. If all else fails, you can replace your `config.json` with the backup and downgrade to Homebridge Dummy v0.9 to restore everything back to normal.

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
            "type": "Door | Lightbulb | LockMechanism | Outlet | Switch | Window | WindoCovering",
            "timer": {
                "delay": number,
                "units": "SECONDS | MINUTES | HOURS",
                "random": true | false
            },
            "sensor": "CarbonDioxideSensor | CarbonMonoxideSensor | ContactSensor | LeakSensor | MotionSensor | OccupancySensor | SmokeSensor",
            "defaultOn": true | false,
            "defaultBrightness": 0-100,
            "defaultLockState": "locked" | "unlocked",
            "defaultPosition": "open" | "closed",
            "onCommand": "string",
            "offCommand": "string",
            "lockCommand": "string",
            "unlockCommand": "string",
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
- `type`* - The type of accessory: `Door`, `Lightbulb`, `LockMechanism`, `Outlet`, `Switch`, `Window`, or `WindowCovering`

- `timer.delay` — If defined, the switch will automatically toggle after this many seconds/minutes/hours
- `timer.units` — The units to use for delay above (`SECONDS`, `MINUTES`, or `HOURS`). *Required if delay is set.
- `timer.random` — If true, the delay will be randomized with a maximum value of `timer.delay`

- `sensor` - Optionally attach a sensor that mirrors the state of the parent accessory
    - Only works with `Lightbulb`, `Outlet`, and `Switch`
    - Valid values are `CarbonDioxideSensor`, `CarbonMonoxideSensor`, `ContactSensor`, `LeakSensor`, `MotionSensor`, `OccupancySensor`, or `SmokeSensor`

- `defaultOn` — Initial value. Default _ON_ = true, default _OFF_ = false

- `defaultBrightness` — If set, lightbulb will have additional dimmer settings with this default brightness percentage

- `defaultLockState` - The initial value for the lock, "locked" or "unlocked"

- `defaultPosition` — Initial position for the door/window/blinds, "open" or "closed"

- `onCommand` - Arbitraty command to execute when lightbulb/outlet/switch turns on
- `offCommand` - Arbitraty command to execute when lightbulb/outlet/switch turns off

- `lockCommand` - Arbitraty command to execute when lock mechanism is locked
- `unlockCommand` - Arbitraty command to execute when lock mechanism is unlocked

- `resetOnRestart` _ If true, all values return to defaults when Homebridge restarts. Ignored when timer is defined.

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
    "defaultOn: true
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

## Credits

Special thanks to [@nfarina](https://github.com/nfarina) for creating the original version of this plugin and maintaining it for almost 10 (!!!) years

[Keryan Belahcene](https://www.instagram.com/keryan.me) for creating the [Flume](https://github.com/homebridge-plugins/homebridge-flume) banner image which was adapted for use with this plugin

And to the amazing creators/contributors of [Homebridge](https://homebridge.io) who made this plugin possible!