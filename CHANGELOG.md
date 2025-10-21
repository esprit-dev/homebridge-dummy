# Change Log

All notable changes to homebridge-dummy will be documented in this file.

## 1.3.2-beta.1 (2025-10-21)

### ‼️ WARNING ‼️ If upgrading from v0.9.2 or earlier, [READ THIS FIRST](https://github.com/mpatfield/homebridge-dummy?tab=readme-ov-file#v10-migration)

### ⚠️ Feedback Request

I am considering the removal of Thermostat as a supported accessory type from a future version. If you use Thermostat, please add your use case to [this ticket](https://github.com/mpatfield/homebridge-dummy/issues/207).

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

### Notes
Would you like to see Homebridge Dummy in your language? Please consider [getting involved](https://github.com/mpatfield/homebridge-dummy/issues/105). No coding experience required!

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