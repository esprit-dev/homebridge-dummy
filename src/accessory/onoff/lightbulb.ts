import { CharacteristicValue } from 'homebridge';

import { OnOffAccessory } from './onoff.js';

import { DummyAccessoryDependency } from '../base.js';

import { strings } from '../../i18n/i18n.js';

import { AccessoryType, CharacteristicKey, WebhookCharacteristic } from '../../model/enums.js';
import { LightbulbConfig } from '../../model/types.js';
import { Webhook } from '../../model/webhook.js';

import { Fader } from '../../timeout/fader.js';

import { storageGet_Deprecated } from '../../tools/storage.js';

const NO_BRIGHTNESS = -1;

export class LightbulbAccessory extends OnOffAccessory<LightbulbConfig> {

  private brightness: CharacteristicValue;

  private fader = new Fader();

  constructor(dependency: DummyAccessoryDependency<LightbulbConfig>) {
    super(dependency);

    this.brightness = this.config.defaultBrightness ?? NO_BRIGHTNESS;

    if (this.isDimmer) {

      this.accessoryService.getCharacteristic(dependency.Characteristic.Brightness)
        .onGet(this.getBrightness.bind(this))
        .onSet(this.setBrightness.bind(this));

      this.initializeBrightness();
    }
  }

  private get isDimmer(): boolean {
    return this.brightness !== NO_BRIGHTNESS;
  }

  override getAccessoryType(): AccessoryType {
    return AccessoryType.Lightbulb;
  }

  override get webhooks(): Webhook[] {
    return [
      ...super.webhooks,
      new Webhook(this.identifier, WebhookCharacteristic.Brightness,
        () => this.brightness,
        (value) => {
          this.setBrightness(value);
          return strings.lightbulb.brightness.replace('%s', this.name).replace('%d', value.toString());
        }),
    ];
  }

  private async initializeBrightness() {

    if (!this.isStateful) {
      this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, this.brightness);
      return;
    }

    const brightness = this.getStoredProperty(CharacteristicKey.Brightness) ?? await storageGet_Deprecated(`${this.identifier}:Brightness`);
    if (brightness === undefined) {
      return;
    }

    await this.setBrightness(brightness);
  }

  override logMessageForOnState(value: CharacteristicValue): string {
    if (this.isDimmer && value && this.brightness !== undefined) {
      return strings.lightbulb.stateOn.replace('%d', this.brightness.toLocaleString());
    } else {
      return super.logMessageForOnState(value);
    }
  }

  override async setOn(value: CharacteristicValue, syncOnly: boolean = false): Promise<void> {
    super.setOn(value, syncOnly);

    if (!value) {
      this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, this.brightness);
    }
  }

  private async getBrightness(): Promise<CharacteristicValue> {
    return this.fader.value ?? this.brightness;
  }

  private async setBrightness(value: CharacteristicValue) {

    if (this.brightness === value) {
      return;
    }

    this.brightness = value;
    if (this.fader.isFading) {
      this.startTimer();
    }

    this.logIfDesired(strings.lightbulb.brightness, this.brightness.toString());

    this.setStoredProperty(CharacteristicKey.Brightness, this.brightness);

    this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, this.brightness);
  }

  override onTimerStarted(delay: number) {

    if (this.config.fadeOut !== true) {
      return;
    }

    this.fader.start(Number(this.brightness), delay, (value) => {
      this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, value);
    });
  }

  override cancelTimer() {
    this.fader.cancel();
    super.cancelTimer();
  }

  override teardown(): void {
    this.fader.teardown();
    super.teardown();
  }
}