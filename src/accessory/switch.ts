import { PlatformAccessory } from 'homebridge';

import { OnOffAccessory } from './onoff.js';

import { AccessoryType, CharacteristicType, ServiceType, SwitchConfig } from '../model/types.js';

import { Log } from '../tools/log.js';

export class SwitchAccessory extends OnOffAccessory {

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    switchConfig: SwitchConfig,
    log: Log,
    persistPath: string,
  ) {
    super(Service, Characteristic, accessory, switchConfig, log, persistPath, SwitchAccessory.name);
  }

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.Switch;
  }
}