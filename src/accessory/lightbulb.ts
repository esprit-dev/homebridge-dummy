import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { OnOffAccessory } from './onoff.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType, CharacteristicType, LightbulbConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { STORAGE_KEY_SUFFIX_BRIGHTNESS, storageGet, storageSet } from '../tools/storage.js';

const DEFAULT_BRIGHTNESS = 0;

export class LightbulbAccessory extends OnOffAccessory {

  private isDimmer: boolean;

  private brightness: CharacteristicValue = DEFAULT_BRIGHTNESS;

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    lightbulbConfig: LightbulbConfig,
    log: Log,
    persistPath: string,
  ) {
    super(Service, Characteristic, accessory, lightbulbConfig, log, persistPath, LightbulbAccessory.name);

    this.isDimmer = lightbulbConfig.defaultBrightness !== undefined;

    if (this.isDimmer) {

      this.brightness = lightbulbConfig.defaultBrightness;

      this.accessoryService.getCharacteristic(this.Characteristic.Brightness)
        .onGet(this.getBrightness.bind(this))
        .onSet(this.setBrightness.bind(this));

      this.initializeBrightness();
    }
  }

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.Lightbulb;
  }

  private get brightnessStorageKey(): string {
    return `${this.identifier}:${STORAGE_KEY_SUFFIX_BRIGHTNESS}`;
  }

  private async initializeBrightness() {

    if (this.isStateful) {
      this.brightness = await storageGet(this.persistPath, this.brightnessStorageKey) ?? this.brightness;
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
      await storageSet(this.persistPath, this.brightnessStorageKey, this.brightness);
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, this.brightness);
  }
}