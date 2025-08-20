import { CronJob, validateCronExpression } from 'cron';

import { DelayLogStrings, Timeout } from './timeout.js';

import { strings } from '../i18n/i18n.js';

import { ScheduleType }  from '../model/enums.js';
import { ScheduleConfig } from '../model/types.js';

import { Log } from '../tools/log.js';
import { assert } from '../tools/validation.js';

export class Schedule extends Timeout {

  static new(schedule: ScheduleConfig, caller: string,  log: Log, disableLogging: boolean, callback:  () => Promise<void>): Schedule | undefined {

    if (!assert(log, caller, schedule, 'type')) {
      return;
    }

    switch(schedule.type) {
    case ScheduleType.INTERVAL:
      if (!assert(log, caller, schedule, 'interval', 'units')) {
        return;
      }
      break;
    case ScheduleType.CRON:
      if (!assert(log, caller, schedule, 'cron')) {
        return;
      }
    }
    return new Schedule(schedule, caller, log, disableLogging, callback);
  }

  private cronjob?: CronJob;

  private constructor(
    private readonly schedule: ScheduleConfig,
    caller: string,
    log: Log,
    disableLogging: boolean,
    private readonly callback:  () => Promise<void>,
  ) {

    super(caller, log, disableLogging);

    switch(this.schedule.type) {
    case ScheduleType.INTERVAL:
      this.startTimeout();
      break;
    case ScheduleType.CRON:
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
      strings.accessory.schedule.intervalMilliseconds,
      strings.accessory.schedule.intervalSeconds,
      strings.accessory.schedule.intervalMinutes,
      strings.accessory.schedule.intervalHours,
    );

    const delay = this.getDelay(this.schedule.interval!, this.schedule.units!, this.schedule.random, logStrings);

    this.timeout = setTimeout(async () => {
      this.reset();
      await this.callback();
      this.startTimeout();
    }, delay);
  }

  private startCron() {

    const cron = this.schedule.cron!;

    if (!validateCronExpression(cron).valid) {
      this.log.error(strings.accessory.invalidCron, this.caller, `'${this.schedule.cron}'`);
      return;
    }

    this.logIfDesired(strings.accessory.schedule.cron);

    this.cronjob = new CronJob(this.schedule.cron!, this.callback);
    this.cronjob.start();
  }

  override teardown() {
    super.teardown();
    this.cronjob?.stop();
  }
}