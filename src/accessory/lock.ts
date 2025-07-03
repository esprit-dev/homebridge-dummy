import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { DummyAccessory } from './base.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType, CharacteristicType, LockConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { storageGet, storageSet } from '../tools/storage.js';

export class LockAccessory extends DummyAccessory<LockConfig> {

  private state: CharacteristicValue;

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    config: LockConfig,
    log: Log,
    persistPath: string,
    isGrouped: boolean,
  ) {
    super(Service, Characteristic, accessory, config, log, persistPath, isGrouped);

    this.state = this.defaultState;

    this.accessoryService.getCharacteristic(Characteristic.LockTargetState)
      .onGet(this.getState.bind(this))
      .onSet(this.setState.bind(this));

    this.accessoryService.getCharacteristic(Characteristic.LockCurrentState)
      .onGet(this.getState.bind(this));

    this.initializeState();
  }

  private async initializeState() {

    if (this.isStateful) {
      this.state = await storageGet(this.persistPath, this.defaultStateStorageKey) ?? this.state;
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.LockTargetState, this.state);  
    this.accessoryService.updateCharacteristic(this.Characteristic.LockCurrentState, this.state);  
  }

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.LockMechanism;
  }

  private get defaultState(): CharacteristicValue {
    return this.config.defaultLockState === undefined ? this.Characteristic.LockTargetState.SECURED : this.config.defaultLockState;
  }

  protected async getState(): Promise<CharacteristicValue> {
    return this.state;
  }

  protected async setState(value: CharacteristicValue): Promise<void> {

    if (this.state !== value) {
      this.logLockStateState(value);
    }

    this.state = value;

    if (this.isStateful) {
      await storageSet(this.persistPath, this.defaultStateStorageKey, this.state);
    } else {
      if (this.state !== this.defaultState) {
        this.startTimer(this.flip.bind(this));
      } else {
        this.cancelTimer();
      }
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.LockTargetState, this.state);
    this.accessoryService.updateCharacteristic(this.Characteristic.LockCurrentState, this.state);
  }

  private async flip(): Promise<void> {
    const opposite = this.state === this.Characteristic.LockTargetState.SECURED ?
      this.Characteristic.LockTargetState.UNSECURED : this.Characteristic.LockTargetState.SECURED;
    await this.setState(opposite);
  }

  protected logLockStateState(value: CharacteristicValue) {
    const message = value === this.Characteristic.LockTargetState.SECURED ?
      strings.accessory.lock.secured : strings.accessory.lock.unsecured;
    this.logIfDesired(message, this.config.name);
  }
}
