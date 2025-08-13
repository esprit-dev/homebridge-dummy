import { DelayLogStrings, Timeout } from './timeout.js';

import { TimerConfig } from '../model/types.js';

import { strings } from '../i18n/i18n.js';

import { Log } from '../tools/log.js';
import { assert } from '../tools/validation.js';

export class Timer extends Timeout {

  static new(config: TimerConfig, caller: string, log: Log, disableLogging: boolean): Timer | undefined {
    if (!assert(log, caller, config, 'delay', 'units')) {
      return undefined;
    }
    return new Timer(config, caller, log, disableLogging);
  }

  private constructor(
    private readonly config: TimerConfig,
    caller: string,
    log: Log,
    disableLogging: boolean,
  ) {
    super(caller, log, disableLogging);
  }

  protected get cancelString(): string {
    return strings.accessory.timer.cancel;
  }

  public start(callback:  () => Promise<void>) {

    this.cancel();

    const logStrings = DelayLogStrings(
      strings.accessory.timer.setMilliseconds,
      strings.accessory.timer.setSeconds,
      strings.accessory.timer.setMinutes,
      strings.accessory.timer.setHours,
    );

    const delay = this.getDelay(this.config.delay, this.config.units, this.config.random, logStrings);

    this.timeout = setTimeout(async () => {
      this.reset();
      await callback();
    }, delay);
  }
}