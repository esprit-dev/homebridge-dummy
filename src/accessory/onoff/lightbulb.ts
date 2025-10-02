import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { OnOffAccessory } from './onoff.js';

import { strings } from '../../i18n/i18n.js';

import { AccessoryType, WebhookCommand } from '../../model/enums.js';
import { CharacteristicType, LightbulbConfig, ServiceType } from '../../model/types.js';
import { Webhook } from '../../model/webhook.js';

import { Log } from '../../tools/log.js';
import { STORAGE_KEY_SUFFIX_DEFAULT_BRIGHTNESS, storageGet, storageSet } from '../../tools/storage.js';

const NO_BRIGHTNESS = -1;

export class LightbulbAccessory extends OnOffAccessory<LightbulbConfig> {

  private brightness: CharacteristicValue;

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    config: LightbulbConfig,
    log: Log,
    isGrouped: boolean,
  ) {
    super(Service, Characteristic, accessory, config, log, isGrouped);

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

  override getAccessoryType(): AccessoryType {
    return AccessoryType.Lightbulb;
  }

  override webhooks(): Webhook[] {
    return [
      ...super.webhooks(),
      new Webhook(this.identifier, WebhookCommand.Brightness,
        (value) => {
          this.setBrightness(value);
          return strings.accessory.lightbulb.brightness.replace('%s', this.name).replace('%d', value.toString());
        }),
    ];
  }

  private async initializeBrightness() {

    if (this.isStateful) {
      this.brightness = await storageGet(this.defaultBrightnessStorageKey) ?? this.brightness;
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, this.brightness);
  }

  override logMessageForOnState(value: CharacteristicValue): string {
    if (this.isDimmer && value) {
      return strings.accessory.lightbulb.stateOn.replace('%d', this.brightness.toLocaleString());
    } else {
      return super.logMessageForOnState(value);
    }
  }

  private async getBrightness(): Promise<CharacteristicValue> {
    return this.brightness;
  }

  private async setBrightness(value: CharacteristicValue) {

    this.startTimer();

    if (this.brightness === value) {
      return;
    }

    this.brightness = value;

    this.logIfDesired(strings.accessory.lightbulb.brightness, this.brightness.toString());

    if (this.isStateful) {
      await storageSet(this.defaultBrightnessStorageKey, this.brightness);
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, this.brightness);
  }
}