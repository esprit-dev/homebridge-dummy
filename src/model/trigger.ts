import { CronJob, validateCronExpression } from 'cron';

import { TriggerConfig, TriggerType } from './types.js';

import { strings } from '../i18n/i18n.js';

import { Log } from '../tools/log.js';
import { HOUR, MINUTE, SECOND, toMilliseconds } from '../tools/time.js';
import { assert } from '../tools/validation.js';

export class Trigger {

  constructor(
    private readonly trigger: TriggerConfig,
    private readonly caller: string,
    private readonly log: Log,
    private readonly disableLogging: boolean,
    private readonly callback:  () => Promise<void>,
  ) {

    switch(this.trigger.type) {
    case TriggerType.INTERVAL: {
      this.startInterval();
      break;
    }
    case TriggerType.CRON: {
      this.startCron();
      break;
    }
    }
  }

  private startInterval() {
  
    if (!assert(this.log, this.caller, this.trigger, 'interval', 'units')) {
      return;
    }

    this.startTimeout();
  }

  private startTimeout() {

    let delay = toMilliseconds(this.trigger.interval!, this.trigger.units!);

    if (this.trigger.random) {
      delay = Math.floor(Math.max(SECOND, Math.random() * delay));
    }

    if (delay < MINUTE) {
      this.logIfDesired(strings.accessory.trigger.intervalSeconds, Math.round(delay / SECOND));
    } else if (delay < HOUR) {
      this.logIfDesired(strings.accessory.trigger.intervalMinutes, Math.round(delay / MINUTE));
    } else {
      this.logIfDesired(strings.accessory.trigger.intervalHours, Math.round(delay / HOUR));
    }

    setTimeout( () => {
      this.callback();
      this.startTimeout();
    }, delay);
  }

  private startCron() {

    if (!assert(this.log, this.caller, this.trigger, 'cron')) {
      return;
    }

    const cron = this.trigger.cron!;

    if (!validateCronExpression(cron).valid) {
      this.log.error(strings.accessory.invalidCron, this.caller, `'${this.trigger.cron}'`);
      return;
    }

    this.logIfDesired(strings.accessory.trigger.cron, this.caller);

    new CronJob(this.trigger.cron!, this.callback).start();
  }

  private logIfDesired(message: string, ...parameters: (string | number)[]) {

    if (this.disableLogging) {
      return;
    }

    this.log.always(message, this.caller, ...parameters);
  }
}