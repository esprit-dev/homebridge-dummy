import { TimeUnits } from '../model/enums.js';

import { Log } from '../tools/log.js';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

type DelayLogStrings = {
  milliseconds: string,
  seconds: string,
  minutes: string,
  hours: string,
}

export function DelayLogStrings(milliseconds: string, seconds: string, minutes: string, hours: string): DelayLogStrings {
  return { milliseconds: milliseconds, seconds: seconds, minutes: minutes, hours: hours };
}

export abstract class Timeout {

  protected timeout?: NodeJS.Timeout;

  protected constructor(
    protected readonly caller: string,
    protected readonly log: Log,
    private readonly disableLogging: boolean,
  ) { }

  public cancel() {
    this.reset();
  }

  public teardown() {
    this.reset();
  }

  protected reset() {
    clearTimeout(this.timeout);
    this.timeout = undefined;
  }

  protected getDelay(rawTime: number, units: TimeUnits, random: boolean | undefined = undefined, strings: DelayLogStrings | undefined = undefined): number {

    let time: number;

    switch(units) {
    case TimeUnits.MILLISECONDS:
      time = rawTime;
      break;
    case TimeUnits.SECONDS:
      time = rawTime * SECOND;
      break;
    case TimeUnits.MINUTES:
      time = rawTime * MINUTE;
      break;
    case TimeUnits.HOURS:
      time = rawTime * HOUR;
      break;
    }

    if (random) {
      time = Math.floor(Math.max(1, Math.random() * time));

      if (time < SECOND) {
        units = TimeUnits.MILLISECONDS;
      } else if (time < MINUTE) {
        units = TimeUnits.SECONDS;
      } else if (time < HOUR) {
        units = TimeUnits.MINUTES;
      }
    }

    if (!this.disableLogging) {

      let string: string | undefined;
      let divisor: number;

      switch(units) {
      case TimeUnits.MILLISECONDS:
        string = strings?.milliseconds;
        divisor = 1;
        break;
      case TimeUnits.SECONDS:
        string = strings?.seconds;
        divisor = SECOND;
        break;
      case TimeUnits.MINUTES:
        string = strings?.minutes;
        divisor = MINUTE;
        break;
      case TimeUnits.HOURS:
        string = strings?.hours;
        divisor = HOUR;
        break;
      }

      if (string) {
        this.log.always(string, this.caller, Math.round(time / divisor));
      }
    }

    return time;
  }

  protected logIfDesired(message: string, ...parameters: (string | number)[]) {

    if (this.disableLogging) {
      return;
    }

    this.log.always(message, this.caller, ...parameters);
  }
}