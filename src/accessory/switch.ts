import { PlatformAccessory, Service } from 'homebridge';

import { OnOffAccessory } from './onoff.js';

import { CharacteristicType, ServiceType, SwitchConfig } from '../model/types.js';

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

  protected getAccessoryService(): Service {
    return this.accessory.getService(this.Service.Switch) || this.accessory.addService(this.Service.Switch);
  }
}