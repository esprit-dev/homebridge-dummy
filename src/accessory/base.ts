import { exec } from 'child_process';
import { PlatformAccessory, Service } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_ALIAS } from '../homebridge/settings.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType, CharacteristicType, DummyConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { STORAGE_KEY_SUFFIX_DEFAULT_STATE } from '../tools/storage.js';
import { Timer } from '../model/timer.js';
import { assert } from '../tools/validation.js';
import getVersion from '../tools/version.js';

export abstract class DummyAccessory<C extends DummyConfig> {

  public static identifier(config: DummyConfig): string {
    return config.id ?? `${PLATFORM_NAME}:${config.type}:${config.name.replace(/\s+/g,'')}`;
  }

  protected readonly accessoryService: Service;

  private readonly timer: Timer;

  constructor(
    protected readonly Service: ServiceType,
    protected readonly Characteristic: CharacteristicType,
    protected readonly accessory: PlatformAccessory,
    protected readonly config: C,
    protected readonly log: Log,
    protected readonly persistPath: string,
    isGrouped: boolean,
  ) {
   
    this.timer = new Timer(config.name, config.disableLogging ? undefined : log);

    const serviceInstance = Service[this.getAccessoryType()];

    if (isGrouped) {
      this.accessoryService =
      accessory.getServiceById(serviceInstance, this.identifier) ||
      accessory.addService(serviceInstance, config.name, this.identifier);
      return;
    }
    
    accessory.getService(Service.AccessoryInformation)!
      .setCharacteristic(Characteristic.Name, config.name)
      .setCharacteristic(Characteristic.ConfiguredName, config.name)
      .setCharacteristic(Characteristic.Manufacturer, PLUGIN_ALIAS)
      .setCharacteristic(Characteristic.Model, config.type)
      .setCharacteristic(Characteristic.SerialNumber, this.identifier)
      .setCharacteristic(Characteristic.FirmwareRevision, getVersion());

    this.accessoryService = accessory.getService(serviceInstance) || accessory.addService(serviceInstance);
  }

  protected abstract getAccessoryType(): AccessoryType;

  public teardown() {
    this.timer.teardown();
  }

  protected get identifier(): string {
    return DummyAccessory.identifier(this.config);
  }

  protected get isStateful(): boolean {
    return this.config.timer?.delay === undefined && !this.config.resetOnRestart;
  }

  protected get defaultStateStorageKey(): string {
    return `${this.identifier}:${STORAGE_KEY_SUFFIX_DEFAULT_STATE}`;
  }

  protected startTimer(callback: () => Promise<void>) {

    if (!this.config.timer?.delay) {
      return;
    }

    if (!assert(this.log, this.config.name, this.config.timer, 'units')) {
      return;
    }

    this.timer.start(this.config.timer, callback);
  }

  protected cancelTimer() {
    this.timer.cancel();
  }

  protected executeCommand(command: string) {
    exec(command, (_error, stdout, stderr) => {
      if (stderr) {
        this.log.error(`${strings.accessory.command.error}: %s\n%s`, this.config.name, command, stderr);
      } else {
        this.logIfDesired(`${strings.accessory.command.executed}: %s\n%s`, this.config.name, command, stdout);
      }
    });
  }

  protected assert(...keys: (keyof C)[]): boolean {
    return assert(this.log, this.config.name, this.config, ...keys);
  }

  protected logIfDesired(message: string, ...parameters: string[]) {

    if (this.config.disableLogging) {
      return;
    }

    this.log.always(message, ...parameters);
  }
}