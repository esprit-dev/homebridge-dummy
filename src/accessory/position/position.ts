import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { DummyAccessory } from '../base.js';

import { strings } from '../../i18n/i18n.js';

import { CharacteristicType, DefaultPosition, PositionConfig, ServiceType } from '../../model/types.js';

import { Log } from '../../tools/log.js';
import { storageGet, storageSet } from '../../tools/storage.js';

const POSITION_OPEN = 100;
const POSITION_CLOSED = 0;

export abstract class PositionAccessory<C extends PositionConfig = PositionConfig> extends DummyAccessory<PositionConfig> {

  private position: CharacteristicValue;

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    config: C,
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

  private get defaultPosition(): CharacteristicValue {
    return this.config.defaultPosition === DefaultPosition.OPEN ? POSITION_OPEN : POSITION_CLOSED;
  }

  protected async getState(): Promise<CharacteristicValue> {
    return this.Characteristic.PositionState.STOPPED;
  }

  protected async getPosition(): Promise<CharacteristicValue> {
    return this.position;
  }

  protected async setPosition(value: CharacteristicValue): Promise<void> {

    const targetPosition = value === POSITION_CLOSED ? POSITION_CLOSED : POSITION_OPEN;

    if (this.position !== targetPosition) {
      this.logPosition(targetPosition);

      if (this.config.commandOpen && targetPosition !== POSITION_CLOSED) {
        this.executeCommand(this.config.commandOpen);
      } else if (this.config.commandClose && targetPosition === POSITION_CLOSED) {
        this.executeCommand(this.config.commandClose);
      }
    }

    this.position = targetPosition;

    if (this.isStateful) {
      await storageSet(this.persistPath, this.defaultStateStorageKey, this.position);
    } else {
      if (this.position !== this.defaultPosition) {
        this.startTimer();
      } else {
        this.cancelTimer();
      }
    }

    if (this.sensor) {
      if (!this.sensor.timerControlled) {
        this.sensor.active = this.position !== this.defaultPosition;
      } else if (this.position !== this.defaultPosition) {
        this.sensor.active = false;
      }
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.TargetPosition, this.position);
    this.accessoryService.updateCharacteristic(this.Characteristic.CurrentPosition, this.position);
  }

  override async trigger(): Promise<void> {
    if (this.position === this.defaultPosition) {
      const opposite = this.position === POSITION_CLOSED ? POSITION_OPEN : POSITION_CLOSED;
      await this.setPosition(opposite);
    }
  }

  override async reset(): Promise<void> {
    if (this.position !== this.defaultPosition) {
      await this.setPosition(this.defaultPosition);
      if (this.sensor?.timerControlled) {
        this.sensor.active = true;
      }
    }
  }

  protected logPosition(value: CharacteristicValue) {
    const message = value === POSITION_CLOSED ? strings.accessory.position.closed : strings.accessory.position.open;
    this.logIfDesired(message, this.config.name);
  }
}
