## ‼️ WARNING - READ BEFORE CONTINUING ‼️

If upgrading from v0.9.2 or earlier, automations and scenes using Homebridge Dummy accessories will need to be reconfigured.

Please downgrade back to your previous version now if you want to keep your existing setup.

## ⚠️ IMPORTANT ⚠️

Please **RESTART HOMEBRIDGE SERVICE & UI** (not just *RESTART HOMEBRIDGE*) before continuing or you will experience issues with Homebridge Dummy configuration.

Once you have restarted both Homebridge and the UI, you will need to open the Homebridge Dummy plugin settings to run the accessory migration helper.

Full migration details [here](https://github.com/mpatfield/homebridge-dummy?tab=readme-ov-file#v10-migration).

# Change Log

All notable changes to homebridge-dummy will be documented in this file.

## 1.0.0-beta.0 (2025-07-14)

### Added
- Drastically improved config UI
- resetOnRestart option for stateful accessories to return to defaults on Homebridge restart
- Support for Door, Outlet, and Lock Mechanism, Window, and Window Covering
- Sensor support (CO2, CO, Contact, Leak, Motion, Occupancy, and Smoke)
- Execute arbitraty commands when accessory state changes

### Changed
- Complete code re-write to use [Platform Plugin](https://developers.homebridge.io/#/api/platform-plugins) instead of [Accessory Plugin](https://developers.homebridge.io/#/api/accessory-plugins)

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