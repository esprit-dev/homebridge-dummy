import { OnOffAccessory } from './onoff.js';

import { OutletConfig, AccessoryType } from '../../model/types.js';

export class OutletAccessory extends OnOffAccessory<OutletConfig> {

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.Outlet;
  }
}