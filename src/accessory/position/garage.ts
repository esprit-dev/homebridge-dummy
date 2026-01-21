import { PositionAccessory } from './position.js';

import { DummyAccessoryDependency } from '../base.js';

import { AccessoryType, HKCharacteristicKey } from '../../model/enums.js';
import { GarageDoorConfig } from '../../model/types.js';

export class GarageDoorAccessory extends PositionAccessory<GarageDoorConfig> {

  constructor(dependency: DummyAccessoryDependency<GarageDoorConfig>) {
    super(dependency);

    this.accessoryService.getCharacteristic(dependency.Characteristic.ObstructionDetected)
      .onGet( async () => false );
  }

  override getAccessoryType(): AccessoryType {
    return AccessoryType.GarageDoorOpener;
  }

  override get hasPositionState() {
    return false;
  }

  override get positionClosed() {
    return this.Characteristic.TargetDoorState.CLOSED;
  }

  override get positionOpen() {
    return this.Characteristic.TargetDoorState.OPEN;
  }

  override get stateStorageKey() {
    return HKCharacteristicKey.TargetDoorState;
  }

  override get targetCharacteristic() {
    return this.Characteristic.TargetDoorState;
  }

  override get currentCharacteristic() {
    return this.Characteristic.CurrentDoorState;
  }

  override get webhookCommand() {
    return HKCharacteristicKey.TargetDoorState;
  }
}