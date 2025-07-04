### ‼️ BREAKING CHANGES ‼️

### v1.0 is a complete code rewrite and automations using Homebridge Dummy accessories will need to be reconfigured.

### Full details [here](https://github.com/mpatfield/homebridge-dummy?tab=readme-ov-file#v10-migration).

# Change Log

All notable changes to homebridge-dummy will be documented in this file.

⚠️ Plugin has a new owner/maintainer and will undergo significant cleanup and modernization in the near term. If you experience issues you can always downgrade to the last stable version v0.9.0

Please report any issues you encounter here: https://github.com/mpatfield/homebridge-dummy/issues

## 1.0.0-alpha.8 (2025-07-03)

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