import { CronJob, validateCronExpression } from 'cron';

import { DummyAddonDependency } from '../accessory/base.js';

import { DelayLogStrings, Timeout } from './timeout.js';

import { strings } from '../i18n/i18n.js';

import { isValidTimeUnits, printableValues, ScheduleType, TimeUnits }  from '../model/enums.js';
import { ScheduleConfig } from '../model/types.js';

import { assert } from '../tools/validation.js';

const CRON_CUSTOM = 'CRON_CUSTOM';

export class Schedule extends Timeout {

  static new(dependency: DummyAddonDependency, config: ScheduleConfig | undefined, callback:  () => Promise<void>): Schedule | undefined {

    if (config === undefined || !assert(dependency.log, dependency.caller, config, 'type')) {
      return;
    }

    switch(config.type) {
    case ScheduleType.INTERVAL:
      if (!assert(dependency.log, dependency.caller, config, 'interval', 'units')) {
        return;
      }

      if (!isValidTimeUnits(config.units!)) {
        dependency.log.error(strings.schedule.badUnits, dependency.caller, `'${config.units}'`, printableValues(TimeUnits));
        return;
      }

      break;
    case ScheduleType.CRON:
      if (!assert(dependency.log, dependency.caller, config, 'cron')) {
        return;
      }

      if (config.cron === CRON_CUSTOM && !assert(dependency.log, dependency.caller, config, 'cronCustom')) {
        return;
      }
      break;
    default:
      dependency.log.error(strings.schedule.badType, dependency.caller, `'${config.type}'`, printableValues(ScheduleType));
      return;
    }

    return new Schedule(dependency, config, callback);
  }

  private cronjob?: CronJob;

  private constructor(dependency: DummyAddonDependency, private readonly config: ScheduleConfig, private readonly callback:  () => Promise<void>) {
    super(dependency);

    switch(this.config.type) {
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

    const delay = this.getDelay(this.config.interval!, this.config.units!, this.config.random, logStrings);

    this.timeout = setTimeout(async () => {
      this.reset();
      await this.callback();
      this.startTimeout();
    }, delay);
  }

  private startCron() {

    let cron = this.config.cron!;
    if (cron === CRON_CUSTOM) {
      cron = this.config.cronCustom!;
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