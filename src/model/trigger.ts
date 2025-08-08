import { CronJob, validateCronExpression } from 'cron';

import { TriggerConfig, TriggerType } from './types.js';

import { strings } from '../i18n/i18n.js';

import { Log } from '../tools/log.js';
import { DelayLogStrings, getDelay } from '../tools/time.js';
import { assert } from '../tools/validation.js';

export class Trigger {

  static new(trigger: TriggerConfig, caller: string,  log: Log, disableLogging: boolean, callback:  () => Promise<void>): Trigger | undefined {

    if (!assert(log, caller, trigger, 'type')) {
      return;
    }

    switch(trigger.type) {
    case TriggerType.INTERVAL:
      if (!assert(log, caller, trigger, 'interval', 'units')) {
        return;
      }
      break;
    case TriggerType.CRON:
      if (!assert(log, caller, trigger, 'cron')) {
        return;
      }
    }
    return new Trigger(trigger, caller, log, disableLogging, callback);
  }

  private timeout?: NodeJS.Timeout;
  private cronjob?: CronJob;

  private constructor(
    private readonly trigger: TriggerConfig,
    private readonly caller: string,
    private readonly log: Log,
    private readonly disableLogging: boolean,
    private readonly callback:  () => Promise<void>,
  ) {

    switch(this.trigger.type) {
    case TriggerType.INTERVAL:
      this.startTimeout();
      break;
    case TriggerType.CRON:
      this.startCron();
      break;
    }
  }

  private startTimeout() {

    this.resetTimeout();

    const logStrings = DelayLogStrings(
      strings.accessory.trigger.intervalMilliseconds,
      strings.accessory.trigger.intervalSeconds,
      strings.accessory.trigger.intervalMinutes,
      strings.accessory.trigger.intervalHours,
    );

    const delay = getDelay(this.trigger.interval!, this.trigger.units!, this.trigger.random, this.log, this.disableLogging, this.caller, logStrings);

    this.timeout = setTimeout(async () => {
      this.resetTimeout();
      await this.callback();
      this.startTimeout();
    }, delay);
  }

  private startCron() {

    const cron = this.trigger.cron!;

    if (!validateCronExpression(cron).valid) {
      this.log.error(strings.accessory.invalidCron, this.caller, `'${this.trigger.cron}'`);
      return;
    }

    this.logIfDesired(strings.accessory.trigger.cron, this.caller);

    this.cronjob = new CronJob(this.trigger.cron!, this.callback);
    this.cronjob.start();
  }

  public teardown() {
    this.resetTimeout();
    this.cronjob?.stop();
  }

  private resetTimeout() {
    clearTimeout(this.timeout);
    this.timeout = undefined;
  }

  private logIfDesired(message: string, ...parameters: (string | number)[]) {

    if (this.disableLogging) {
      return;
    }

    this.log.always(message, this.caller, ...parameters);
  }
}