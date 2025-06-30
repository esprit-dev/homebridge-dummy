import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { DummyAccessory } from './base.js';

import { strings } from '../i18n/i18n.js';

import { CharacteristicType, OnOffConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { STORAGE_KEY_SUFFIX_ON, storageGet, storageSet } from '../tools/storage.js';

export abstract class OnOffAccessory extends DummyAccessory {

  private on: CharacteristicValue;

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    private readonly onOffConfig: OnOffConfig,
    log: Log,
    persistPath: string,
    className: string,
  ) {
    super(Service, Characteristic, accessory, onOffConfig, log, persistPath, className);

    this.on = onOffConfig.defaultOn ? true : false;

    this.accessoryService.getCharacteristic(Characteristic.On)
      .onGet(this.getOn.bind(this))
      .onSet(this.setOn.bind(this));

    this.initializeOn();
  }

  private get isStateful(): boolean {
    return this.config.timer?.delay === undefined;
  }

  private get onStorageKey(): string {
    return `${this.identifier}:${STORAGE_KEY_SUFFIX_ON}`;
  }
  
  private async initializeOn() {

    if (this.isStateful) {
      this.on = await storageGet(this.persistPath, this.onStorageKey) ?? this.on;
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.On, this.on);
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
      if (this.on === !this.onOffConfig.defaultOn) {
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
