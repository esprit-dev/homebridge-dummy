import { TimerConfig } from './types.js';

import { strings } from '../i18n/i18n.js';

import { Log } from '../tools/log.js';
import { DelayLogStrings, getDelay } from '../tools/time.js';
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

    this.cancel();

    const logStrings = DelayLogStrings(
      strings.accessory.timer.setMilliseconds,
      strings.accessory.timer.setSeconds,
      strings.accessory.timer.setMinutes,
      strings.accessory.timer.setHours,
    );

    const delay = getDelay(this.config.delay, this.config.units, this.config.random, this.log, this.disableLogging, this.caller, logStrings);

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