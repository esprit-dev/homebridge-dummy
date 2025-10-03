
<p align="center">
<img src="https://raw.githubusercontent.com/mpatfield/homebridge-dummy/refs/heads/latest/img/banner.png" width="600">
</p>

<span align="center">

# homebridge-dummy

Homebridge plugin to create fake accessories for assisting with advanced Apple HomeKit automations

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![hoobs-certified](https://badgen.net/badge/HOOBS/certified/yellow)](https://plugins.hoobs.org/plugin/homebridge-dummy)\
[![npm](https://img.shields.io/npm/dw/homebridge-dummy)](https://www.npmjs.com/package/homebridge-dummy)
[![npm](https://img.shields.io/npm/dt/homebridge-dummy)](https://www.npmjs.com/package/homebridge-dummy)\
[![Discord](https://img.shields.io/discord/432663330281226270?color=728ED5&logo=discord&label=discord)](https://discord.com/channels/432663330281226270/1406798847279366214)


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

With this plugin, you can create any number of fake accessories which are useful for advanced automation with HomeKit scenes. Features include scheduling to trigger at a specific interval or times, resetting automatically after a delay, activating sensors such as motion or occupancy, running arbitrary commands such as cron, and more.

Currently, Doors, Lightbulbs, Locks, Outlets, Switches, Thermostats, Windows, and Blinds are supported. If there is a particular device or feature you'd like to see, please [create an issue](https://github.com/mpatfield/homebridge-dummy/issues/new?template=new-issue.md).

## Configuration

Using the Homebridge Config UI is the easiest way to set up this plugin. However, if you wish to do things manually then you will need to add the following to your Homebridge `config.json`:

```json
{
    "name": "Homebridge Dummy",
    "accessories": [
        {
            "id": "string",
            "name": "string",
            "type": "Door | Lightbulb | LockMechanism | Outlet | Switch | Thermostat | Window | WindowCovering",
            "groupName": "string",
            "timer": {
                "delay": number,
                "units": "MILLISECONDS | SECONDS | MINUTES | HOURS",
                "random": true | false
            },
            "schedule": {
                "type": "INTERVAL" | "CRON",
                "interval": number,
                "units": "MILLISECONDS | SECONDS | MINUTES | HOURS",
                "random": true | false,
                "cron": "string"
            },
            "sensor": {
                "type": "CarbonDioxideSensor | CarbonMonoxideSensor | ContactSensor | LeakSensor | MotionSensor | OccupancySensor | SmokeSensor",
                "timerControlled": true | false
            },
            "limiter": {
                "id": "string",
                "limit": number,
                "units": "MILLISECONDS | SECONDS | MINUTES | HOURS",
                "period": "HOUR | DAY | WEEK | MONTH",
            },
            "temperatureUnits": "C" | "F",
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
            "enableWebook": true | false,
            "resetOnRestart": true | false,
            "disableLogging": true | false
        }
        …
    ],
    "platform": "HomebridgeDummy"
}
```

All fields are optional unless noted with an asterisk (*)

### General
- `id`* - A unique identifier for the accessory. Changing this value will create a new accessory.
- `name`* - The display name for the accessory in HomeKit
- `type`* - The type of accessory

Valid values for `type` are:
- `Door`
- `Lightbulb`
- `LockMechanism`
- `Outlet`
- `Switch`
- `Thermostat`
- `Window`
- `WindowCovering`

### Group
- `groupName` - Items sharing the same group name will be collected together in the Home app UI

⚠️ Adding/removing/changing the group name will require you to reconfigure any HomeKit scenes or automations

### Timer
Return the accessory to its default value after the specified delay

- `timer.delay` — If defined, the switch will automatically toggle after this many milliseconds/seconds/minutes/hours
- `timer.units` — The units to use for delay above (`MILLISECONDS`, `SECONDS`, `MINUTES`, or `HOURS`). *Required if delay is set.
- `timer.random` — If true, the delay will be randomized with a maximum value of `timer.delay`

### Schedule
Set the accessory to its opposite (non-default) value at specified interval or times

- `schedule.type` — Automatically set the accessory to it's non-default value
- `schedule.interval` — Trigger the accessory after this many milliseconds/seconds/minutes/hours. *Required if `schedule.type` = `INTERVAL`
- `schedule.units` — The units to use for the interval (`MILLISECONDS`, `SECONDS`, `MINUTES`, or `HOURS`) *Required if `schedule.type` = `INTERVAL`
- `schedule.random` — If true, the interval will be randomized with a maximum value of `schedule.interval`
- `schedule.cron` — One of `@secondly`, `@minutely`, `@hourly`, `@daily`, `@weekly`, `@weekdays`, `@weekends`, `@monthly`, `@yearly`, or `CUSTOM_CRON`. *Required if `schedule.type` = `CRON`
- `schedule.cronCustom` - Custom cron string for triggering the accessory. *Required if `schedule.cron` = `CUSTOM_CRON`
    - See [crontab.guru](http://crontab.guru) for help

### Limiter
Restrict the total time this accessory can be set to its non-default value, for each specified period

- `limiter.id` - A random id (such as UUID) for storing the limit. Change this value to reset the limit.
- `limiter.limit` - The total time number of seconds/minutes/hours that this accessory may run for each `period`
- `limiter.units` - The units to use for delay above (`MILLISECONDS`, `SECONDS`, `MINUTES`, or `HOURS`). *Required if limit is set.
- `limiter.period` - How often the limit is reset (`HOUR`, `DAY`, `WEEK`, `MONTH`) *Required if limit is set.
    - `HOUR` is reset at X:00:00, `DAY` at local midnight, `WEEK` on Monday, and `MONTH` on the 1st day

### Sensor
- `sensor.type` - Optionally attach a sensor that mirrors the state of the parent accessory
- `sensor.timerControlled` - If true, sensor will be activated if accessory is reset by timer but not if it is reset manually

Valid values for sensor are:
- `CarbonDioxideSensor`
- `CarbonMonoxideSensor`
- `ContactSensor`
- `LeakSensor`
- `MotionSensor`
- `OccupancySensor`
- `SmokeSensor`

### Commands
Execute arbitrary commands (e.g. curl) when the accessory changes state

- `onCommand` - Arbitrary command to execute when lightbulb/outlet/switch/thermostat turns on
- `offCommand` - Arbitrary command to execute when lightbulb/outlet/switch/thermostat turns off
- `lockCommand` - Arbitrary command to execute when lock mechanism is locked
- `unlockCommand` - Arbitrary command to execute when lock mechanism is unlocked
- `commandTemperature` - Arbitrary command to execute when temperature changes

### Defaults
- `temperatureUnits` - Units to use for thermostats, either 'C' or 'F'
- `defaultOn` — Initial value. Default _ON_ = true, default _OFF_ = false
- `defaultBrightness` — If set, lightbulb will have additional dimmer settings with this default brightness percentage
- `defaultLockState` - The initial value for the lock, "locked" or "unlocked"
- `defaultPosition` — Initial position for the door/window/blinds, "open" or "closed"
- `defaultThermostatState` - The initial state for the thermostat, "auto", "heat", "cool", or "off"
- `defaultTemperature` - The default temperature for the thermostat in `temperatureUnits` defined above

### Options
- `enableWebook` - Turn on webhooks for this accessory. See [Webhooks](https://github.com/mpatfield/homebridge-dummy#webhooks) section below for details.
- `resetOnRestart` _ If true, accessory will return to default state when Homebridge restarts
- `disableLogging` — If true, state changes will not be logged

## Webhooks

You can optionally enable webhooks on an accessory by choosing `Enable Webhooks` in the config UI or setting `enableWebhooks` to `true` in the JSON config.

If at least one accessory has webhooks enabled, then Homebridge Dummy will start a webhook server on startup on port `63743`, e.g. `http://localhost:63743/`

Incoming requests must be valid JSON and include the id of the accessory, the desired command, and the value to set.

For example, to turn a switch on the JSON request should look like this:

```json
{
    "id": "17a62a7b",
    "command": "On",
    "value": true
}
```

Here's how you would call it from the command line.

```
curl -X POST http://localhost:63743/ -H "Content-Type: application/json" -d '{"id": "17a62a7b", "command": "On", "value": true}
```

The accessory `id` can be found in the plugin JSON config.

Here are the possible values for `command` and their respective valid `value`

- `Brightness` - number from 0-100
- `LockTargetState` - 0 (UNSECURED) or 1 (SECURED)
- `On` - true or false
- `TargetHeatingCoolingState` - 0 (OFF), 1 (HEAT), 2 (COOL), 3 (AUTO)
- `TargetPosition` - number from 0-100
- `TargetTemperature` - number between 10°C and 38°C

For `TargetTemperature` you may optionally supply a `unit` (either 'F' or 'C') to allow you to pass in Fahrenheit or Celsius units.

```json
{
    "id": "18a35b6c",
    "command": "TargetTemperature",
    "value": 72,
    "unit": "F"
}
```

## Credits

Special thanks to [@nfarina](https://github.com/sponsors/nfarina) for creating the original version of this plugin and maintaining it for almost 10 (!!!) years

[Keryan Belahcene](https://www.instagram.com/keryan.me) for creating the [Flume](https://github.com/homebridge-plugins/homebridge-flume) banner image which was adapted for use with this plugin

Schedule feature inspired by [Homebridge Schedule](https://github.com/kbrashears5/typescript-homebridge-schedule) by [@kbrashears5](https://github.com/sponsors/kbrashears5)

Sensor feature inspired by [Homebridge-Delay-Switch](https://github.com/nitaybz/homebridge-delay-switch#readme) by [@nitaybz](https://github.com/sponsors/nitaybz)

Command feature inspired by [homebridge-cmdtrigger](https://github.com/hallos/homebridge-cmdtrigger) by [@hallos](https://github.com/sponsors/hallos)

And to the amazing creators/contributors of [Homebridge](https://homebridge.io) who made this plugin possible!