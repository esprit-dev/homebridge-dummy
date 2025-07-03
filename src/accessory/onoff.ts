import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { DummyAccessory } from './base.js';

import { strings } from '../i18n/i18n.js';

import { CharacteristicType, OnOffConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { STORAGE_KEY_SUFFIX_ON, storageGet, storageSet } from '../tools/storage.js';

export abstract class OnOffAccessory<C extends OnOffConfig = OnOffConfig> extends DummyAccessory<C> {

  private on: CharacteristicValue;

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    config: C,
    log: Log,
    persistPath: string,
    isGrouped: boolean,
  ) {
    super(Service, Characteristic, accessory, config, log, persistPath, isGrouped);

    this.on = this.defaultOnOff;

    this.accessoryService.getCharacteristic(Characteristic.On)
      .onGet(this.getOn.bind(this))
      .onSet(this.setOn.bind(this));

    this.initializeOn();
  }

  private async initializeOn() {

    if (this.isStateful) {
      this.on = await storageGet(this.persistPath, this.onStorageKey) ?? this.on;
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.On, this.on);  
  }

  private get onStorageKey(): string {
    return `${this.identifier}:${STORAGE_KEY_SUFFIX_ON}`;
  }
  
  private get defaultOnOff(): CharacteristicValue {
    return this.config.defaultOnOff === 1 ? true : false;
  }

  protected async getOn(): Promise<CharacteristicValue> {
    return this.on;
  }

  protected async setOn(value: CharacteristicValue): Promise<void> {

    if (this.on !== value) {
      this.logOnState(value);
    }

    this.on = value;

    if (this.isStateful) {
      await storageSet(this.persistPath, this.onStorageKey, this.on);
    } else {
      if (this.on !== this.defaultOnOff) {
        this.startTimer(this.flip.bind(this));
      } else {
        this.cancelTimer();
      }
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.On, this.on);
  }

  private async flip(): Promise<void> {
    await this.setOn(!this.on);
  }

  protected logOnState(value: CharacteristicValue) {
    this.logIfDesired(value ? strings.accessory.onOff.stateOn : strings.accessory.onOff.stateOff, this.config.name);
  }
}
