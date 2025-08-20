import { PositionAccessory } from './position.js';

import { AccessoryType } from '../../model/enums.js';
import { BlindConfig } from '../../model/types.js';

export class BlindAccessory extends PositionAccessory<BlindConfig> {

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.WindowCovering;
  }

}