import { TimerConfig } from './types.js';

import { strings } from '../i18n/i18n.js';

import { Log } from '../tools/log.js';
import { DelayLogStrings, getDelay } from '../tools/time.js';
import { assert } from '../tools/validation.js';

export class Fader {

  static new(timerConfig: TimerConfig, fadeIn: boolean, caller: string, log: Log, disableLogging: boolean): Fader | undefined {

    if (!assert(log, caller, timerConfig, 'delay', 'units')) {
      return;
    }

    return new Fader(timerConfig, fadeIn, caller, log, disableLogging);
  }

  private timeout?: NodeJS.Timeout;
  private value?: number;

  private constructor(
    private readonly timerConfig: TimerConfig,
    private readonly fadeIn: boolean,
    private readonly caller: string,
    private readonly log: Log,
    private readonly disableLogging: boolean,
  ) {
  }

  public get currentValue(): number | undefined {
    return this.value;
  }

  public start(maximum: number, callback: (value: number) => Promise<void>) {

    this.cancel();

    const logStrings = DelayLogStrings(
      strings.accessory.fade.startMilliseconds,
      strings.accessory.fade.startSeconds,
      strings.accessory.fade.startMinutes,
      strings.accessory.fade.startHours,
    );

    const delay = getDelay(this.timerConfig.delay, this.timerConfig.units, this.timerConfig.random, this.log, this.disableLogging, this.caller, logStrings);

    const change = this.fadeIn ? 1 : -1;
    const interval = delay / maximum;

    this.value = this.fadeIn ? 0 : maximum;

    this.timeout = setInterval(async () => {

      if (this.value === undefined) {
        return;
      }

      this.value = this.value + change;

      await callback(this.value);

    }, interval);
  }

  public cancel() {

    if (this.timeout) {
      this.logIfDesired(strings.accessory.fade.cancel, this.caller);
    }

    this.reset();
  }

  public reset() {
    clearTimeout(this.timeout);
    this.timeout = undefined;
    this.value = undefined;
  }

  private logIfDesired(message: string, ...parameters: (string | number)[]) {

    if (this.disableLogging) {
      return;
    }

    this.log.always(message, this.caller, ...parameters);
  }
}