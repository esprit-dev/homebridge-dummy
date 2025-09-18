import { Log } from './log.js';

import { strings } from '../i18n/i18n.js';

import { Assertable } from '../model/types.js';
import { CharacteristicValue } from 'homebridge';

 
export function assert<A extends Assertable>(log: Log, caller: string, assertable: A, ...keys: (keyof A)[]): boolean {
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
