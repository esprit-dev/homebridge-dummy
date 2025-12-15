import { CharacteristicValue } from 'homebridge';

import { DummyAccessory, DummyAccessoryDependency } from './base.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType, CharacteristicKey, isValidOnState, isValidValveType, OnState, printableValues, ValveType }  from '../model/enums.js';
import { ValveConfig } from '../model/types.js';
import { Values, Webhook } from '../model/webhook.js';

export class ValveAccessory extends DummyAccessory<ValveConfig> {

  override getAccessoryType(): AccessoryType {
    return AccessoryType.Valve;
  }

  private state: CharacteristicValue;

  constructor(dependency: DummyAccessoryDependency<ValveConfig>) {
    super(dependency);

    if (!isValidValveType(dependency.config.valveType)) {
      this.log.warning(strings.valve.badType, this.name, `'${dependency.config.valveType}'`, printableValues(ValveType));
    }

    if (!isValidOnState(this.config.defaultState)) {
      this.log.warning(strings.onOff.badDefault, this.name, `'${dependency.config.defaultState}'`, printableValues(OnState));
    }

    this.state = this.defaultState;

    this.accessoryService.getCharacteristic(dependency.Characteristic.ValveType)
      .onGet(this.getType.bind(this));

    this.accessoryService.getCharacteristic(dependency.Characteristic.Active)
      .onGet(this.getState.bind(this))
      .onSet(this.setState.bind(this));

    this.accessoryService.getCharacteristic(dependency.Characteristic.InUse)
      .onGet(this.getState.bind(this));

    this.initializeValve();
  }

  override get webhooks(): Webhook[] {
    return [
      new Webhook(this.identifier, CharacteristicKey.On,
        new Values( [true, false], 'true, false'),
        () => this.state,
        (value, syncOnly) => {
          this.setState(value ? 1 : 0, syncOnly);
          return this.logMessageForState(value).replace('%s', this.name);
        },
        this.config.disableLogging),
    ];
  }

  private async initializeValve() {

    await new Promise(resolve => setImmediate(resolve));

    if (!this.isStateful) {
      this.accessoryService.updateCharacteristic(this.Characteristic.Active, this.state);
      this.accessoryService.updateCharacteristic(this.Characteristic.InUse, this.state);
      await this.registerStateChange();
      return;
    }

    const state = this.getStoredProperty(CharacteristicKey.On);
    if (state === undefined) {
      await this.registerStateChange();
      return;
    }

    await this.setState(state);
  }

  private get defaultState(): CharacteristicValue {
    return this.config.defaultState === OnState.ON ? 1 : 0;
  }

  private async registerStateChange() {
    await this.onStateChange(this.state === 1 ? OnState.ON : OnState.OFF);
  }

  protected async getType(): Promise<CharacteristicValue> {
    switch (this.config.valveType) {
    case ValveType.FAUCET:
      return this.Characteristic.ValveType.WATER_FAUCET;
    case ValveType.IRRIGATION:
      return this.Characteristic.ValveType.IRRIGATION;
    case ValveType.SHOWER:
      return this.Characteristic.ValveType.SHOWER_HEAD;
    case ValveType.GENERIC:
    default:
      return this.Characteristic.ValveType.GENERIC_VALVE;
    }
  }

  protected async getState(): Promise<CharacteristicValue> {
    return this.state;
  }

  private async setState(value: CharacteristicValue, syncOnly: boolean = false) {

    if (this.state !== value) {
      this.logIfDesired(this.logMessageForState(value));

      this.setStoredProperty(CharacteristicKey.On, value);

      if (!syncOnly) {
        if (this.config.commandOn && value === 1) {
          this.executeCommand(this.config.commandOn);
        } else if (this.config.commandOff && value === 0) {
          this.executeCommand(this.config.commandOff);
        }
      }
    }

    this.state = value;

    if (this.state !== this.defaultState) {
      this.onTriggered();
    } else {
      this.onReset();
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.Active, this.state);
    this.accessoryService.updateCharacteristic(this.Characteristic.InUse, this.state);

    await this.registerStateChange();
  }

  override async trigger(): Promise<void> {
    const opposite = this.defaultState === 0 ? 1 : 0;
    await this.setState(opposite);
  }

  override async reset(): Promise<void> {
    if (this.state !== this.defaultState) {
      await this.setState(this.defaultState);
    }
  }

  protected logMessageForState(value: CharacteristicValue): string {
    return value ? strings.onOff.stateOn : strings.onOff.stateOff;
  }
}