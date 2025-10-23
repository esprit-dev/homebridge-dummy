import { DummyAddonDependency } from '../accessory/base.js';
import { TimeUnits } from '../model/enums.js';

import { Log } from '../tools/log.js';

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

type DelayLogStrings = {
  milliseconds: string,
  seconds: string,
  minutes: string,
  hours: string,
}

export function DelayLogStrings(milliseconds: string, seconds: string, minutes: string, hours: string): DelayLogStrings {
  return { milliseconds: milliseconds, seconds: seconds, minutes: minutes, hours: hours };
}

export function getDelay(
  rawTime: number,
  units: TimeUnits,
  random: boolean | undefined = undefined,
  logStrings: DelayLogStrings | undefined = undefined,
  log: Log | undefined = undefined,
  caller: string | undefined = undefined,
): number {

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

  if (logStrings === undefined || log === undefined) {
    return time;
  }

  let string: string | undefined;
  let divisor: number;

  switch(units) {
  case TimeUnits.MILLISECONDS:
    string = logStrings?.milliseconds;
    divisor = 1;
    break;
  case TimeUnits.SECONDS:
    string = logStrings?.seconds;
    divisor = SECOND;
    break;
  case TimeUnits.MINUTES:
    string = logStrings?.minutes;
    divisor = MINUTE;
    break;
  case TimeUnits.HOURS:
    string = logStrings?.hours;
    divisor = HOUR;
    break;
  }

  if (string) {
    log.always(string, caller, Math.round(time / divisor));
  }

  return time;
}

export abstract class Timeout {

  protected timeout?: NodeJS.Timeout;

  protected constructor(protected readonly dependency: DummyAddonDependency) { }

  public cancel() {
    this.reset();
  }

  public teardown() {
    this.reset();
  }

  protected get caller(): string {
    return this.dependency.caller;
  }

  protected get log(): Log {
    return this.dependency.log;
  }

  private get disableLogging(): boolean {
    return this.dependency.disableLogging;
  }

  protected reset() {
    clearTimeout(this.timeout);
    this.timeout = undefined;
  }

  protected getDelay(rawTime: number, units: TimeUnits, random: boolean | undefined = undefined, logStrings: DelayLogStrings | undefined = undefined): number {
    return getDelay(rawTime, units, random, logStrings, this.disableLogging ? undefined : this.log, this.caller);
  }

  protected logIfDesired(message: string, ...parameters: (string | number)[]) {

    if (this.disableLogging) {
      return;
    }

    this.log.always(message, this.caller, ...parameters);
  }
}