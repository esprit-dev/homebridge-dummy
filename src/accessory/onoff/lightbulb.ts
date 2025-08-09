import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { OnOffAccessory } from './onoff.js';

import { strings } from '../../i18n/i18n.js';

import { Fader } from '../../model/fader.js';
import { AccessoryType, CharacteristicType, LightbulbConfig, ServiceType } from '../../model/types.js';

import { Log } from '../../tools/log.js';
import { STORAGE_KEY_SUFFIX_DEFAULT_BRIGHTNESS, storageGet, storageSet } from '../../tools/storage.js';
import { assertType } from '../../tools/validation.js';

const NO_BRIGHTNESS = -1;

export class LightbulbAccessory extends OnOffAccessory<LightbulbConfig> {

  private brightness: number;
  private fader?: Fader;

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

      if (this.config.fade && config.timer) {
        this.fader = Fader.new(config.timer, this.defaultOn, config.name, log, this.config.disableLogging === true);
      }
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

  override teardown(): void {
    this.fader?.reset();
    super.teardown();
  }

  override startTimer() {

    if (this.fader) {
      this.fader.start(this.brightness, this.onFadeUpdate.bind(this));
      return;
    }

    super.startTimer();
  }

  override cancelTimer() {

    if (this.fader) {
      this.fader.cancel();
      return;
    }

    super.cancelTimer();
  }

  override async getOn(): Promise<CharacteristicValue> {
    return ( this.fader?.currentValue && !this.defaultOn ) ?? super.getOn();
  }

  private async getBrightness(): Promise<CharacteristicValue> {
    return this.fader?.currentValue ?? this.brightness;
  }

  private async setBrightness(value: CharacteristicValue) {

    if (!assertType(this.log, this.config.name,value, 'number')) {
      return;
    }

    this.startTimer();

    if (this.brightness === value) {
      return;
    }

    this.brightness = value as number;

    this.logIfDesired(strings.accessory.lightbulb.brightness, this.config.name, this.brightness.toString());

    if (this.isStateful) {
      await storageSet(this.persistPath, this.defaultBrightnessStorageKey, this.brightness);
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, this.brightness);
  }

  private async onFadeUpdate(value: number): Promise<void> {

    if (!this.defaultOn && value === 0) {
      this.fader?.reset();
      await this.setOn(false);
      return;
    }

    if (this.defaultOn && value > 0) {
      this.accessoryService.updateCharacteristic(this.Characteristic.On, true);
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, value);

    if (this.defaultOn && value === this.brightness) {
      this.fader?.reset();
      await this.setOn(true);
    }
  }
}