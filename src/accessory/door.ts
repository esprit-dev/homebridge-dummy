import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { DummyAccessory } from './base.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType, CharacteristicType, DoorConfig, ServiceType } from '../model/types.js';

import { Log } from '../tools/log.js';
import { storageGet, storageSet } from '../tools/storage.js';

const DOOR_OPEN = 100;
const DOOR_CLOSED = 0;

export class DoorAccessory extends DummyAccessory<DoorConfig> {

  private position: CharacteristicValue;

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    config: DoorConfig,
    log: Log,
    persistPath: string,
    isGrouped: boolean,
  ) {
    super(Service, Characteristic, accessory, config, log, persistPath, isGrouped);

    this.position = this.defaultPosition;

    this.accessoryService.getCharacteristic(Characteristic.PositionState)
      .onGet(this.getState.bind(this));

    this.accessoryService.getCharacteristic(Characteristic.TargetPosition)
      .onGet(this.getPosition.bind(this))
      .onSet(this.setPosition.bind(this));

    this.accessoryService.getCharacteristic(Characteristic.CurrentPosition)
      .onGet(this.getPosition.bind(this));

    this.initializePosition();
  }

  private async initializePosition() {

    if (this.isStateful) {
      this.position = await storageGet(this.persistPath, this.defaultStateStorageKey) ?? this.position;
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.TargetPosition, this.position);  
    this.accessoryService.updateCharacteristic(this.Characteristic.CurrentPosition, this.position);  
  }

  protected getAccessoryType(): AccessoryType {
    return AccessoryType.Door;
  }

  private get defaultPosition(): CharacteristicValue {
    return this.config.defaultPosition === undefined ? DOOR_CLOSED : this.config.defaultPosition;
  }

  protected async getState(): Promise<CharacteristicValue> {
    return this.Characteristic.PositionState.STOPPED;
  }

  protected async getPosition(): Promise<CharacteristicValue> {
    return this.position;
  }

  protected async setPosition(value: CharacteristicValue): Promise<void> {

    const targetPosition = value === DOOR_CLOSED ? DOOR_CLOSED : DOOR_OPEN;

    if (this.position !== targetPosition) {
      this.logPosition(targetPosition);

      if (this.config.commandOpen && targetPosition !== DOOR_CLOSED) {
        this.executeCommand(this.config.commandOpen);
      } else if (this.config.commandClose && targetPosition === DOOR_CLOSED) {
        this.executeCommand(this.config.commandClose);
      }
    }
    
    this.position = targetPosition;

    if (this.isStateful) {
      await storageSet(this.persistPath, this.defaultStateStorageKey, this.position);
    } else {
      if (this.position !== this.defaultPosition) {
        this.startTimer(this.flip.bind(this));
      } else {
        this.cancelTimer();
      }
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.TargetPosition, this.position);
    this.accessoryService.updateCharacteristic(this.Characteristic.CurrentPosition, this.position);
  }

  private async flip(): Promise<void> {
    const opposite = this.position === DOOR_CLOSED ? DOOR_OPEN : DOOR_CLOSED;
    await this.setPosition(opposite);
  }

  protected logPosition(value: CharacteristicValue) {
    const message = value === DOOR_CLOSED ? strings.accessory.door.closed : strings.accessory.door.open;
    this.logIfDesired(message, this.config.name);
  }
}
