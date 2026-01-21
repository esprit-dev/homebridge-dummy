import { CharacteristicValue } from 'homebridge';

import { DummyAccessory, DummyAccessoryDependency } from '../base.js';

import { strings } from '../../i18n/i18n.js';

import { Position, isValidPosition, printableValues, HKCharacteristicKey } from '../../model/enums.js';
import { PositionConfig } from '../../model/types.js';
import { Range, Webhook } from '../../model/webhook.js';

import { storageGet_Deprecated } from '../../tools/storage.js';

export abstract class PositionAccessory<C extends PositionConfig = PositionConfig> extends DummyAccessory<PositionConfig> {

  private position: CharacteristicValue;

  constructor(dependency: DummyAccessoryDependency<C>) {
    super(dependency);

    if (!isValidPosition(dependency.config.defaultPosition)) {
      this.log.warning(strings.position.badDefault, this.name, `'${dependency.config.defaultPosition}'`, printableValues(Position));
    }

    this.position = this.defaultPosition;

    if (this.hasPositionState) {
      this.accessoryService.getCharacteristic(dependency.Characteristic.PositionState)
        .onGet(this.getState.bind(this));
    }

    this.accessoryService.getCharacteristic(this.targetCharacteristic)
      .onGet(this.getPosition.bind(this))
      .onSet(this.setPosition.bind(this));

    this.accessoryService.getCharacteristic(this.currentCharacteristic)
      .onGet(this.getPosition.bind(this));

    this.initializePosition();
  }

  protected get hasPositionState() {
    return true;
  }

  protected get positionClosed() {
    return 0;
  }

  protected get positionOpen() {
    return 100;
  }

  protected get stateStorageKey() {
    return HKCharacteristicKey.TargetPosition;
  }

  protected get targetCharacteristic() {
    return this.Characteristic.TargetPosition;
  }

  protected get currentCharacteristic() {
    return this.Characteristic.CurrentPosition;
  }

  protected get webhookCommand() {
    return HKCharacteristicKey.TargetPosition;
  }

  override get webhooks(): Webhook[] {
    return [
      new Webhook(this.identifier, this.webhookCommand,
        new Range(0, 100),
        () => this.position,
        (value, syncOnly) => {
          this.setPosition(value, syncOnly);
          return this.logTemplateForCV(value).replace('%s', this.name);
        },
        this.config.disableLogging),
    ];
  }

  private async initializePosition() {

    if (!this.isStateful) {
      this.accessoryService.updateCharacteristic(this.targetCharacteristic, this.position);
      this.accessoryService.updateCharacteristic(this.currentCharacteristic, this.position);
      await this.registerStateChange();
      return;
    }

    const position = this.getProperty(this.stateStorageKey) ?? await storageGet_Deprecated(`${this.identifier}:DefaultState`);
    if (position === undefined) {
      await this.registerStateChange();
      return;
    }

    await this.setPosition(position);
  }

  private get defaultPosition(): CharacteristicValue {
    return this.config.defaultPosition === Position.OPEN ? this.positionOpen : this.positionClosed;
  }

  private async getState(): Promise<CharacteristicValue> {
    return this.Characteristic.PositionState.STOPPED;
  }

  private async registerStateChange() {
    await this.onStateChange(this.position === this.positionClosed ? Position.CLOSED : Position.OPEN);
  }

  private async getPosition(): Promise<CharacteristicValue> {
    return this.position;
  }

  private async setPosition(value: CharacteristicValue, syncOnly: boolean = false): Promise<void> {

    const targetPosition = value === this.positionClosed ? this.positionClosed : this.positionOpen;

    if (this.position !== targetPosition) {
      this.logPosition(targetPosition);

      this.setProperty(this.stateStorageKey, targetPosition);

      if (!syncOnly) {
        if (this.config.commandOpen && targetPosition !== this.positionClosed) {
          this.executeCommand(this.config.commandOpen);
        } else if (this.config.commandClose && targetPosition === this.positionClosed) {
          this.executeCommand(this.config.commandClose);
        }
      }
    }

    this.position = targetPosition;

    if (this.position !== this.defaultPosition) {
      this.onTriggered();
    } else {
      this.onReset();
    }

    this.accessoryService.updateCharacteristic(this.targetCharacteristic, this.position);
    this.accessoryService.updateCharacteristic(this.currentCharacteristic, this.position);

    if (this.sensor) {
      if (!this.sensor.timerControlled) {
        this.sensor.active = this.position !== this.defaultPosition;
      } else if (this.position !== this.defaultPosition) {
        this.sensor.active = false;
      }
    }

    await this.registerStateChange();
  }

  override async trigger(): Promise<void> {
    const opposite = this.defaultPosition === this.positionClosed ? this.positionOpen : this.positionClosed;
    await this.setPosition(opposite);
  }

  override async reset(): Promise<void> {
    if (this.position !== this.defaultPosition) {
      await this.setPosition(this.defaultPosition);
      if (this.sensor?.timerControlled) {
        this.sensor.active = true;
      }
    }
  }

  private logTemplateForCV(value: CharacteristicValue): string {
    return value === this.positionClosed ? strings.position.closed : strings.position.open;
  }

  protected logPosition(value: CharacteristicValue) {
    this.logIfDesired(this.logTemplateForCV(value));
  }
}
