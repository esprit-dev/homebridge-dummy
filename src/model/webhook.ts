import express, { Request, Response } from 'express';
import { CharacteristicValue } from 'homebridge';
import { Server } from 'http';

import { HKCharacteristicKey } from './enums.js';

import { strings } from '../i18n/i18n.js';

import { Log } from '../tools/log.js';
import { toPrimitive } from '../tools/primitive.js';
import { assert } from '../tools/validation.js';

const DEFAULT_PORT = 63743;

type WebhookGetter = () => (CharacteristicValue);
type WebhookSetter = (value: CharacteristicValue, syncOnly: boolean) => (string);

export class Range {
  constructor(readonly min: number, readonly max: number) {}
}

export class Values {
  constructor(readonly values: CharacteristicValue[], readonly asString: string) {}
}

export class Webhook {

  constructor(
    public readonly id: string,
    public readonly characteristic: HKCharacteristicKey,
    public readonly validValues: Range | Values,
    public readonly getter: WebhookGetter,
    public readonly setter: WebhookSetter,
    public readonly disableLogging: boolean | undefined,
  ){}
}

export class WebhookManager {

  private server: Server | undefined = undefined;

  private readonly webhooks: Webhook[] = [];

  constructor(
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
      if (!webhook.disableLogging) {
        this.log.always(strings.webhook.register, `\`${webhook.id}\`` , `\`${webhook.characteristic}\``);
      }
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
      this.onRequest(request, response);
    });

    exp.post('/', (request, response) => {
      this.onRequest(request, response);
    });

    this.server = exp.listen(this.port, () => {
      this.log.always(strings.webhook.started, this.port);
    });
  }

  public teardown() {
    this.log.ifVerbose(strings.webhook.stopping);
    this.server?.close(() => {
      this.log.ifVerbose(strings.webhook.stopped);
    });
  };

  private onRequest(request: Request, response: Response) {

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

    const characteristic: HKCharacteristicKey = data.set ?? data.sync ?? data.command;
    if (characteristic === undefined) {
      this.onBadRequest(response, strings.webhook.missingCharacteristic);
      return;
    }

    if (!assert(this.log, 'Webhook', data, 'value')) {
      this.onBadRequest(response, strings.webhook.missingValue, false);
      return;
    }

    const value: CharacteristicValue = toPrimitive(data.value);
    this.setValue(response, id, characteristic, value, characteristic === data.sync);
  }

  private getValue(response: Response, id: string, characteristic: HKCharacteristicKey) {

    const webhook = this.getWebhook(response, id, characteristic);
    if (webhook === undefined) {
      return;
    }

    const value = webhook.getter();
    response.status(200).json({ value: value });
  }

  private setValue(
    response: Response, id: string, characteristic: HKCharacteristicKey, value: CharacteristicValue, syncOnly: boolean) {

    const webhook = this.getWebhook(response, id, characteristic);
    if (webhook === undefined) {
      return;
    }

    if (webhook.validValues instanceof Range) {

      const min = webhook.validValues.min;
      const max = webhook.validValues.max;
      if (typeof value !== 'number' || value < min || value > max) {
        const message = strings.webhook.validRange.replace('%s', characteristic).replace('%s', `${min}`).replace('%s', `${max}`);
        this.onBadRequest(response, message);
        return;
      }

    } else if ( (typeof value !== 'boolean' && typeof value !== 'number') || !webhook.validValues.values.includes(value)) {
      const message = `${strings.webhook.validValues.replace('%s', characteristic)} ${webhook.validValues.asString}`;
      this.onBadRequest(response, message);
      return;
    }

    const message = webhook.setter(value, syncOnly);
    response.status(200).json({ success: message });
  }

  private getWebhook(response: Response, id: string, characteristic: HKCharacteristicKey): Webhook | undefined {

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

  private onBadRequest(response: Response, errorMessage: string, alsoLog: boolean = true) {

    response.status(400).json({ error: errorMessage });

    if(alsoLog) {
      this.log.error(errorMessage);
    }
  }
}