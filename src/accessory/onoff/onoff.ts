import { CharacteristicValue } from 'homebridge';

import { DummyAccessory, DummyAccessoryDependency } from '../base.js';

import { strings } from '../../i18n/i18n.js';

import { OnOffConfig } from '../../model/types.js';
import { Webhook } from '../../model/webhook.js';

import { storageGet_Deprecated, Storage } from '../../tools/storage.js';
import { isValidOnState, OnState, printableValues, WebhookCommand } from '../../model/enums.js';

export abstract class OnOffAccessory<C extends OnOffConfig = OnOffConfig> extends DummyAccessory<C> {

  private on: CharacteristicValue;

  constructor(dependency: DummyAccessoryDependency<C>) {
    super(dependency);

    if (!isValidOnState(this.config.defaultState)) {
      this.log.warning(strings.onOff.badDefault, this.name, `'${dependency.config.defaultState}'`, printableValues(OnState));
    }

    this.on = this.defaultState;

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
      await this.registerStateChange();
      return;
    }

    const on = await storageGet_Deprecated(this.defaultStateStorageKey);
    if (on === undefined) {
      await this.registerStateChange();
      return;
    }

    await this.setOn(on);
  }

  private get defaultState(): CharacteristicValue {

    if (this.config.defaultState) {
      return this.config.defaultState === OnState.ON ? true : false;
    }

    return this.config.defaultOn ? true : false;
  }

  private async registerStateChange() {
    await this.onStateChange(this.on ? OnState.ON : OnState.OFF);
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

    this.on = value;

    if (this.isStateful) {
      await Storage.set(this.defaultStateStorageKey, this.on);
    }

    if (this.on !== this.defaultState) {
      this.startTimer();
    } else {
      this.cancelTimer();
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.On, this.on);

    if (this.sensor) {
      if (!this.sensor.timerControlled) {
        this.sensor.active = this.on !== this.defaultState;
      } else if (this.on !== this.defaultState) {
        this.sensor.active = false;
      }
    }

    await this.registerStateChange();
  }

  override async trigger(): Promise<void> {
    if (this.on === this.defaultState) {
      await this.setOn(!this.on);
    }
  }

  override async reset(): Promise<void> {
    if (this.on !== this.defaultState) {
      await this.setOn(this.defaultState);
      if (this.sensor?.timerControlled) {
        this.sensor.active = true;
      }
    }
  }

  protected logMessageForOnState(value: CharacteristicValue): string {
    return value ? strings.onOff.stateOn : strings.onOff.stateOff;
  }
}
