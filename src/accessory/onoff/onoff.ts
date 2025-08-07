import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { DummyAccessory } from '../base.js';
import { SensorAccessory } from '../sensor.js';

import { strings } from '../../i18n/i18n.js';

import { CharacteristicType, OnOffConfig, ServiceType } from '../../model/types.js';

import { Log } from '../../tools/log.js';
import { storageGet, storageSet } from '../../tools/storage.js';
import { assertType } from '../../tools/validation.js';

export abstract class OnOffAccessory<C extends OnOffConfig = OnOffConfig> extends DummyAccessory<C> {

  private on: boolean;

  private sensor?: SensorAccessory;

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

    this.sensor = SensorAccessory.init(Service, Characteristic, accessory, this.config.name, log, this.config.disableLogging, config.sensor);

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

  protected get defaultOn(): boolean {
    return this.config.defaultOn ? true : false;
  }

  protected async getOn(): Promise<CharacteristicValue> {
    return this.on;
  }

  protected async setOn(value: CharacteristicValue): Promise<void> {

    if (!assertType(this.log, this.config.name, value, 'boolean')) {
      return;
    }

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

    if (this.sensor) {
      this.sensor.active = this.on !== this.defaultOn;
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.On, this.on);
  }

  override async trigger(): Promise<void> {
    if (this.on === this.defaultOn) {
      await this.setOn(!this.on);
    }
  }

  override async reset(): Promise<void> {
    if (this.on !== this.defaultOn) {
      await this.setOn(this.defaultOn);
    }
  }

  protected logOnState(value: CharacteristicValue) {
    this.logIfDesired(value ? strings.accessory.onOff.stateOn : strings.accessory.onOff.stateOff, this.config.name);
  }
}
