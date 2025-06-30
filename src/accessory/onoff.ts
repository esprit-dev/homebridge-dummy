import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { DummyAccessory } from './base.js';

import { strings } from '../i18n/i18n.js';

import { CharacteristicType, OnOffConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';

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

    this.accessoryService.updateCharacteristic(Characteristic.On, this.on);
  }

  protected async getOn(): Promise<CharacteristicValue> {
    return this.on;
  }

  protected async setOn(value: CharacteristicValue) {

    if (this.on === value) {
      return;
    }

    this.on = value;

    this.logIfDesired(this.on ? strings.accessory.onOff.stateOn : strings.accessory.onOff.stateOff, this.config.name);

    this.accessoryService.updateCharacteristic(this.Characteristic.On, this.on);

    if (this.on === !this.onOffConfig.defaultOn) {
      this.startTimer(this.flip.bind(this));
    } else {
      this.cancelTimer();
    }
  }

  private async flip(): Promise<void> {
    await this.setOn(!this.on);
  }
}
