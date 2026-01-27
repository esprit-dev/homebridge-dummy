import { CharacteristicValue } from 'homebridge';

import { DEFAULT_OPEN_CLOSE_DURATION, PositionAccessory } from './position.js';

import { DummyAccessoryDependency } from '../base.js';

import { AccessoryType, HKCharacteristicKey } from '../../model/enums.js';
import { GarageDoorConfig } from '../../model/types.js';
import { Range } from '../../model/webhook.js';

export class GarageDoorAccessory extends PositionAccessory<GarageDoorConfig> {

  private _currentPosition?: CharacteristicValue;

  private intervalTimeout?: NodeJS.Timeout;

  constructor(dependency: DummyAccessoryDependency<GarageDoorConfig>) {
    super(dependency);

    this.service.getCharacteristic(dependency.Characteristic.ObstructionDetected)
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

  override get webhookRange(): Range {
    return new Range(0, 1);
  }

  protected get currentPosition(): CharacteristicValue {
    return this._currentPosition ?? super.currentPosition;
  }

  override onTargetPositionChanged(_oldValue: number, newValue: number) {

    if (this.config.simulateOpenClose !== true) {
      return;
    }

    this.clearTimeout();

    this._currentPosition = newValue === this.positionClosed ? this.currentCharacteristic.CLOSING : this.currentCharacteristic.OPENING;

    this.intervalTimeout = setInterval( () => {
      this.clearTimeout();
      this.service.updateCharacteristic(this.currentCharacteristic, this.currentPosition);
    }, DEFAULT_OPEN_CLOSE_DURATION);
  }

  override teardown(): void {
    super.teardown();
    this.clearTimeout();
  }

  private clearTimeout() {
    this._currentPosition = undefined;

    clearInterval(this.intervalTimeout);
    this.intervalTimeout = undefined;
  }
}