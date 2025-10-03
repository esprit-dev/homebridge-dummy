import { DelayLogStrings, SECOND, Timeout } from './timeout.js';

import { isValidTimeUnits, printableValues, TimeUnits } from '../model/enums.js';
import { TimerConfig } from '../model/types.js';

import { strings } from '../i18n/i18n.js';

import { Log } from '../tools/log.js';
import { Storage } from '../tools/storage.js';
import { assert } from '../tools/validation.js';

export class Timer extends Timeout {

  static new(config: TimerConfig, callerId: string, callerName: string, log: Log, disableLogging: boolean): Timer | undefined {

    if (!assert(log, callerName, config, 'delay', 'units')) {
      return;
    }

    if (!isValidTimeUnits(config.units)) {
      log.error(strings.timer.badUnits, callerName, `'${config.units}'`, printableValues(TimeUnits));
      return;
    }

    return new Timer(config, callerId, callerName, log, disableLogging);
  }

  private _expiresTimestamp?: number;

  private constructor(
    private readonly config: TimerConfig,
    private readonly callerId: string,
    callerName: string,
    log: Log,
    disableLogging: boolean,
  ) {
    super(callerName, log, disableLogging);

    this.expiresTimestamp = Storage.get(this.timerStorageKey) as number;
  }

  private get timerStorageKey(): string {
    return `${this.callerId}:Timer`;
  }

  private get expiresTimestamp(): number | undefined {
    return this._expiresTimestamp;
  }

  private set expiresTimestamp(value: number | undefined) {
    this._expiresTimestamp = value;
    Storage.set(this.timerStorageKey, value);
  }

  public start(callback:  () => Promise<void>) {

    super.reset();

    const logStrings = DelayLogStrings(
      strings.timer.setMilliseconds,
      strings.timer.setSeconds,
      strings.timer.setMinutes,
      strings.timer.setHours,
    );

    let delay: number;
    if (this.expiresTimestamp !== undefined) {

      const timeRemaining = this.expiresTimestamp - Date.now();
      if (timeRemaining > 0) {
        delay = timeRemaining;
        this.logIfDesired(strings.timer.resume);
      } else {
        delay = 0.1 * SECOND;
        this.logIfDesired(strings.timer.expired);
      }

    } else {
      delay = this.getDelay(this.config.delay, this.config.units, this.config.random, logStrings);
      this.expiresTimestamp = Date.now() + delay;
    }

    this.timeout = setTimeout(async () => {
      this.reset();
      await callback();
    }, delay);
  }

  override reset() {
    this.expiresTimestamp = undefined;
    super.reset();
  }

  override cancel() {

    if (this.timeout) {
      this.logIfDesired(strings.timer.cancel);
    }

    super.cancel();
  }

  override teardown() {
    super.reset();
  }
}