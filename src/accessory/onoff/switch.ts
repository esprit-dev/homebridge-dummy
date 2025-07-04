import { OnOffAccessory } from './onoff.js';

import { AccessoryType, SwitchConfig } from '../../model/types.js';

export class SwitchAccessory extends OnOffAccessory<SwitchConfig> {

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.Switch;
  }
}