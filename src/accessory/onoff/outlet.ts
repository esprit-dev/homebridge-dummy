import { OnOffAccessory } from './onoff.js';

import { AccessoryType } from '../../model/enums.js';
import { OutletConfig } from '../../model/types.js';

export class OutletAccessory extends OnOffAccessory<OutletConfig> {

  override getAccessoryType(): AccessoryType {
    return AccessoryType.Outlet;
  }
}