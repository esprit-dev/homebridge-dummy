import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { DummyAccessory } from '../base.js';

import { strings } from '../../i18n/i18n.js';

import { CharacteristicType, OnOffConfig, ServiceType } from '../../model/types.js';

import { Log } from '../../tools/log.js';
import { storageGet, storageSet } from '../../tools/storage.js';

export abstract class OnOffAccessory<C extends OnOffConfig = OnOffConfig> extends DummyAccessory<C> {

  private on: boolean;

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

    this.on = this.defaultOn;

    this.accessoryService.getCharacteristic(Characteristic.On)
      .onGet(this.getOn.bind(this))
      .onSet(this.setOn.bind(this));

    this.initializeOn();
  }

  private async initializeOn() {

    if (this.isStateful) {
      this.on = await storageGet(this.persistPath, this.defaultStateStorageKey) ?? this.on;
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.On, this.on);
  }

  private get defaultOn(): boolean {
    return this.config.defaultOn ? true : false;
  }

  private async getOn(): Promise<CharacteristicValue> {
    return this.on;
  }

  private async setOn(value: CharacteristicValue): Promise<void> {

    if (this.on !== value) {
      this.logOnState(value);

      if (this.config.commandOn && value) {
        this.executeCommand(this.config.commandOn);
      } else if (this.config.commandOff && !value) {
        this.executeCommand(this.config.commandOff);
      }
    }

    this.on = value as boolean;

    if (this.isStateful) {
      await storageSet(this.persistPath, this.defaultStateStorageKey, this.on);
    } else {
      if (this.on !== this.defaultOn) {
        this.startTimer();
      } else {
        this.cancelTimer();
      }
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

  override async schedule(): Promise<void> {
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

  protected logOnState(value: CharacteristicValue) {
    this.logIfDesired(value ? strings.accessory.onOff.stateOn : strings.accessory.onOff.stateOff, this.config.name);
  }
}
