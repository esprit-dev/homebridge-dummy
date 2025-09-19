import { PositionAccessory } from './position.js';

import { AccessoryType } from '../../model/enums.js';
import { WindowConfig } from '../../model/types.js';

export class WindowAccessory extends PositionAccessory<WindowConfig> {

  override getAccessoryType(): AccessoryType {
    return AccessoryType.Window;
  }

}