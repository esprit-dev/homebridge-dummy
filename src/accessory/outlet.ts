import { PlatformAccessory } from 'homebridge';

import { OnOffAccessory } from './onoff.js';

import { CharacteristicType, ServiceType, OutletConfig, AccessoryType } from '../model/types.js';

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

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.Outlet;
  }
}