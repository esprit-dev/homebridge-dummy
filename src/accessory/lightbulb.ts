import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { OnOffAccessory } from './onoff.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType, CharacteristicType, LightbulbConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { STORAGE_KEY_SUFFIX_DEFAULT_BRIGHTNESS, storageGet, storageSet } from '../tools/storage.js';

const NO_BRIGHTNESS = -1;

export class LightbulbAccessory extends OnOffAccessory<LightbulbConfig> {

  private brightness: CharacteristicValue;

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    config: LightbulbConfig,
    log: Log,
    persistPath: string,
    isGrouped: boolean,
  ) {
    super(Service, Characteristic, accessory, config, log, persistPath, isGrouped);

    this.brightness = this.config.defaultBrightness ?? NO_BRIGHTNESS;

    if (this.isDimmer) {

      this.accessoryService.getCharacteristic(this.Characteristic.Brightness)
        .onGet(this.getBrightness.bind(this))
        .onSet(this.setBrightness.bind(this));

      this.initializeBrightness();
    }
  }

  private get isDimmer(): boolean {
    return this.brightness !== NO_BRIGHTNESS;
  }

  private get defaultBrightnessStorageKey(): string {
    return `${this.identifier}:${STORAGE_KEY_SUFFIX_DEFAULT_BRIGHTNESS}`;
  }

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.Lightbulb;
  }

  private async initializeBrightness() {

    if (this.isStateful) {
      this.brightness = await storageGet(this.persistPath, this.defaultBrightnessStorageKey) ?? this.brightness;
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, this.brightness);
  }

  override logOnState(value: CharacteristicValue) {
    if (this.isDimmer && value) {
      this.logIfDesired(strings.accessory.lightbulb.stateOn, this.config.name, this.brightness.toLocaleString());
    } else {
      super.logOnState(value);
    }
  }

  protected async getBrightness(): Promise<CharacteristicValue> {
    return this.brightness;
  }

  protected async setBrightness(value: CharacteristicValue) {

    if (this.brightness === value) {
      return;
    }

    this.brightness = value;

    this.logIfDesired(strings.accessory.lightbulb.brightness,  this.config.name, this.brightness.toString());

    if (this.isStateful) {
      await storageSet(this.persistPath, this.defaultBrightnessStorageKey, this.brightness);
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, this.brightness);
  }
}