import { DelayLogStrings, Timeout } from './timeout.js';

import { TimerConfig } from '../model/types.js';

import { strings } from '../i18n/i18n.js';

import { Log } from '../tools/log.js';
import { assert } from '../tools/validation.js';
import { isValidTimeUnits, printableValues, TimeUnits } from '../model/enums.js';

export class Timer extends Timeout {

  static new(config: TimerConfig, caller: string, log: Log, disableLogging: boolean): Timer | undefined {

    if (!assert(log, caller, config, 'delay', 'units')) {
      return;
    }

    if (!isValidTimeUnits(config.units)) {
      log.error(strings.accessory.timer.badUnits, caller, `'${config.units}'`, printableValues(TimeUnits));
      return;
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

  override cancel() {

    if (this.timeout) {
      this.logIfDesired(strings.accessory.timer.cancel);
    }

    super.cancel();
  }
}