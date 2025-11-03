import { CronJob, validateCronExpression } from 'cron';
import SunCalc from 'suncalc';

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
    case ScheduleType.DAWN:
    case ScheduleType.DUSK:
    case ScheduleType.GOLDEN_HOUR:
    case ScheduleType.NIGHT:
    case ScheduleType.SUNRISE:
    case ScheduleType.SUNSET:
      if (!assert(dependency.log, dependency.caller, config, 'latitude', 'longitude')) {
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
    case ScheduleType.DAWN:
    case ScheduleType.DUSK:
    case ScheduleType.GOLDEN_HOUR:
    case ScheduleType.NIGHT:
    case ScheduleType.SUNRISE:
    case ScheduleType.SUNSET:
      this.startTimeout();
      break;
    case ScheduleType.CRON:
      this.startCron();
      break;
    }
  }

  private startTimeout() {

    this.reset();

    this.timeout = setTimeout(async () => {
      this.reset();
      await this.callback();
      this.startTimeout();
    }, this.delay);
  }

  private get delay(): number {

    const logStrings = DelayLogStrings(
      strings.schedule.intervalMilliseconds,
      strings.schedule.intervalSeconds,
      strings.schedule.intervalMinutes,
      strings.schedule.intervalHours,
    );

    switch (this.config.type) {
    case ScheduleType.INTERVAL:
      return this.getDelay(this.config.interval!, this.config.units!, this.config.random, logStrings);
    case ScheduleType.DAWN:
    case ScheduleType.DUSK:
    case ScheduleType.GOLDEN_HOUR:
    case ScheduleType.NIGHT:
    case ScheduleType.SUNRISE:
    case ScheduleType.SUNSET:
      return this.getSunDelay();
    }

    throw new Error(`Cannot get delay for type '${this.config.type}'`);
  }

  private getSunDelay(): number {

    const date = new Date();
    let eventDate = this.getSunEventDate(date);

    if (eventDate.getTime() - date.getTime() <= 0) {
      date.setDate(date.getDate() + 1);
      eventDate = this.getSunEventDate(date);
    }

    const minutesOffset = this.config.offset;
    if (minutesOffset !== undefined) {
      eventDate.setMinutes(eventDate.getMinutes() + minutesOffset);
    }

    this.logIfDesired(strings.schedule.sunTime, eventDate.toLocaleTimeString());

    return eventDate.getTime() - Date.now();
  }

  private getSunEventDate(date: Date): Date {

    const times = SunCalc.getTimes(date, this.config.latitude!, this.config.longitude!);

    switch (this.config.type) {
    case ScheduleType.DAWN:
      return times.dawn;
    case ScheduleType.DUSK:
      return times.dusk;
    case ScheduleType.GOLDEN_HOUR:
      return times.goldenHour;
    case ScheduleType.NIGHT:
      return times.night;
    case ScheduleType.SUNRISE:
      return times.sunrise;
    case ScheduleType.SUNSET:
      return times.sunset;
    }

    throw new Error(`Cannot get sun delay for time type '${this.config.type}'`);
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