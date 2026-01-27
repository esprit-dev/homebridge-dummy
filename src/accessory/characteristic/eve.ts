import { API, CharacteristicValue, Nullable, Service } from 'homebridge';
import { EveHomeKitTypes } from 'homebridge-lib/EveHomeKitTypes';

import { EveCharacteristicKey, CharacteristicKey } from '../../model/enums.js';

export const EVE_EPOCH = 978307200; // Seconds since Jan 1, 2001

let _EveHomeKitTypes: EveHomeKitTypes | undefined;

export interface EveCharacteristicHost {
  service: Service;
  getProperty(key: EveCharacteristicKey): CharacteristicValue | undefined;
  setProperty(key: EveCharacteristicKey, value: CharacteristicValue): void;
  logIfDesired(message: string, ...parameters: (string | number)[]): void;
}

export function initEveCharacteristics(api: API) {

  if (_EveHomeKitTypes) {
    throw new Error('EveHomeKitTypes already initialized');
  }

  _EveHomeKitTypes = new EveHomeKitTypes(api);
}

export function EveCharacteristic(key: EveCharacteristicKey) {

  if (!_EveHomeKitTypes) {
    throw new Error('EveHomeKitTypes not initialized');
  }

  return _EveHomeKitTypes.Characteristics[key];
}

let EveCharacteristicKeys: Set<EveCharacteristicKey> | undefined;
export function isEveCharacteristic(key: CharacteristicKey): key is EveCharacteristicKey {

  if (EveCharacteristicKeys === undefined) {
    EveCharacteristicKeys = new Set(Object.values(EveCharacteristicKey));
  }

  return EveCharacteristicKeys.has(key as EveCharacteristicKey);
}

export function setupEveCharacteristic(host: EveCharacteristicHost, key: EveCharacteristicKey, defaultValue: CharacteristicValue, logString?: string,
  onSetCallback?: (value: CharacteristicValue) => (void)) {

  const startingValue = host.getProperty(key) ?? defaultValue;

  host.service.addOptionalCharacteristic(EveCharacteristic(key));

  const characteristic = host.service.getCharacteristic(EveCharacteristic(key));
  characteristic.setValue(startingValue);

  host.setProperty(key, startingValue);

  characteristic.onGet( async (): Promise<Nullable<CharacteristicValue>> => {
    return host.getProperty(key) ?? null;
  });

  if (onSetCallback === undefined) {
    return;
  }

  characteristic.onSet( async (value: CharacteristicValue) => {
    onSetCallback(value);

    if (value === host.getProperty(key)) {
      return;
    }

    host.setProperty(key, value);

    host.service.updateCharacteristic(EveCharacteristic(key), value);

    if (logString) {
      host.logIfDesired(logString);
    }
  });

  return characteristic;
}