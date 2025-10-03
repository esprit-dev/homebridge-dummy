import { DAY, getDelay, HOUR, MINUTE, SECOND, Timeout } from './timeout.js';

import { strings } from '../i18n/i18n.js';

import { isValidTimeUnits, printableValues, TimePeriod, TimeUnits } from '../model/enums.js';
import { LimiterConfig } from '../model/types.js';

import { Log } from '../tools/log.js';
import { Storage } from '../tools/storage.js';
import { assert } from '../tools/validation.js';

type Limit = { timeRemaining: number, resetTimestamp: number };

export default class Limiter extends Timeout {

  static new(config: LimiterConfig, caller: string, log: Log, disableLogging: boolean): Limiter | undefined {

    if (!assert(log, caller, config, 'limit', 'units', 'period')) {
      return;
    }

    if (!isValidTimeUnits(config.units)) {
      log.error(strings.limiter.badUnits, caller, `'${config.units}'`, printableValues(TimeUnits));
      return;
    }

    let periodLength;
    switch(config.period) {
    case TimePeriod.HOUR:
      periodLength = HOUR;
      break;
    case TimePeriod.DAY:
      periodLength = DAY;
      break;
    case TimePeriod.WEEK:
      periodLength = 7 * DAY;
      break;
    case TimePeriod.MONTH:
      periodLength = 31 * DAY;
      break;
    default:
      log.error(strings.limiter.badPeriod, caller, `'${config.period}'`, printableValues(TimePeriod));
      return;
    }

    const delay = getDelay(config.limit, config.units);
    if (delay > periodLength) {
      log.error(strings.limiter.limitExceedsPeriod, caller);
      return;
    }

    return new Limiter(config, caller, log, disableLogging);
  }

  private limit: Limit = { timeRemaining: -1, resetTimestamp: -1 };

  private startedAtTimestamp?: number;

  private constructor(
    private readonly config: LimiterConfig,
    caller: string,
    log: Log,
    disableLogging: boolean,
  ) {
    super(caller, log, disableLogging);

    setTimeout(async () => {
      const cache = await storageGet(this.limitStorageKey);
      if (cache) {
        this.limit = cache;
      }
    });
  }

  private get limitStorageKey(): string {
    const identifier = this.config.id ?? this.caller;
    return `${identifier}:Limit`;
  }

  public start(callback:  () => Promise<void>) {

    super.cancel();

    if (Date.now() - this.limit.resetTimestamp >= 0 || this.limit.timeRemaining === -1) {
      this.resetTimeRemaining();
      this.resetPeriod();
    }

    const timeUntilPeriodReset = this.limit.resetTimestamp - Date.now();
    if (this.limit.timeRemaining > timeUntilPeriodReset) {
      this.resetTimeRemaining();
      this.limit.timeRemaining += timeUntilPeriodReset;
    }

    if (this.limit.timeRemaining > 0) {
      this.startedAtTimestamp = Date.now();
    }

    this.logTimeRemaining();

    this.timeout = setTimeout(async () => {
      this.reset();
      await callback();
    }, Math.max(this.limit.timeRemaining, 0.1 * SECOND));

    this.storeLimit();
  }

  override reset() {
    super.reset();

    if (!this.startedAtTimestamp) {
      return;
    }

    const elapsedTime = Date.now() - this.startedAtTimestamp;
    this.limit.timeRemaining = Math.max(0, this.limit.timeRemaining - elapsedTime);

    this.startedAtTimestamp = undefined;

    this.logTimeRemaining();

    this.storeLimit();
  }

  private resetTimeRemaining() {
    this.limit.timeRemaining = this.getDelay(this.config.limit, this.config.units);
  }

  private resetPeriod() {

    const date = new Date();
    switch (this.config.period) {
    case TimePeriod.HOUR:
      date.setHours(date.getHours() + 1, 0, 0, 0);
      break;
    case TimePeriod.DAY:
      date.setDate(date.getDate() + 1);
      date.setHours(0, 0, 0, 0);
      break;
    case TimePeriod.WEEK:
      date.setDate(date.getDate() + ((7 - date.getDay()) % 7 || 7));
      date.setHours(0, 0, 0, 0);
      break;
    case TimePeriod.MONTH:
      date.setMonth(date.getMonth() + 1, 1);
      date.setHours(0, 0, 0, 0);
      break;
    }

    this.limit.resetTimestamp = date.getTime();
  }

  private storeLimit() {
    Storage.set(this.limitStorageKey, this.limit);
  }

  private logTimeRemaining() {

    if (this.limit.timeRemaining < 0) {
      return;
    }

    if (this.limit.timeRemaining === 0) {
      this.logIfDesired(strings.limiter.expired);
    } else if (this.limit.timeRemaining < MINUTE) {
      this.logIfDesired(strings.limiter.remainingSeconds, this.limit.timeRemaining / SECOND);
    } else if (this.limit.timeRemaining < HOUR) {
      this.logIfDesired(strings.limiter.remainingMinutes, this.limit.timeRemaining / MINUTE);
    } else if (this.limit.timeRemaining < DAY) {
      this.logIfDesired(strings.limiter.remainingHours, this.limit.timeRemaining / HOUR);
    } else {
      this.logIfDesired(strings.limiter.remainingDayPlus);
    }
  }
}