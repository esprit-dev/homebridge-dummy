# Change Log

All notable changes to homebridge-dummy will be documented in this file.

## 1.1.0-beta.X (XXXX-XX-XX)

### ‼️ WARNING — Read this if upgrading from v0.9.2 or earlier…

Automations and scenes using Homebridge Dummy accessories will need to be reconfigured. After upgrading, you must **RESTART HOMEBRIDGE SERVICE & UI** (not just *RESTART HOMEBRIDGE*). After restarting, open the Homebridge Dummy plugin settings to run the accessory migration helper. Full details [here](https://github.com/mpatfield/homebridge-dummy?tab=readme-ov-file#v10-migration).

---

### Added
- Groups (Beta) - Items sharing the same group name will be collected together in the Home app UI
    - ⚠️ Adding/removing/changing the group name for an accessory will require you to reconfigure any HomeKit scenes or automations
- Auto-Trigger feature to invoke accessory at a specified interval or times

### Changed
- Reorganized plugin config UI and renamed "Timer" to "Auto-Reset"

### Fixed
- Timers over 1 hour were logging incorrectly ([#143](https://github.com/mpatfield/homebridge-dummy/issues/143))

## 1.0.0 (2025-07-23)

### Changed
- Complete code re-write to use [Platform Plugin](https://developers.homebridge.io/#/api/platform-plugins) instead of [Accessory Plugin](https://developers.homebridge.io/#/api/accessory-plugins)

### Added
- Drastically improved config UI
- resetOnRestart option for stateful accessories to return to defaults on Homebridge restart
- Support for Door, Outlet, and Lock Mechanism, Window, and Window Covering
- Sensor support (CO2, CO, Contact, Leak, Motion, Occupancy, and Smoke)
- Execute arbitraty commands when accessory state changes

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