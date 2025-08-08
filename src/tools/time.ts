import { TimeUnits } from '../model/types.js';

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

function toMilliseconds(value: number, units: TimeUnits): number {
  switch(units) {
  case TimeUnits.MILLISECONDS:
    return value;
  case TimeUnits.SECONDS:
    return value * SECOND;
  case TimeUnits.MINUTES:
    return value * MINUTE;
  case TimeUnits.HOURS:
    return value * HOUR;
  }
}

export function getDelay(rawTime: number, units: TimeUnits, random: boolean | undefined,
  log: Log, disableLogging: boolean, caller: string, strings: DelayLogStrings): number {

  let time = toMilliseconds(rawTime, units);

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

  if (!disableLogging) {

    let string: string;
    let divisor: number;

    switch(units) {
    case TimeUnits.MILLISECONDS:
      string = strings.milliseconds;
      divisor = 1;
      break;
    case TimeUnits.SECONDS:
      string = strings.seconds;
      divisor = SECOND;
      break;
    case TimeUnits.MINUTES:
      string = strings.minutes;
      divisor = MINUTE;
      break;
    case TimeUnits.HOURS:
      string = strings.hours;
      divisor = HOUR;
      break;
    }

    log.always(string, caller, Math.round(time / divisor));
  }

  return time;
}