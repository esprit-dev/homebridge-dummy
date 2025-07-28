import { strings } from '../i18n/i18n.js';
import { Log } from '../tools/log.js';
import { TimerConfig, TimeUnits } from './types.js';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export class Timer {
  
  private timer: NodeJS.Timeout | undefined = undefined;

  constructor(
    private readonly caller: string,
    private readonly log?: Log,
  ) { }

  public start(config: TimerConfig, callback:  () => Promise<void>) {

    if (this.timer) {
      this.log?.always(strings.accessory.timer.reset, this.caller);
      this.reset();
    }

    let delay: number = config.delay;
    switch(config.units) {
    case TimeUnits.SECONDS:
      delay *= SECOND;
      break;
    case TimeUnits.MINUTES:
      delay *= MINUTE;
      break;
    case TimeUnits.HOURS:
      delay *= HOUR; 
      break;
    }

    if (config.random) {
      delay = Math.floor(Math.max(SECOND, Math.random() * delay));
    }

    if (delay < MINUTE) {
      this.log?.always(strings.accessory.timer.setSeconds, this.caller, Math.round(delay / SECOND));
    } else if (delay < HOUR) {
      this.log?.always(strings.accessory.timer.setMinutes, this.caller, Math.round(delay / MINUTE));
    } else {
      this.log?.always(strings.accessory.timer.setHours, this.caller, Math.round(delay / HOUR));
    }

    this.timer = setTimeout(async () => {
      this.reset();
      await callback();
    }, delay);
  }
  
  public cancel() {
    if (this.timer) {
      this.log?.always(strings.accessory.timer.cancel, this.caller);
      this.reset();
    }
  }

  public teardown() {
    this.reset();
  }

  private reset() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }
}