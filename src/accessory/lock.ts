import { CharacteristicValue } from 'homebridge';

import { DummyAccessory, DummyAccessoryDependency } from './base.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType, LockState, isValidLockState, printableValues, WebhookCommand }  from '../model/enums.js';
import { LockConfig } from '../model/types.js';
import { Webhook } from '../model/webhook.js';

import { storageGet_Deprecated, Storage } from '../tools/storage.js';

export class LockAccessory extends DummyAccessory<LockConfig> {

  private state: CharacteristicValue;

  constructor(dependency: DummyAccessoryDependency<LockConfig>) {
    super(dependency);

    if (!isValidLockState(this.config.defaultLockState)) {
      this.log.warning(strings.lock.badDefault, this.name, `'${dependency.config.defaultLockState}'`, printableValues(LockState));
    }

    this.state = this.defaultLockState;

    this.accessoryService.getCharacteristic(dependency.Characteristic.LockTargetState)
      .onGet(this.getState.bind(this))
      .onSet(this.setState.bind(this));

    this.accessoryService.getCharacteristic(dependency.Characteristic.LockCurrentState)
      .onGet(this.getState.bind(this));

    this.initializeState();
  }

  private async initializeState() {

    if (!this.isStateful) {
      this.accessoryService.updateCharacteristic(this.Characteristic.LockTargetState, this.state);
      this.accessoryService.updateCharacteristic(this.Characteristic.LockCurrentState, this.state);
      return;
    }

    const state = await storageGet_Deprecated(this.defaultStateStorageKey);
    if (state === undefined) {
      await this.registerStateChange();
      return;
    }

    await this.setState(state);
  }

  override getAccessoryType(): AccessoryType {
    return AccessoryType.LockMechanism;
  }

  override webhooks(): Webhook[] {
    return [
      new Webhook(this.identifier, WebhookCommand.LockTargetState,
        (value) => {
          this.setState(value);
          return this.logTemplateForCV(value).replace('%s', this.name);
        }),
    ];
  }

  private get defaultLockState(): CharacteristicValue {
    return this.config.defaultLockState === LockState.UNLOCKED ?
      this.Characteristic.LockTargetState.UNSECURED : this.Characteristic.LockTargetState.SECURED;
  }

  private async registerStateChange() {
    await this.onStateChange(this.state === this.Characteristic.LockTargetState.SECURED ? LockState.LOCKED : LockState.UNLOCKED);
  }

  protected async getState(): Promise<CharacteristicValue> {
    return this.state;
  }

  protected async setState(value: CharacteristicValue): Promise<void> {

    if (this.state !== value) {
      this.logLockState(value);

      if (this.config.commandLock && value === this.Characteristic.LockTargetState.SECURED) {
        this.executeCommand(this.config.commandLock);
      } else if (this.config.commandUnlock && value === this.Characteristic.LockTargetState.UNSECURED) {
        this.executeCommand(this.config.commandUnlock);
      }
    }

    this.state = value;

    if (this.isStateful) {
      await Storage.set(this.defaultStateStorageKey, this.state);
    }

    if (this.state !== this.defaultLockState) {
      this.startTimer();
    } else {
      this.cancelTimer();
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.LockTargetState, this.state);
    this.accessoryService.updateCharacteristic(this.Characteristic.LockCurrentState, this.state);

    if (this.sensor) {
      if (!this.sensor.timerControlled) {
        this.sensor.active = this.state !== this.defaultLockState;
      } else if (this.state !== this.defaultLockState) {
        this.sensor.active = false;
      }
    }

    await this.registerStateChange();
  }

  override async trigger(): Promise<void> {
    if (this.state === this.defaultLockState) {
      const opposite = this.state === this.Characteristic.LockTargetState.SECURED ?
        this.Characteristic.LockTargetState.UNSECURED : this.Characteristic.LockTargetState.SECURED;
      await this.setState(opposite);
    }
  }

  override async reset(): Promise<void> {
    if (this.state !== this.defaultLockState) {
      await this.setState(this.defaultLockState);
      if (this.sensor?.timerControlled) {
        this.sensor.active = true;
      }
    }
  }

  private logTemplateForCV(value: CharacteristicValue): string {
    return value === this.Characteristic.LockTargetState.SECURED ? strings.lock.secured : strings.lock.unsecured;
  }


  protected logLockState(value: CharacteristicValue) {
    this.logIfDesired(this.logTemplateForCV(value));
  }
}
