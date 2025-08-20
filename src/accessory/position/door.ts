import { PositionAccessory } from './position.js';

import { AccessoryType } from '../../model/enums.js';
import { DoorConfig } from '../../model/types.js';

export class DoorAccessory extends PositionAccessory<DoorConfig> {

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.Door;
  }

}