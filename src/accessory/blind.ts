import { PositionAccessory } from './position.js';

import { AccessoryType, BlindConfig } from '../model/types.js';

export class BlindAccessory extends PositionAccessory<BlindConfig> {

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.WindowCovering;
  }

}