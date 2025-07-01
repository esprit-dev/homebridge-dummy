import { PlatformAccessory, Service } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_ALIAS } from '../homebridge/settings.js';

import { CharacteristicType, DummyAccessoryConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import getVersion from '../tools/version.js';
import { Timer } from '../model/timer.js';
import { assert } from '../tools/validation.js';

export abstract class DummyAccessory {

  public static identifier(config: DummyAccessoryConfig): string {
    return `${PLATFORM_NAME}:${config.type}:${config.name.replace(/\s+/g,'')}`;
  }

  protected readonly accessoryService: Service;

  private readonly timer: Timer;

  constructor(
    protected readonly Service: ServiceType,
    protected readonly Characteristic: CharacteristicType,
    protected readonly accessory: PlatformAccessory,
    protected readonly config: DummyAccessoryConfig,
    protected readonly log: Log,
    protected readonly persistPath: string,
    private readonly caller: string,
  ) {
   
    this.timer = new Timer(config.name, config.disableLogging ? undefined : log);

    accessory.getService(Service.AccessoryInformation)!
      .setCharacteristic(Characteristic.Name, config.name)
      .setCharacteristic(Characteristic.ConfiguredName, config.name)
      .setCharacteristic(Characteristic.Manufacturer, PLUGIN_ALIAS)
      .setCharacteristic(Characteristic.Model, caller)
      .setCharacteristic(Characteristic.FirmwareRevision, getVersion());

    this.accessoryService = this.getAccessoryService();
  }

  protected abstract getAccessoryService(): Service;

  public teardown() {
    this.timer.teardown();
  }

  protected get identifier(): string {
    return DummyAccessory.identifier(this.config);
  }

  protected startTimer(callback: () => Promise<void>) {

    if (!this.config.timer?.delay) {
      return;
    }

    if (!assert(this.log, this.caller, this.config.timer, 'units')) {
      return;
    }

    this.timer.start(this.config.timer, callback);
  }

  protected cancelTimer() {
    this.timer.cancel();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected assert(...keys: (keyof any)[]): boolean {
    return assert(this.log, this.config.name, this.config, ...keys);
  }

  protected logIfDesired(message: string, ...parameters: string[]) {

    if (this.config.disableLogging) {
      return;
    }

    this.log.always(message, ...parameters);
  }
}