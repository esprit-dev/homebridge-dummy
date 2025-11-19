import { CharacteristicValue } from 'homebridge';

import { DummyAccessory, DummyAccessoryDependency } from '../base.js';

import { strings } from '../../i18n/i18n.js';

import { CharacteristicKey, isValidOnState, OnState, printableValues, WebhookCharacteristic } from '../../model/enums.js';
import { OnOffConfig } from '../../model/types.js';
import { Values, Webhook } from '../../model/webhook.js';

import { storageGet_Deprecated } from '../../tools/storage.js';

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

  override get webhooks(): Webhook[] {
    return [
      new Webhook(this.identifier, WebhookCharacteristic.On,
        new Values( [true, false], 'true, false'),
        () => this.on,
        (value, syncOnly) => {
          this.setOn(value, syncOnly);
          return this.logMessageForOnState(value).replace('%s', this.name);
        }),
    ];
  }

  private async initializeOn() {

    await new Promise(resolve => setImmediate(resolve));

    if (!this.isStateful) {
      this.accessoryService.updateCharacteristic(this.Characteristic.On, this.on);
      await this.registerStateChange();
      return;
    }

    const on = this.getStoredProperty(CharacteristicKey.On) ?? await storageGet_Deprecated(`${this.identifier}:DefaultState`);
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

  protected async setOn(value: CharacteristicValue, syncOnly: boolean = false): Promise<void> {

    if (this.on !== value) {
      this.logIfDesired(this.logMessageForOnState(value));

      if (!syncOnly) {
        if (this.config.commandOn && value) {
          this.executeCommand(this.config.commandOn);
        } else if (this.config.commandOff && !value) {
          this.executeCommand(this.config.commandOff);
        }
      }
    }

    this.on = value;

    this.setStoredProperty(CharacteristicKey.On, this.on);

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
    await this.setOn(!this.defaultState);
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
