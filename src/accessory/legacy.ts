import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import { CharacteristicType, LegacyAccessoryConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { storageGet, storageSet } from '../tools/storage.js';
import getVersion from '../tools/version.js';

export const SUFFIX_BRIGHTNESS = '_brightness';
export const SUFFIX_STATE = '_state';

export const LEGACY_ACCESSORY_NAME = 'DummySwitch';

export class LegacyAccessory {
  private readonly log: Log | undefined;

  private readonly accessoryService: Service;

  private readonly name: string;

  private readonly isDimmer: boolean;
  private readonly isStateful: boolean;
  private readonly isReverse: boolean;
  private readonly isRandom: boolean;
  private readonly isResettable: boolean;

  private brightness: CharacteristicValue;

  private readonly timeout: number | undefined;
  private timer: NodeJS.Timeout | undefined = undefined;

  constructor(
    log: Log,
    accessory: PlatformAccessory,
    config: LegacyAccessoryConfig,
    readonly Service: ServiceType,
    readonly Characteristic: CharacteristicType,
    readonly persistPath: string,
  ) {
    this.log = config.disableLogging ? undefined : log;

    this.name = config.name;

    this.isDimmer = config.dimmer ?? false;
    this.brightness = config.brightness ?? 0;

    this.isStateful = config.stateful ?? false;
    this.isReverse = config.reverse ?? false;

    this.timeout = config.time;
    this.isResettable = config.resettable ?? false;
    this.isRandom = config.random ?? false;

    const model = this.isDimmer ? 'Dummy Dimmer' : 'Dummy Switch';
    const serviceType = this.isDimmer ? Service.Lightbulb : Service.Switch;

    this.accessoryService = accessory.getService(serviceType) || accessory.addService(serviceType);

    accessory.getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Name, this.name)
      .setCharacteristic(this.Characteristic.ConfiguredName, this.name)
      .setCharacteristic(this.Characteristic.Manufacturer, 'Homebridge')
      .setCharacteristic(this.Characteristic.SerialNumber, 'Dummy-' + this.name.replace(/\s/g, '-'))
      .setCharacteristic(this.Characteristic.Model, model)
      .setCharacteristic(this.Characteristic.FirmwareRevision, getVersion());

    this.finishSetup();
  }

  public static identifier(config: LegacyAccessoryConfig): string {
    return `DummySwitch:${config.name}`;
  }

  public teardown() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  private async finishSetup() {

    if (this.isReverse) {
      this.accessoryService.setCharacteristic(this.Characteristic.On, true);
    }

    if (this.isStateful) {
      const state = await storageGet(this.persistPath, this.storageKey(SUFFIX_STATE)) === 'true';
      this.accessoryService.setCharacteristic(this.Characteristic.On, state);
    }

    if (this.isDimmer) {

      const brightness = await storageGet(this.persistPath, this.storageKey(SUFFIX_BRIGHTNESS));
      if (brightness) {
        this.brightness = Number(brightness);
        this.accessoryService.setCharacteristic(this.Characteristic.Brightness, Number(this.brightness));
      } else {
        this.accessoryService.setCharacteristic(this.Characteristic.Brightness, 0);
      }

      this.accessoryService.getCharacteristic(this.Characteristic.Brightness)
        .onGet(this._getBrightness.bind(this))
        .onSet(this._setBrightness.bind(this));
    }

    this.accessoryService.getCharacteristic(this.Characteristic.On)
      .onSet(this._setOn.bind(this));
  }

  private storageKey(suffix: string): string {
    return this.name.replace(/\s/g, '_').toLowerCase() + suffix;
  }

  private randomize(timeout: number | undefined): number | undefined {
    return timeout ? Math.floor(Math.random() * (timeout + 1)) : undefined;
  }

  private async _getBrightness(): Promise<CharacteristicValue> {
    return this.brightness;
  }

  private async _setBrightness(brightness: CharacteristicValue): Promise<void> {
    this.log?.always('Brightness = %s', brightness);
    this.brightness = brightness;
    await storageSet(this.persistPath, this.storageKey(SUFFIX_BRIGHTNESS), brightness.toString());
  };

  private async _setOn(value: CharacteristicValue): Promise<void> {

    if (this.isDimmer) {
      this.log?.always('%s / %s', value ? 'On' : 'Off', this.brightness);
    } else {
      this.log?.always(value ? 'On' : 'Off');
    }

    if (this.isStateful) {
      await storageSet(this.persistPath, this.storageKey(SUFFIX_STATE), value.toString());
      return;
    }

    if (value === this.isReverse) {
      return;
    }

    if (this.isResettable) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    const delay = this.isRandom ? this.randomize(this.timeout) : this.timeout;
    if (!delay) {
      return;
    }

    if (delay % 1000 === 0) {
      this.log?.always('Delaying %ss…', delay / 1000);
    } else {
      this.log?.always('Delaying %sms…', delay);
    }

    this.timer = setTimeout(() => {
      this.accessoryService.setCharacteristic(this.Characteristic.On, this.isReverse as CharacteristicValue);
    }, delay);
  };
}
