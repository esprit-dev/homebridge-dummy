import { strings } from '../i18n/i18n.js';
import { Log } from '../tools/log.js';
import { TimerConfig, TimeUnits } from './types.js';

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;

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

    let delay: number;
    switch(config.units) {
    case TimeUnits.SECONDS:
      delay = config.delay * SECONDS;
      break;
    case TimeUnits.MINUTES:
      delay = config.delay * MINUTES;
      break;
    case TimeUnits.HOURS:
      delay = config.delay * HOURS; 
      break;
    }

    if (config.random) {
      delay = Math.floor(Math.max(SECONDS, Math.random() * delay));
    }

    if (delay < MINUTES) {
      this.log?.always(strings.accessory.timer.setSeconds, this.caller, Math.round(delay / SECONDS));
    } else if (delay < HOURS) {
      this.log?.always(strings.accessory.timer.setMinutes, this.caller, Math.round(delay / MINUTES));
    } else {
      this.log?.always(strings.accessory.timer.setSeconds, this.caller, Math.round(delay / HOURS));
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