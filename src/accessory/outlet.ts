import { PlatformAccessory, Service } from 'homebridge';

import { OnOffAccessory } from './onoff.js';

import { CharacteristicType, ServiceType, OutletConfig } from '../model/types.js';

import { Log } from '../tools/log.js';

export class OutletAccessory extends OnOffAccessory {

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    outletConfig: OutletConfig,
    log: Log,
    persistPath: string,
  ) {
    super(Service, Characteristic, accessory, outletConfig, log, persistPath, OutletAccessory.name);
  }

  protected getAccessoryService(): Service {
    return this.accessory.getService(this.Service.Outlet) || this.accessory.addService(this.Service.Outlet);
  }
}