import { TimeUnits } from '../model/types.js';

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;

export function toMilliseconds(value: number, units: TimeUnits): number {
  switch(units) {
  case TimeUnits.SECONDS:
    return value * SECOND;
  case TimeUnits.MINUTES:
    return value * MINUTE;
  case TimeUnits.HOURS:
    return value * HOUR;
  }
}