import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { DummyAccessory } from '../base.js';

import { strings } from '../../i18n/i18n.js';

import { DefaultPosition, isValidPosition, printableValues, WebhookCommand } from '../../model/enums.js';
import { CharacteristicType, PositionConfig, ServiceType } from '../../model/types.js';
import { Webhook } from '../../model/webhook.js';

import { Log } from '../../tools/log.js';
import { storageGet_Deprecated, Storage } from '../../tools/storage.js';

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
    isGrouped: boolean,
  ) {
    super(Service, Characteristic, accessory, config, log, isGrouped);

    if (!isValidPosition(config.defaultPosition)) {
      this.log.warning(strings.position.badDefault, this.name, `'${config.defaultPosition}'`, printableValues(DefaultPosition));
    }

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

  override webhooks(): Webhook[] {
    return [
      new Webhook(this.identifier, WebhookCommand.TargetPosition,
        (value) => {
          this.setPosition(value);
          return this.logTemplateForCV(value).replace('%s', this.name);
        }),
    ];
  }

  private async initializePosition() {

    if (!this.isStateful) {
      this.accessoryService.updateCharacteristic(this.Characteristic.TargetPosition, this.position);
      this.accessoryService.updateCharacteristic(this.Characteristic.CurrentPosition, this.position);
      return;
    }

    const position = await storageGet_Deprecated(this.defaultStateStorageKey);
    if (position === undefined) {
      return;
    }

    await this.setPosition(position);
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
      await Storage.set(this.defaultStateStorageKey, this.position);
    }

    if (this.position !== this.defaultPosition) {
      this.startTimer();
    } else {
      this.cancelTimer();
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.TargetPosition, this.position);
    this.accessoryService.updateCharacteristic(this.Characteristic.CurrentPosition, this.position);

    if (this.sensor) {
      if (!this.sensor.timerControlled) {
        this.sensor.active = this.position !== this.defaultPosition;
      } else if (this.position !== this.defaultPosition) {
        this.sensor.active = false;
      }
    }
  }

  override async schedule(): Promise<void> {
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

  private logTemplateForCV(value: CharacteristicValue): string {
    return value === POSITION_CLOSED ? strings.position.closed : strings.position.open;
  }

  protected logPosition(value: CharacteristicValue) {
    this.logIfDesired(this.logTemplateForCV(value));
  }
}
