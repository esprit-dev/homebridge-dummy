import express, { Request, Response } from 'express';
import { CharacteristicValue } from 'homebridge';
import { Server } from 'http';

import { isValidTemperatureUnits, printableValues, TemperatureUnits, WebhookCharacteristic } from './enums.js';
import { CharacteristicType } from './types.js';

import { strings } from '../i18n/i18n.js';

import { Log } from '../tools/log.js';
import { toPrimitive } from '../tools/primitive.js';
import { fromCelsius, toCelsius } from '../tools/temperature.js';
import { assert } from '../tools/validation.js';

const DEFAULT_PORT = 63743;

const MINIMUM_TEMPERATURE = 10;
const MAXIMUM_TEMPERATURE = 38;

type WebhookGetter = () => (CharacteristicValue);
type WebhookSetter = (value: CharacteristicValue) => (string);

export class Webhook {

  constructor(
    public readonly id: string,
    public readonly characteristic: WebhookCharacteristic,
    public readonly getter: WebhookGetter,
    public readonly setter: WebhookSetter,
  ){}
}

export class WebhookManager {

  private server: Server | undefined = undefined;

  private readonly webhooks: Webhook[] = [];

  constructor(
    private readonly Characteristic: CharacteristicType,
    private readonly log: Log,
    private readonly port: number | undefined,
  ) {

    this.port = port ?? DEFAULT_PORT;

    if (typeof this.port !== 'number') {
      log.error(strings.webhook.badPort, DEFAULT_PORT);
      this.port = DEFAULT_PORT;
    }
  }

  public registerWebhooks(webhooks: Webhook[]) {
    for (const webhook of webhooks) {
      this.webhooks.push(webhook);
      this.log.ifVerbose(strings.webhook.register, `\`${webhook.id}\`` , `\`${webhook.characteristic}\``);
    }
  }

  public startServer() {

    if (this.server !== undefined) {
      throw new Error('Trying to start webhook server when it is already running');
    }

    if (this.webhooks.length === 0) {
      return;
    }

    const exp = express();
    exp.use(express.urlencoded({ extended: true }));
    exp.use(express.json());

    exp.get('/', (request, response) => {
      this.requestHandler(request, response);
    });

    exp.post('/', (request, response) => {
      this.requestHandler(request, response);
    });

    this.server = exp.listen(this.port, () => {
      this.log.ifVerbose(strings.webhook.started, this.port);
    });
  }

  public teardown() {
    this.log.ifVerbose(strings.webhook.stopping);
    this.server?.close(() => {
      this.log.ifVerbose(strings.webhook.stopped);
    });
  };

  private requestHandler(request: Request, response: Response) {

    const data = { ...request.query, ...request.body };
    this.log.ifVerbose(`${strings.webhook.received}\n${JSON.stringify(data)}`);

    if (!assert(this.log, 'Webhook', data, 'id')) {
      this.onBadRequest(response, strings.webhook.missingId, false);
      return;
    }

    const id: string = data.id;

    if (data.get !== undefined) {
      this.getValue(response, id, data.get);
      return;
    }

    const characteristic: WebhookCharacteristic = data.set ?? data.command;
    if (characteristic === undefined) {
      this.onBadRequest(response, strings.webhook.missingCharacteristic);
      return;
    }

    if (!assert(this.log, 'Webhook', data, 'value')) {
      this.onBadRequest(response, strings.webhook.missingValue, false);
      return;
    }

    const value: CharacteristicValue = toPrimitive(data.value);
    this.setValue(response, id, characteristic, value, data.units);
  }


  private getValue(response: Response, id: string, characteristic: WebhookCharacteristic) {

    const webhook = this.getWebhook(response, id, characteristic);
    if (webhook === undefined) {
      return;
    }

    const value = webhook.getter();
    response.status(200).json({ value: value });
  }

  private setValue(response: Response, id: string, characteristic: WebhookCharacteristic, value: CharacteristicValue, temperatureUnits?: TemperatureUnits) {

    let validRequest: boolean;
    let requirements: string;
    switch (characteristic) {
    case WebhookCharacteristic.Brightness: {
      validRequest = this.isValueWithinRange(value, 0, 100);
      requirements = strings.webhook.validRange.replace('%s', characteristic).replace('%s', '0').replace('%s', '100');
      break;
    }
    case WebhookCharacteristic.LockTargetState: {
      validRequest = this.isValidValue(value, [this.Characteristic.LockTargetState.UNSECURED, this.Characteristic.LockTargetState.SECURED]);
      const validValues = '0 (UNSECURED), 1 (SECURED)';
      requirements = `${strings.webhook.validValues.replace('%s', characteristic)} ${validValues}`;
      break;
    }
    case WebhookCharacteristic.On: {
      validRequest = this.isValidValue(value, [true, false]);
      requirements = `${strings.webhook.validValues.replace('%s', characteristic)} true, false`;
      break;
    }
    case WebhookCharacteristic.TargetHeatingCoolingState: {
      validRequest = this.isValidValue(value,
        [
          this.Characteristic.TargetHeatingCoolingState.OFF,
          this.Characteristic.TargetHeatingCoolingState.HEAT,
          this.Characteristic.TargetHeatingCoolingState.COOL,
          this.Characteristic.TargetHeatingCoolingState.AUTO,
        ],
      );
      const validValues = '0 (OFF), 1 (HEAT), 2 (COOL), 3 (AUTO)';
      requirements = `${strings.webhook.validValues.replace('%s', characteristic)} ${validValues}`;
      break;
    }
    case WebhookCharacteristic.TargetPosition: {
      validRequest = this.isValueWithinRange(value, 0, 100);
      requirements = strings.webhook.validRange.replace('%s', characteristic).replace('%s', '0').replace('%s', '100');
      break;
    }
    case WebhookCharacteristic.TargetTemperature: {

      if (!isValidTemperatureUnits(temperatureUnits)) {
        validRequest = false;
        requirements = `${strings.webhook.badUnits.replace('%s', characteristic)
          .replace('%s', `\`${temperatureUnits}\``)} ${printableValues(TemperatureUnits)}`;
        break;
      }

      const units = temperatureUnits ?? TemperatureUnits.CELSIUS;
      const minTemp = fromCelsius(MINIMUM_TEMPERATURE, units);
      const maxTemp = fromCelsius(MAXIMUM_TEMPERATURE, units);
      validRequest = this.isValueWithinRange(value, minTemp, maxTemp);
      requirements = strings.webhook.validRange.replace('%s', characteristic).replace('%s', `${minTemp}`).replace('%s', `${maxTemp}`);
      if (validRequest) {
        value = toCelsius(value as number, units);
      }

      break;
    }
    default:
      this.onBadRequest(response, strings.webhook.unsupportedCharacteristic.replace('%s', characteristic));
      return;
    }

    if (!validRequest) {
      this.onBadRequest(response, requirements);
      return;
    }

    const webhook = this.getWebhook(response, id, characteristic);
    if (webhook === undefined) {
      return;
    }

    const message = webhook.setter(value);
    response.status(200).json({ success: message });
  }

  private getWebhook(response: Response, id: string, characteristic: WebhookCharacteristic): Webhook | undefined {

    const byId = this.webhooks.filter( (webhook) => webhook.id === id);
    if (byId.length === 0) {
      this.onBadRequest(response, strings.webhook.unregisteredId.replace('%s', `\`${id}\``));
      return;
    }

    const byCharacteristic = byId.filter( (webhook) => webhook.characteristic === characteristic);
    if (byCharacteristic.length === 0) {
      this.onBadRequest(response, strings.webhook.unregisteredCharacteristic.replace('%s', characteristic));
      return;
    }

    if (byCharacteristic.length > 1) {
      throw new Error(`Expected only one webhook for charactersitic/id but got ${byCharacteristic.length}`);
    }

    return byCharacteristic[0];
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

    response.status(400).json({ error: errorMessage });

    if(alsoLog) {
      this.log.error(errorMessage);
    }
  }
}