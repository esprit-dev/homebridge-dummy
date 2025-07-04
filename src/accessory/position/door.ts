import { PositionAccessory } from './position.js';

import { AccessoryType, DoorConfig } from '../../model/types.js';

export class DoorAccessory extends PositionAccessory<DoorConfig> {

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.Door;
  }

}