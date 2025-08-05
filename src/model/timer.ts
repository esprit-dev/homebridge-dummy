import { TimerConfig, TimeUnits } from './types.js';

import { strings } from '../i18n/i18n.js';

import { Log } from '../tools/log.js';
import { HOUR, MINUTE, SECOND, toMilliseconds } from '../tools/time.js';
import { assert } from '../tools/validation.js';

export class Timer {

  static new(config: TimerConfig, caller: string, log: Log, disableLogging: boolean): Timer | undefined {
    if (!assert(log, caller, config, 'delay', 'units')) {
      return undefined;
    }
    return new Timer(config, caller, log, disableLogging);
  }

  private timeout?: NodeJS.Timeout;

  private constructor(
    private readonly config: TimerConfig,
    private readonly caller: string,
    private readonly log: Log,
    private readonly disableLogging: boolean,
  ) {}

  public start(callback:  () => Promise<void>) {

    if (this.timeout) {
      this.logIfDesired(strings.accessory.timer.reset);
      this.reset();
    }

    let delay = toMilliseconds(this.config.delay, this.config.units);
    let units = this.config.units;

    if (this.config.random) {
      delay = Math.floor(Math.max(SECOND, Math.random() * delay));

      if (delay < SECOND) {
        units = TimeUnits.MILLISECONDS;
      } else if (delay < MINUTE) {
        units = TimeUnits.SECONDS;
      } else if (delay < HOUR) {
        units = TimeUnits.MINUTES;
      }
    }

    switch(units) {
    case TimeUnits.MILLISECONDS:
      this.logIfDesired(strings.accessory.timer.setMilliseconds, delay);
      break;
    case TimeUnits.SECONDS:
      this.logIfDesired(strings.accessory.timer.setSeconds, Math.round(delay / SECOND));
      break;
    case TimeUnits.MINUTES:
      this.logIfDesired(strings.accessory.timer.setMinutes, Math.round(delay / MINUTE));
      break;
    case TimeUnits.HOURS:
      this.logIfDesired(strings.accessory.timer.setHours, Math.round(delay / HOUR));
      break;
    }

    this.timeout = setTimeout(async () => {
      this.reset();
      await callback();
    }, delay);
  }

  public cancel() {
    if (this.timeout) {
      this.logIfDesired(strings.accessory.timer.cancel);
      this.reset();
    }
  }

  public teardown() {
    this.reset();
  }

  private reset() {
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