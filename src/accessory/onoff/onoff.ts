import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { DummyAccessory } from '../base.js';

import { strings } from '../../i18n/i18n.js';

import { CharacteristicType, OnOffConfig, ServiceType } from '../../model/types.js';
import { Webhook } from '../../model/webhook.js';

import { Log } from '../../tools/log.js';
import { storageGet, storageSet } from '../../tools/storage.js';
import { WebhookCommand } from '../../model/enums.js';

export abstract class OnOffAccessory<C extends OnOffConfig = OnOffConfig> extends DummyAccessory<C> {

  private on: boolean;

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    config: C,
    log: Log,
    isGrouped: boolean,
  ) {
    super(Service, Characteristic, accessory, config, log, isGrouped);

    this.on = this.defaultOn;

    this.accessoryService.getCharacteristic(Characteristic.On)
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

    if (this.isStateful) {
      this.on = await storageGet(this.defaultStateStorageKey) ?? this.on;
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
      this.logIfDesired(this.logMessageForOnState(value));

      if (this.config.commandOn && value) {
        this.executeCommand(this.config.commandOn);
      } else if (this.config.commandOff && !value) {
        this.executeCommand(this.config.commandOff);
      }
    }

    this.on = value as boolean;

    if (this.isStateful) {
      await storageSet(this.defaultStateStorageKey, this.on);
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

  protected logMessageForOnState(value: CharacteristicValue): string {
    return value ? strings.accessory.onOff.stateOn : strings.accessory.onOff.stateOff;
  }
}
