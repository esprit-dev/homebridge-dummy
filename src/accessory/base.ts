import { exec } from 'child_process';
import { PlatformAccessory, Service } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_ALIAS } from '../homebridge/settings.js';

import { SensorAccessory } from './sensor.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType } from '../model/enums.js';
import { CharacteristicType, DummyConfig, ServiceType } from '../model/types.js';
import { Webhook } from '../model/webhook.js';

import { Schedule } from '../timeout/schedule.js';
import { Timer } from '../timeout/timer.js';

import { Log } from '../tools/log.js';
import { STORAGE_KEY_SUFFIX_DEFAULT_STATE } from '../tools/storage.js';
import getVersion from '../tools/version.js';

export abstract class DummyAccessory<C extends DummyConfig> {

  protected sensor?: SensorAccessory;

  public static identifier(config: DummyConfig): string {
    return config.id ?? `${PLATFORM_NAME}:${config.type}:${config.name.replace(/\s+/g,'')}`;
  }

  protected readonly accessoryService: Service;

  private readonly _schedule?: Schedule;
  private readonly _timer?: Timer;

  constructor(
    protected readonly Service: ServiceType,
    protected readonly Characteristic: CharacteristicType,
    protected readonly accessory: PlatformAccessory,
    protected readonly config: C,
    protected readonly log: Log,
    protected readonly persistPath: string,
    isGrouped: boolean,
  ) {

    this.sensor = SensorAccessory.new(Service, Characteristic, accessory, this.name, log, this.config.disableLogging === true, config.sensor);

    if (config.timer) {
      this._timer = Timer.new(config.timer, config.name, log, config.disableLogging === true);
    }

    if (config.schedule) {
      this._schedule = Schedule.new(config.schedule, config.name, log, config.disableLogging === true, this.schedule.bind(this));
    }

    const serviceInstance = Service[this.getAccessoryType()];

    if (isGrouped) {

      let accessoryService = accessory.getServiceById(serviceInstance, this.identifier);
      if (!accessoryService) {
        accessoryService = accessory.addService(serviceInstance, config.name, this.identifier);
        accessoryService.setCharacteristic(Characteristic.ConfiguredName, config.name);
      }

      this.accessoryService = accessoryService;

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

    for (const type of Object.values(AccessoryType)) {
      const existingService = accessory.getService(Service[type]);
      if (existingService && type !== this.getAccessoryType()) {
        accessory.removeService(existingService);
      }
    }
  }

  protected abstract getAccessoryType(): AccessoryType;

  protected abstract schedule(): Promise<void>;

  protected abstract reset(): Promise<void>;

  public get subtype(): string | undefined {
    return this.accessoryService.subtype;
  }

  public teardown() {
    this._timer?.teardown();
    this._schedule?.teardown();
  }

  public abstract webhooks(): Webhook[];

  protected get identifier(): string {
    return DummyAccessory.identifier(this.config);
  }

  protected get name(): string {
    return this.config.name;
  }

  protected get isStateful(): boolean {
    return this._timer === undefined && this._schedule === undefined && !this.config.resetOnRestart;
  }

  protected get defaultStateStorageKey(): string {
    return `${this.identifier}:${STORAGE_KEY_SUFFIX_DEFAULT_STATE}`;
  }

  protected startTimer() {
    this._timer?.start(this.reset.bind(this));
  }

  protected cancelTimer() {
    this._timer?.cancel();
  }

  protected executeCommand(command: string) {
    exec(command, (_error, stdout, stderr) => {
      if (stderr) {
        this.log.error(`${strings.accessory.command.error}: %s\n%s`, this.name, command, stderr);
      } else {
        this.logIfDesired(`${strings.accessory.command.executed}: %s\n%s`, this.name, command, stdout);
      }
    });
  }

  protected logIfDesired(message: string, ...parameters: (string | number)[]) {

    if (this.config.disableLogging) {
      return;
    }

    this.log.always(message, this.name, ...parameters);
  }
}