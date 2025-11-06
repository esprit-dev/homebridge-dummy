
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

### HOOBS Users

Homebridge Dummy now requires `customUi` for the config UI to help with migration from older versions, translations, UUID generation and some other useful tools. Unfortunately, HOOBS does not support `customUi`.

If you use HOOBS your current options are:

1. Upgrade to v1.0+ and use Advanced Mode to manually edit the JSON config
2. Continue to use `v0.9.2` which should continue to work for the foreseeable future but won't include any of the new features
3. Migrate your system to Homebridge which is very actively developed and has an engaged community of developers

You may also add a comment on [this ticket](https://github.com/hoobs-org/sidecars/issues/13) to help encourage the HOOBS team to add a "sidecar" for Homebridge Dummy.

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

Currently, Doors, Garage Door Openers, Lightbulbs, Locks, Outlets, Switches, Thermostats, Windows, and Window Coverings are supported. If there is a particular device or feature you'd like to see, please [create an issue](https://github.com/mpatfield/homebridge-dummy/issues/new?template=new-issue.md).

## Configuration

Using the Homebridge Config UI is the easiest way to set up this plugin. However, if you wish to do things manually then you will need to add the following to your Homebridge `config.json`:

```json
{
    "name": "Homebridge Dummy",
    "accessories": [
        {
            "id": "string",
            "name": "string",
            "type": "Door | GarageDoorOpener | Lightbulb | LockMechanism | Outlet | Switch | Thermostat | Window | WindowCovering",
            "groupName": "string",
            "timer": {
                "delay": number,
                "units": "MILLISECONDS | SECONDS | MINUTES | HOURS",
                "random": true | false
            },
            "schedule": {
                "type": "INTERVAL" | "CRON" | "SUNRISE" | "SUNSET" | "DAWN" | "DUSK" | "GOLDEN_HOUR" | "NIGHT",
                "interval": number,
                "units": "MILLISECONDS | SECONDS | MINUTES | HOURS",
                "random": true | false,
                "cron": "string",
                "offset": number,
                "latitude": number,
                "longitude": number
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
            "conditions": {
                "operator": "and | or",
                "operands" [
                    {
                        "accessoryId": "string",
                        "accessoryState": "on | off | open | closed | locked | unlocked",
                        "pattern": "string",
                        "pingHost": "string",
                        "pingInterval": number,
                        "pingUnits": "MILLISECONDS | SECONDS | MINUTES | HOURS"
                    }
                    …
                ]
            },
            "temperatureUnits": "C" | "F",
            "defaultState": "on" | "off",
            "defaultBrightness": 0-100,
            "fadeOut": true | false,
            "defaultLockState": "locked" | "unlocked",
            "defaultPosition": "open" | "closed",
            "defaultThermostatState": "auto" | "heat" | "cool" | "off",
            "defaultTemperature": number,
            "minimumTemperature": number,
            "maximumTemperature": number,
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
    "platform": "HomebridgeDummy",
    "verbose": true | false,
    "webhookPort": number,
}
```

All fields are optional unless noted with an asterisk (*)

### General
- `id`* - A unique identifier for the accessory. Changing this value will create a new accessory.
- `name`* - The display name for the accessory in HomeKit
- `type`* - The type of accessory

Valid values for `type` are:
- `Door`
- `GarageDoorOpener`
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

- `schedule.type` — One of `INTERVAL`, `CRON`, `SUNRISE`, `SUNSET`, `DAWN`, `DUSK`, `GOLDEN_HOUR`, `NIGHT`
- `schedule.interval` — Trigger the accessory after this many milliseconds/seconds/minutes/hours. *Required if `schedule.type` = `INTERVAL`
- `schedule.units` — The units to use for the interval (`MILLISECONDS`, `SECONDS`, `MINUTES`, or `HOURS`) *Required if `schedule.type` = `INTERVAL`
- `schedule.random` — If true, the interval will be randomized with a maximum value of `schedule.interval`
- `schedule.cron` — One of `@secondly`, `@minutely`, `@hourly`, `@daily`, `@weekly`, `@weekdays`, `@weekends`, `@monthly`, `@yearly`, or `CUSTOM_CRON`. *Required if `schedule.type` = `CRON`
- `schedule.cronCustom` - Custom cron string for triggering the accessory. *Required if `schedule.cron` = `CUSTOM_CRON`
    - See [crontab.guru](http://crontab.guru) for help
- `schedule.offset` - Add or subtract this value from the caluclated sun position for `SUNRISE`, `SUNSET`, etc.
- `schedule.latitude` - Latitude used to calculate sun position *Required if `schedule.type` is `SUNRISE`, `SUNSET`, etc.
- `schedule.longitude` - Longitude used to calculate sun position *Required if `schedule.type` is `SUNRISE`, `SUNSET`, etc.

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
- `defaultState` — Initial value, either "on" or "off"
- `defaultBrightness` — If set, lightbulb will have additional dimmer settings with this default brightness percentage
- `fadeOut` - Fade smoothly instead of abruptly from 100% to off. Requires `defaultBrightness` and `timer` to be defined.
- `defaultLockState` - The initial value for the lock, "locked" or "unlocked"
- `defaultPosition` — Initial position for the door/garage/window/blinds, "open" or "closed"
- `defaultThermostatState` - The initial state for the thermostat, "auto", "heat", "cool", or "off"
- `defaultTemperature` - The default temperature for the thermostat in `temperatureUnits` defined above
- `minimumTemperature` - Defines a minimum temperature
- `maximumTemperature` - Defines a maximum temperature

### Options
- `enableWebook` - Turn on webhooks for this accessory. See [Webhooks](https://github.com/mpatfield/homebridge-dummy#webhooks) section below for details.
- `resetOnRestart` _ If true, accessory will return to default state when Homebridge restarts
- `disableLogging` — If true, state changes will not be logged

## Trigger Conditions

You can trigger an accessory whenever a set of conditions are satisfied. There are two logical operators to trigger the target accessory when all (`AND`) or any (`OR`) of a set of conditions are satisfied. You may have an arbitrarily long list of conditions and they are checked in order.

- `conditions.operator` - `AND` to trigger when all conditions to be satisfied, `OR` to trigger when any conditions are satisfied
- `conditions.operands` - A list of conditions as defined below

### Accessory Triggers

You can trigger an accessory when one more more other Homebridge Dummy accessories change state using the `ACCESSORY` operand type. Accessories will immediately return to their default setting as soon as the conditions are no longer satisfied unless an accessory also has an auto-reset timer.

Note that due to limitations of HomeKit and Homebridge, it is only possible to check the states of other Homebridge Dummy accessories. One workaround for non-Dummy accessories is to set up duplicate accessories in Homebridge Dummy and use Automation to mirror the states. For example, if I have a physical door lock I want to "watch", then I can setup a `LockMechanism` accessory in Homebridge Dummy and create two automations to change the state of my dummy lock whenever the physical door lock is unlocked or locked.

- `type` - `ACCESSORY`
- `accessoryId` - The id of the accessory to watch for state changes
- `accessoryState` - The desired accessory state to make this condition true, e.g. "on", "off", "open", "closed", "locked", "unlocked"

### Log Watcher

Another workaround to the above limitation is to use the `LOG` operand type which will watch the Homebridge log for the specified string or regex.

`LOG` based conditions are stateless triggers. If it is the only condition or the conditions `operator` is `OR`, then it will fire immediately. If there are other `AND` conditions, then it will not fire unless all other conditions are satisfied.

For example, if I have `LOG` condition "A" and `ACCESSORY` condition "B" for when "B" is turned "On", then if "B" is "Off"" and the pattern is found in the log, "A" will not trigger.

Note that `LOG` triggers are not instantenous and may take several seconds to fire.

- `type` - `LOG`
- `pattern` - a literal string or regex to watch for

### Reachability/Ping

There is also a `PING` operand type that allows you to set the state based on the reachability of a particular `pingHost`.

- `type` - `PING`
- `pingHost` - the host to ping, e.g. `192.168.0.1` or `example.com`
- `pingInterval` - The raw interval to check the reachability of the above host (default 60 seconds)
- `pingUnits` - The units to use for interval above

## Webhooks

You can optionally enable webhooks on an accessory by choosing `Enable Webhooks` in the config UI or setting `enableWebhooks` to `true` in the JSON config.

If at least one accessory has webhooks enabled, then Homebridge Dummy will start a webhook server on startup. The default port is `63743`, e.g. `http://localhost:63743/`. To change the port, add `webhookPort` to the top level Homebridge Dummy config (see above).

Incoming requests must include the `id` of the accessory. The accessory `id` can be found in the plugin JSON config.

You can `get`, `set`, or `sync` the value of the accessory. `set` and `sync` commands require a `value` to set.

Here are the possible values for `get` or `set`/`sync` and their respective valid `value`

- `Brightness` - number from 0-100
- `LockTargetState` - 0 (UNSECURED) or 1 (SECURED)
- `On` - true or false
- `TargetHeatingCoolingState` - 0 (OFF), 1 (HEAT), 2 (COOL), 3 (AUTO)
- `TargetPosition` - number from 0-100
- `TargetTemperature` - number between 10°C and 38°C
    - For `TargetTemperature` you may optionally supply a `unit` (either 'F' or 'C') to allow you to pass in Fahrenheit or Celsius units.

`sync` is identical to `set` except that no commands are executed. This can be useful for situations where you want to avoid a looping behavior between the dummy accessory and source.

### Using GET Requests

Here is an example to get the on/off state for a switch:

```
http://localhost:63743/?id=ACCESSORY_ID&get=On
```

Returns `{ "value": false }`

And here is an example to set the brightness of a lightbulb:

```
http://localhost:63743/?id=ACCESSORY_ID&set=Brightness&value=42
```

Returns `{ "success": "Accessory Name is on, brightness is 42%" }`

### Using POST Requests

POST requests must be valid JSON. Here is an example of the JSON needed to get the on/off state for a switch:

```json
{
    "id": "ACCESSORY_ID",
    "get": "On"
}
```

Here's how you would call it from the command line:

```
curl -X POST http://localhost:63743/ -H "Content-Type: application/json" -d '{"id": "ACCESSORY_ID", "get": "On" }
```

Here is an example of the JSON needed to set the brightness of a lightbulb:

```json
{
    "id": "ACCESSORY_ID",
    "set": "Brightness",
    "value": 42
}
```

Here's how you would call it from the command line:

```
curl -X POST http://localhost:63743/ -H "Content-Type: application/json" -d '{"id": "ACCESSORY_ID", "set": "Brightness", "value": 42 }
```

## Credits

[@jotzet79](https://github.com/sponsors/jotzet79) for German translations

[@Silverdragon122](https://github.com/sponsors/Silverdragon122) for Russian translations

[@dcompane](https://github.com/sponsors/dcompane) for Spanish translations

[Keryan Belahcene](https://www.instagram.com/keryan.me) for creating the [Flume](https://github.com/homebridge-plugins/homebridge-flume) banner image which was adapted for use with this plugin

Schedule feature inspired by [Homebridge Schedule](https://github.com/kbrashears5/typescript-homebridge-schedule) by [@kbrashears5](https://github.com/sponsors/kbrashears5)

Scheduling based on sun times (sunrise, sunset, etc.) and reachability (ping) conditions inspired by [Homebridge Virtual Accessories](https://github.com/justjam2013/homebridge-virtual-accessories) by [@justjam2013](https://github.com/sponsors/justjam2013)

Sensor feature inspired by [Homebridge-Delay-Switch](https://github.com/nitaybz/homebridge-delay-switch#readme) by [@nitaybz](https://github.com/sponsors/nitaybz)

Command feature inspired by [homebridge-cmdtrigger](https://github.com/hallos/homebridge-cmdtrigger) by [@hallos](https://github.com/sponsors/hallos)

Log watch trigger feature inspired by [hb-virtual-switch](https://github.com/Plankske/hb-virtual-switch/) by [@Plankske](https://github.com/sponsors/Plankske)

Special thanks to [@nfarina](https://github.com/sponsors/nfarina) for creating the original version of this plugin and maintaining it for almost 10 (!!!) years

And to the amazing creators/contributors of [Homebridge](https://homebridge.io) who made this plugin possible!
