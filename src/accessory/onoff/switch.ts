import { OnOffAccessory } from './onoff.js';

import { AccessoryType } from '../../model/enums.js';
import { SwitchConfig } from '../../model/types.js';

export class SwitchAccessory extends OnOffAccessory<SwitchConfig> {

  override getAccessoryType(): AccessoryType {
    return AccessoryType.Switch;
  }
}