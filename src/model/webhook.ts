import escape from 'escape-html';
import express, { Request, Response } from 'express';
import { CharacteristicValue } from 'homebridge';
import { Server } from 'http';

import { isValidTemperatureUnits, printableValues, TemperatureUnits, WebhookCommand } from './enums.js';
import { CharacteristicType, DummyConfig } from './types.js';

import { DummyAccessory } from '../accessory/base.js';

import { Log } from '../tools/log.js';
import { assert } from '../tools/validation.js';
import { strings } from '../i18n/i18n.js';
import { fromCelsius, toCelsius } from '../tools/temperature.js';

const DEFAULT_PORT = 63743;

const MINIMUM_TEMPERATURE = 10;
const MAXIMUM_TEMPERATURE = 38;

type WebhookCallback = (value: CharacteristicValue) => (string);

export class Webhook {

  constructor(
    public readonly id: string,
    public readonly command: WebhookCommand,
    public readonly callback: WebhookCallback,
  ){}
}

export class WebhookManager {

  private server: Server | undefined = undefined;

  private readonly webhooks = new Map<WebhookCommand, Map<string, WebhookCallback>>();

  constructor(
    private readonly Characteristic: CharacteristicType,
    private readonly log: Log,
  ) {}

  public registerAccessory(accessory: DummyAccessory<DummyConfig>) {
    for (const webhook of accessory.webhooks()) {

      let callbacks = this.webhooks.get(webhook.command);
      if (callbacks === undefined) {
        callbacks = new Map<string, WebhookCallback>();
        this.webhooks.set(webhook.command, callbacks);
      }

      callbacks.set(webhook.id, webhook.callback);

      this.log.ifVerbose(strings.webhook.register, `'${webhook.id}'` , `'${webhook.command}'`);
    }
  }

  public startServer() {

    if (this.server !== undefined) {
      throw new Error('Trying to start webhook server when it is already running');
    }

    if (this.webhooks.size === 0) {
      return;
    }

    const exp = express();
    exp.use(express.urlencoded({ extended: true }));
    exp.use(express.json());

    exp.post('/', (request, response) => {
      this.requestHandler(request, response);
    });

    this.server = exp.listen(DEFAULT_PORT, () => {
      this.log.ifVerbose(strings.webhook.started, DEFAULT_PORT);
    });
  }

  public teardown() {
    this.log.ifVerbose(strings.webhook.stopping);
    this.server?.close(() => {
      this.log.ifVerbose(strings.webhook.stopped);
    });
  };

  private requestHandler(request: Request, response: Response) {

    const body = request.body;
    this.log.ifVerbose(`${strings.webhook.received}\n${JSON.stringify(body)}`);

    if (!assert(this.log, 'Webhook', body, 'id', 'command', 'value')) {
      const missingValues = ['id', 'command', 'value'].filter( (key) => body[key] === undefined);
      this.onBadRequest(response, `${strings.webhook.missing} ${missingValues.join(', ')}`, false);
      return;
    }

    const id: string = body.id;
    const command: WebhookCommand = body.command;
    let value: CharacteristicValue = body.value;

    let validRequest: boolean;
    let requirements: string;
    switch (command) {
    case WebhookCommand.Brightness: {
      validRequest = this.isValueWithinRange(value, 0, 100);
      requirements = strings.webhook.validRange.replace('%s', `'${command}'`).replace('%s', '0').replace('%s', '100');
      break;
    }
    case WebhookCommand.LockTargetState: {
      validRequest = this.isValidValue(value, [this.Characteristic.LockTargetState.UNSECURED, this.Characteristic.LockTargetState.SECURED]);
      const validValues = '0 (UNSECURED), 1 (SECURED)';
      requirements = `${strings.webhook.validValues.replace('%s', `'${command}'`)} ${validValues}`;
      break;
    }
    case WebhookCommand.On: {
      validRequest = this.isValidValue(value, [true, false]);
      requirements = `${strings.webhook.validValues.replace('%s', `'${command}'`)} true, false`;
      break;
    }
    case WebhookCommand.TargetHeatingCoolingState: {
      validRequest = this.isValidValue(value,
        [
          this.Characteristic.TargetHeatingCoolingState.OFF,
          this.Characteristic.TargetHeatingCoolingState.HEAT,
          this.Characteristic.TargetHeatingCoolingState.COOL,
          this.Characteristic.TargetHeatingCoolingState.AUTO,
        ],
      );
      const validValues = '0 (OFF), 1 (HEAT), 2 (COOL), 3 (AUTO)';
      requirements = `${strings.webhook.validValues.replace('%s', `'${command}'`)} ${validValues}`;
      break;
    }
    case WebhookCommand.TargetPosition: {
      validRequest = this.isValueWithinRange(value, 0, 100);
      requirements = strings.webhook.validRange.replace('%s', `'${command}'`).replace('%s', '0').replace('%s', '100');
      break;
    }
    case WebhookCommand.TargetTemperature: {

      if (!isValidTemperatureUnits(body.units)) {
        validRequest = false;
        requirements = `${strings.webhook.badUnits.replace('%s', `'${command}'`).replace('%s', `'${body.units}'`)} ${printableValues(TemperatureUnits)}`;
        break;
      }

      const units = body.units ?? TemperatureUnits.CELSIUS;
      const minTemp = fromCelsius(MINIMUM_TEMPERATURE, units);
      const maxTemp = fromCelsius(MAXIMUM_TEMPERATURE, units);
      validRequest = this.isValueWithinRange(value, minTemp, maxTemp);
      requirements = strings.webhook.validRange.replace('%s', `'${command}'`).replace('%s', `${minTemp}`).replace('%s', `${maxTemp}`);
      if (validRequest) {
        value = toCelsius(value as number, units);
      }

      break;
    }
    default:
      this.onBadRequest(response, strings.webhook.unsupportedCommand.replace('%s', `'${command}'`));
      return;
    }

    if (!validRequest) {
      this.onBadRequest(response, requirements);
      return;
    }

    const callbacks = this.webhooks.get(command);
    if (callbacks === undefined) {
      this.onBadRequest(response, strings.webhook.unregisteredCommand.replace('%s', `'${command}'`));
      return;
    }

    const callback = callbacks.get(id);
    if (callback === undefined) {
      this.onBadRequest(response, strings.webhook.unregisteredId.replace('%s', `'${id}'`));
      return;
    }

    const message = callback(value);
    response.status(200).send(`{ "success": "${escape(message)}" }\n`);
  }

  private isValidValue(value: CharacteristicValue, validValues: (number | boolean)[]): boolean {
    if (typeof value === 'boolean' || typeof value === 'number') {
      return validValues.includes(value);
    }
    return false;
  }

  private isValueWithinRange(value: CharacteristicValue, min: number, max: number): boolean {
    if (typeof value !== 'number') {
      return false;
    }
    return value >= min && value <= max;
  }

  private onBadRequest(response: Response, errorMessage: string, alsoLog: boolean = true) {

    response.status(400).send(`{ "error": "${escape(errorMessage)}" }\n`);

    if(alsoLog) {
      this.log.error(errorMessage);
    }
  }
}