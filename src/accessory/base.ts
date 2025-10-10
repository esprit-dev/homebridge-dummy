import { exec, ExecException } from 'child_process';
import { PlatformAccessory, Service } from 'homebridge';
import { promisify } from 'util';

import { PLATFORM_NAME, PLUGIN_ALIAS } from '../homebridge/settings.js';

import { SensorAccessory } from './sensor.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType } from '../model/enums.js';
import { CharacteristicType, DummyConfig, ServiceType } from '../model/types.js';
import { Webhook } from '../model/webhook.js';

import Limiter from '../timeout/limiter.js';
import { Schedule } from '../timeout/schedule.js';
import { Timer } from '../timeout/timer.js';

import { Log } from '../tools/log.js';
import getVersion from '../tools/version.js';

export abstract class DummyAccessory<C extends DummyConfig> {

  protected sensor?: SensorAccessory;

  public static identifier(config: DummyConfig): string {
    return config.id ?? `${PLATFORM_NAME}:${config.type}:${config.name.replace(/\s+/g,'')}`;
  }

  protected readonly accessoryService: Service;

  private readonly _schedule?: Schedule;
  private readonly _timer?: Timer;
  private readonly _limiter?: Limiter;

  private readonly execAsync = promisify(exec);

  constructor(
    protected readonly Service: ServiceType,
    protected readonly Characteristic: CharacteristicType,
    protected readonly accessory: PlatformAccessory,
    protected readonly config: C,
    protected readonly log: Log,
    isGrouped: boolean,
  ) {

    this.sensor = SensorAccessory.new(Service, Characteristic, accessory, this.name, log, this.config.disableLogging === true, config.sensor);

    if (config.timer) {
      this._timer = Timer.new(config.timer, this.identifier, config.name, log, config.disableLogging === true);
    }

    if (config.schedule) {
      this._schedule = Schedule.new(config.schedule, config.name, log, config.disableLogging === true, this.schedule.bind(this));
    }

    if (config.limiter){
      this._limiter = Limiter.new(config.limiter, config.name, log, config.disableLogging === true);
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
    this._limiter?.teardown();
  }

  public abstract webhooks(): Webhook[];

  protected get identifier(): string {
    return DummyAccessory.identifier(this.config);
  }

  protected get name(): string {
    return this.config.name;
  }

  protected get isStateful(): boolean {
    return this._schedule === undefined && !this.config.resetOnRestart;
  }

  protected get defaultStateStorageKey(): string {
    return `${this.identifier}:DefaultState`;
  }

  protected startTimer() {
    this._timer?.start(this.reset.bind(this));
    this._limiter?.start(this.reset.bind(this));
  }

  protected cancelTimer() {
    this._timer?.cancel();
    this._limiter?.cancel();
  }

  protected async executeCommand(command: string) {

    try {
      const { stdout } = await this.execAsync(command);
      const output = stdout.trim();

      if (output) {
        this.logIfDesired(`${strings.command.executed}: %s\n%s`, command, output);
      }

    } catch (err) {

      if (!this.isExecException(err)) {
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        this.log.error(`${strings.command.error}: %s`, this.name, message);
        return;
      }

      const exitCode = err.code ?? -1;

      const output = (err.stdout ?? '').trim();
      const error = (err.stderr ?? '').trim();

      if (exitCode === 0) {
        if (output) {
          this.logIfDesired(`${strings.command.executed}: %s\n%s`, command, output);
        }
      } else {
        this.log.error(`${strings.command.error}: %s (%s)`, this.name, command, exitCode, error ? `\n${error}` : undefined);
      }
    }
  }

  private isExecException(err: unknown): err is ExecException {
    return err instanceof Error &&
      'code' in err &&
      typeof err.code === 'number' &&
      'stdout' in err &&
      typeof err.stdout === 'string' &&
      'stderr' in err &&
      typeof err.stderr === 'string';
  }

  protected logIfDesired(message: string, ...parameters: (string | number)[]) {

    if (this.config.disableLogging) {
      return;
    }

    this.log.always(message, this.name, ...parameters);
  }
}