import { PositionAccessory } from './position.js';

import { AccessoryType, WindowConfig } from '../model/types.js';

export class WindowAccessory extends PositionAccessory<WindowConfig> {

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.Window;
  }

}