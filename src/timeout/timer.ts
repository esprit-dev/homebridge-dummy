import { DelayLogStrings, SECOND, Timeout } from './timeout.js';

import { DummyAddonDependency } from '../accessory/base.js';

import { isValidTimeUnits, printableValues, TimeUnits } from '../model/enums.js';
import { TimerConfig } from '../model/types.js';

import { strings } from '../i18n/i18n.js';

import { Storage } from '../tools/storage.js';
import { assert } from '../tools/validation.js';

export class Timer extends Timeout {

  static new(dependency: DummyAddonDependency, config?: TimerConfig): Timer | undefined {

    if (config === undefined || !assert(dependency.log, dependency.caller, config, 'delay', 'units')) {
      return;
    }

    if (!isValidTimeUnits(config.units)) {
      dependency.log.error(strings.timer.badUnits, dependency.caller, `'${config.units}'`, printableValues(TimeUnits));
      return;
    }

    return new Timer(dependency, config);
  }

  private expiresTimestamp?: number;

  private constructor(dependency: DummyAddonDependency, private readonly config: TimerConfig) {
    super(dependency);

    this.expiresTimestamp = Storage.get(this.timerStorageKey) as number;
  }

  private get timerStorageKey(): string {
    return `${this.dependency.identifier}:Timer`;
  }

  private storeExpiresTimestamp(value: number | undefined) {
    Storage.set(this.timerStorageKey, value);
  }

  public start(callback:  () => Promise<void>): number {

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
      this.storeExpiresTimestamp(Date.now() + delay);
    }

    this.timeout = setTimeout(async () => {
      this.reset();
      await callback();
    }, delay);

    return delay;
  }

  override reset() {
    this.expiresTimestamp = undefined;
    this.storeExpiresTimestamp(undefined);
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