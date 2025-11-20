# Change Log

All notable changes to homebridge-dummy will be documented in this file.

## 1.4.3 (2025-11-20)

### ‼️ WARNING ‼️ — If upgrading from v0.9.2 or earlier, [READ THIS FIRST](https://github.com/mpatfield/homebridge-dummy?tab=readme-ov-file#v10-migration)

### Added
- MAC Address support for [Reachability](https://github.com/mpatfield/homebridge-dummy?tab=readme-ov-file#reachabilitypresence) conditions, useful for triggering events based on joining/leaving your local network
    - ⚠️ Somewhat experimental so please [open a ticket](https://github.com/mpatfield/homebridge-dummy/issues/new/choose) if you have issues

### Fixed
- `TargetTemperature` [Webhook](https://github.com/mpatfield/homebridge-dummy#webhooks) respects configured min/max ([#257](https://github.com/mpatfield/homebridge-dummy/issues/257))
- Suppress `Lightbulb` warnings ([#258](https://github.com/mpatfield/homebridge-dummy/issues/258)) and avoid potential crash on startup
- `Thermostat` issue when setting `minimumTemperature` to zero ([#259](https://github.com/mpatfield/homebridge-dummy/issues/259))

### Changed
- Triggering accessory via `Schedule` resets any `Auto-Reset Timer`

### Notes
Would you like to see Homebridge Dummy in your language? Please consider [getting involved](https://github.com/mpatfield/homebridge-dummy/issues/105). No coding experience required!

## 1.4.2 (2025-11-14)

### Added
- `sync` [Webhooks](https://github.com/mpatfield/homebridge-dummy#webhooks) which suppress command execution
- Accessory states can be accessed within commands via [Environment Variables](https://github.com/mpatfield/homebridge-dummy#environment-variables)

### Changed
- `Thermostat` - current state (i.e. HEAT/COOL/OFF) mirrors target state; previously always 'OFF'

## 1.4.1 (2025-11-06)

### Added
- [Schedule](https://github.com/mpatfield/homebridge-dummy#schedule) settings for sunrise, sunset, dawn, dusk, golden hour, or night, with optional offset
- [Reachability](https://github.com/mpatfield/homebridge-dummy?tab=readme-ov-file#reachabilitypresence) Trigger Condition
- Fetch accessory state via [Webhooks](https://github.com/mpatfield/homebridge-dummy#webhooks)
    - `command` has been replaced by `get`/`set` - this is backwards compatible so no manual edits are necessary

## 1.4.0 (2025-11-01)

### Added
- [Trigger Conditions](https://github.com/mpatfield/homebridge-dummy?tab=readme-ov-file#trigger-conditions) to change the state of an accessory based on state changes of other Homebridge Dummy accessories or keywords in the Homebridge log
    - ⚠️ Config UI for conditions is highly experimental. Please [open a ticket](https://github.com/mpatfield/homebridge-dummy/issues/new/choose) if you see any unusal behavior.
- `GET` requests for [Webhooks](https://github.com/mpatfield/homebridge-dummy#webhooks) (previously only `POST`)
- Fade Out option for `Lightbulb` brightness to emulate a simple "count-down"
- Min/max temperature settings for `Thermostat`

### Changed
- ⚠️ Dropped [official support](https://github.com/homebridge/homebridge/wiki/How-To-Update-Node.js) for Node.js v18 and added Node.js v24
- `defaultOn` has been deprecated in favor of `defaultState` for `Lightbulb`, `Outlet`, and `Switch`
    - This is backwards compatible so no manual edits are necessary
- Updated dependencies

### Notes
After further consideration, I will continue to support `Thermostat` as an accessory type. Thanks to everybody who participated in the [discussion](https://github.com/mpatfield/homebridge-dummy/issues/207).

## 1.3.2 (2025-10-24)

### Added
- Support for `GarageDoorOpener`
- Русский перевод. Спасибо, [@Silverdragon122](https://github.com/sponsors/Silverdragon122)!

## 1.3.1 (2025-10-18)

### Fixed
- Auto-Reset timer not resetting delay when re-invoked ([#197](https://github.com/mpatfield/homebridge-dummy/issues/197))

### Added
- Deutsche Übersetzungen. Danke, [@jotzet79](https://github.com/sponsors/jotzet79)!
- Traducciones al español. ¡Gracias, [@dcompane](https://github.com/sponsors/dcompane)!

### Changed
- Webhook server port is now configurable using `webhookPort` ([docs](https://github.com/mpatfield/homebridge-dummy#webhooks))

## 1.3.0 (2025-10-13)

### Added
- Time Limits ([docs](https://github.com/mpatfield/homebridge-dummy?tab=readme-ov-file#limiter))

### Fixed
- More robust command execution to prevent incorrectly displaing errors on success

### Changed
- Running timers are resumed and sensor states are restored after plugin/Homebridge restart ([#189](https://github.com/mpatfield/homebridge-dummy/issues/189)) ([#191](https://github.com/mpatfield/homebridge-dummy/issues/191))
- Improved error messaging for invalid config values

## 1.2.0 (2025-10-02)

### Added
- Webhooks ([docs](https://github.com/mpatfield/homebridge-dummy#webhooks))

### Changed
- `schedule.cron` now expects an `@` preset or `CRON_CUSTOM` with `schedule.cronCustom` defined.
    - This is backwards compatible so no manual edits are necessary
- Better field validation in config UI (Thank you, [@justjam2013](https://github.com/sponsors/justjam2013) for teaching me this!)
- Updated dependencies
- Code changes to speed future feature development

## 1.1.0 (2025-08-14)

### Added
- "Schedule" feature to invoke accessory at a specified interval or times via cron ([#136](https://github.com/mpatfield/homebridge-dummy/issues/136))
- Groups (Beta) - Items sharing the same group name can be grouped together in a single accessory in the Home.app UI ([#46](https://github.com/mpatfield/homebridge-dummy/issues/46))
    - ⚠️ Adding/removing/changing the group name for an accessory will require you to reconfigure any HomeKit scenes or automations
- Added "Activate Sensor on Auto-Reset" option ([#142](https://github.com/mpatfield/homebridge-dummy/issues/142))
    - Instead of mirroring accessory, sensor will be activated only when accessory auto-resets
- Millisecond unit option ([#149](https://github.com/mpatfield/homebridge-dummy/issues/149))
- Rudimentary support for Thermostats ([#145](https://github.com/mpatfield/homebridge-dummy/issues/145))
    - Manual control only, no scheduling or auto-reset functionality
- Allow `sensor` to be attached to all accessory types (excluding Thermostat)

### Changed
- Reorganized plugin config UI and renamed "Timer" to "Auto-Reset Timer"
- `sensor` is now an object rather than a primitive string (backwards compatible)
- Updated dependencies

### Fixed
- Timer logging issues ([#143](https://github.com/mpatfield/homebridge-dummy/issues/143), [#148](https://github.com/mpatfield/homebridge-dummy/issues/148))
- Better support for custom configuration with multiple plugin instances and child bridges ([#152](https://github.com/mpatfield/homebridge-dummy/issues/152))
- Broken header image in config UI

## 1.0.0 (2025-07-23)

### Changed
- Complete code re-write to use [Platform Plugin](https://developers.homebridge.io/#/api/platform-plugins) instead of [Accessory Plugin](https://developers.homebridge.io/#/api/accessory-plugins)

### Added
- Drastically improved config UI
- resetOnRestart option for stateful accessories to return to defaults on Homebridge restart
- Support for Door, Outlet, and Lock Mechanism, Window, and Window Covering
- Sensor support (CO2, CO, Contact, Leak, Motion, Occupancy, and Smoke)
- Execute arbitrary commands when accessory state changes

## 0.9.2 (2025-06-26)

### Fixed
- Stateful switches not persisting across homebridge restarts

## 0.9.1 (2025-06-25)

### ⚠️ BREAKING
- node-persist updated from major version 2 to 4, so stateful and dimmer switches may lose their previously saved states

### Changed
- Migrated plugin to TypeScript

## 0.9.0 (2023-01-23)

- Last stable release by @nfarina before transfer of ownership to @mpatfield