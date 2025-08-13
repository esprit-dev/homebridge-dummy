import { DelayLogStrings, Timeout } from './timeout.js';

import { strings } from '../i18n/i18n.js';

import { TimerConfig } from '../model/types.js';

import { Log } from '../tools/log.js';
import { assert } from '../tools/validation.js';

export class Fader extends Timeout {

  static new(timerConfig: TimerConfig, fadeIn: boolean, caller: string, log: Log, disableLogging: boolean): Fader | undefined {

    if (!assert(log, caller, timerConfig, 'delay', 'units')) {
      return;
    }

    return new Fader(timerConfig, fadeIn, caller, log, disableLogging);
  }

  private value?: number;

  private constructor(
    private readonly timerConfig: TimerConfig,
    private readonly fadeIn: boolean,
    caller: string,
    log: Log,
    disableLogging: boolean,
  ) {
    super(caller, log, disableLogging);
  }

  protected get cancelString(): string {
    return strings.accessory.fade.cancel;
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

    const delay = this.getDelay(this.timerConfig.delay, this.timerConfig.units, this.timerConfig.random, logStrings);

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

  override reset() {
    super.reset();
    this.value = undefined;
  }
}