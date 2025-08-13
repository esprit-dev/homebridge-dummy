import { CronJob, validateCronExpression } from 'cron';

import { DelayLogStrings, Timeout } from './timeout.js';

import { strings } from '../i18n/i18n.js';

import { TriggerConfig, TriggerType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { assert } from '../tools/validation.js';

export class Trigger extends Timeout {

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

  private cronjob?: CronJob;

  private constructor(
    private readonly trigger: TriggerConfig,
    caller: string,
    log: Log,
    disableLogging: boolean,
    private readonly callback:  () => Promise<void>,
  ) {

    super(caller, log, disableLogging);

    switch(this.trigger.type) {
    case TriggerType.INTERVAL:
      this.startTimeout();
      break;
    case TriggerType.CRON:
      this.startCron();
      break;
    }
  }

  protected get cancelString(): string {
    throw new Error('Method not implemented.');
  }

  private startTimeout() {

    this.reset();

    const logStrings = DelayLogStrings(
      strings.accessory.trigger.intervalMilliseconds,
      strings.accessory.trigger.intervalSeconds,
      strings.accessory.trigger.intervalMinutes,
      strings.accessory.trigger.intervalHours,
    );

    const delay = this.getDelay(this.trigger.interval!, this.trigger.units!, this.trigger.random, logStrings);

    this.timeout = setTimeout(async () => {
      this.reset();
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

    this.logIfDesired(strings.accessory.trigger.cron);

    this.cronjob = new CronJob(this.trigger.cron!, this.callback);
    this.cronjob.start();
  }

  override teardown() {
    super.teardown();
    this.cronjob?.stop();
  }
}