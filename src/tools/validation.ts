import { Log } from './log.js';

import { strings } from '../i18n/i18n.js';

import { Assertable } from '../model/types.js';
import { CharacteristicValue } from 'homebridge';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert(log: Log, caller: string, assertable: Assertable, ...keys: (keyof any)[]): boolean {
  let valid = true;
  for (const key of keys) {
    if ((assertable as Record<string, unknown>)[key as string] === undefined) {
      log.error(strings.accessory.missingRequired, caller, `'${key.toString()}'`);
      valid = false;
    }
  }
  return valid;
}

export function assertType(log: Log, caller: string, value: CharacteristicValue, type: string): boolean {

  if (typeof value !== type) {
    log.error(strings.accessory.badValueType, caller, type, typeof value);
    return false;
  }

  return true;
}
