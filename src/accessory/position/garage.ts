import { PlatformAccessory } from 'homebridge';

import { PositionAccessory } from './position.js';

import { AccessoryType, WebhookCommand } from '../../model/enums.js';
import { CharacteristicType, GarageDoorConfig, ServiceType } from '../../model/types.js';

import { Log } from '../../tools/log.js';

export class GarageDoorAccessory extends PositionAccessory<GarageDoorConfig> {

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    config: GarageDoorConfig,
    log: Log,
    isGrouped: boolean,
  ) {
    super(Service, Characteristic, accessory, config, log, isGrouped);

    this.accessoryService.getCharacteristic(Characteristic.ObstructionDetected)
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

  override get targetCharacteristic() {
    return this.Characteristic.TargetDoorState;
  }

  override get currentCharacteristic() {
    return this.Characteristic.CurrentDoorState;
  }

  override get webhookCommand() {
    return WebhookCommand.TargetDoorState;
  }
}