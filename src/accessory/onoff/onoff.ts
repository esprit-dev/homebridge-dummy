import { CharacteristicValue } from 'homebridge';

import { DummyAccessory, DummyAccessoryDependency } from '../base.js';

import { strings } from '../../i18n/i18n.js';

import { OnOffConfig } from '../../model/types.js';
import { Webhook } from '../../model/webhook.js';

import { storageGet_Deprecated, Storage } from '../../tools/storage.js';
import { WebhookCommand } from '../../model/enums.js';

export abstract class OnOffAccessory<C extends OnOffConfig = OnOffConfig> extends DummyAccessory<C> {

  private on: boolean;

  constructor(dependency: DummyAccessoryDependency<C>) {
    super(dependency);

    this.on = this.defaultOn;

    this.accessoryService.getCharacteristic(dependency.Characteristic.On)
      .onGet(this.getOn.bind(this))
      .onSet(this.setOn.bind(this));

    this.initializeOn();
  }

  override webhooks(): Webhook[] {
    return [
      new Webhook(this.identifier, WebhookCommand.On,
        (value) => {
          this.setOn(value);
          return this.logMessageForOnState(value).replace('%s', this.name);
        }),
    ];
  }

  private async initializeOn() {

    if (!this.isStateful) {
      this.accessoryService.updateCharacteristic(this.Characteristic.On, this.on);
      return;
    }

    const on = await storageGet_Deprecated(this.defaultStateStorageKey);
    if (on === undefined) {
      return;
    }

    await this.setOn(on);
  }

  private get defaultOn(): boolean {
    return this.config.defaultOn ? true : false;
  }

  private async getOn(): Promise<CharacteristicValue> {
    return this.on;
  }

  private async setOn(value: CharacteristicValue): Promise<void> {

    if (this.on !== value) {
      this.logIfDesired(this.logMessageForOnState(value));

      if (this.config.commandOn && value) {
        this.executeCommand(this.config.commandOn);
      } else if (this.config.commandOff && !value) {
        this.executeCommand(this.config.commandOff);
      }
    }

    this.on = value as boolean;

    if (this.isStateful) {
      await Storage.set(this.defaultStateStorageKey, this.on);
    }

    if (this.on !== this.defaultOn) {
      this.startTimer();
    } else {
      this.cancelTimer();
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.On, this.on);

    if (this.sensor) {
      if (!this.sensor.timerControlled) {
        this.sensor.active = this.on !== this.defaultOn;
      } else if (this.on !== this.defaultOn) {
        this.sensor.active = false;
      }
    }
  }

  override async trigger(): Promise<void> {
    if (this.on === this.defaultOn) {
      await this.setOn(!this.on);
    }
  }

  override async reset(): Promise<void> {
    if (this.on !== this.defaultOn) {
      await this.setOn(this.defaultOn);
      if (this.sensor?.timerControlled) {
        this.sensor.active = true;
      }
    }
  }

  protected logMessageForOnState(value: CharacteristicValue): string {
    return value ? strings.onOff.stateOn : strings.onOff.stateOff;
  }
}
