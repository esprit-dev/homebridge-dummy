import { CronJob, validateCronExpression } from 'cron';

import { DelayLogStrings, Timeout } from './timeout.js';

import { strings } from '../i18n/i18n.js';

import { isValidTimeUnits, printableValues, ScheduleType, TimeUnits }  from '../model/enums.js';
import { ScheduleConfig } from '../model/types.js';

import { Log } from '../tools/log.js';
import { assert } from '../tools/validation.js';

const CRON_CUSTOM = 'CRON_CUSTOM';

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

      if (!isValidTimeUnits(schedule.units!)) {
        log.error(strings.schedule.badUnits, caller, `'${schedule.units}'`, printableValues(TimeUnits));
        return;
      }

      break;
    case ScheduleType.CRON:
      if (!assert(log, caller, schedule, 'cron')) {
        return;
      }

      if (schedule.cron === CRON_CUSTOM && !assert(log, caller, schedule, 'cronCustom')) {
        return;
      }
      break;
    default:
      log.error(strings.schedule.badType, caller, `'${schedule.type}'`, printableValues(ScheduleType));
      return;
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

  private startTimeout() {

    this.reset();

    const logStrings = DelayLogStrings(
      strings.schedule.intervalMilliseconds,
      strings.schedule.intervalSeconds,
      strings.schedule.intervalMinutes,
      strings.schedule.intervalHours,
    );

    const delay = this.getDelay(this.schedule.interval!, this.schedule.units!, this.schedule.random, logStrings);

    this.timeout = setTimeout(async () => {
      this.reset();
      await this.callback();
      this.startTimeout();
    }, delay);
  }

  private startCron() {

    let cron = this.schedule.cron!;
    if (cron === CRON_CUSTOM) {
      cron = this.schedule.cronCustom!;
    }

    if (!validateCronExpression(cron).valid) {
      this.log.error(strings.accessory.invalidCron, this.caller, `'${cron}'`);
      return;
    }

    this.logIfDesired(strings.schedule.cron);

    this.cronjob = new CronJob(cron, this.callback);
    this.cronjob.start();
  }

  override teardown() {
    super.teardown();
    this.cronjob?.stop();
  }
}