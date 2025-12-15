import { CharacteristicValue } from 'homebridge';

import { DummyAccessory, DummyAccessoryDependency } from './base.js';

import { strings } from '../i18n/i18n.js';

import {
  AccessoryType, CharacteristicKey, DefaultThermostatState, isValidTemperatureUnits, isValidThermostatState,
  printableValues, TemperatureUnits }  from '../model/enums.js';
import { ThermostatConfig } from '../model/types.js';
import { Range, Values, Webhook } from '../model/webhook.js';

import { storageGet_Deprecated } from '../tools/storage.js';
import { fromCelsius, toCelsius } from '../tools/temperature.js';

const DEFAULT_TEMPERATURE = 20;
const DEFAULT_MINIMUM = 10;
const DEFAULT_MAXIMUM = 38;

export class ThermostatAccessory extends DummyAccessory<ThermostatConfig> {

  private readonly STATE_AUTO: CharacteristicValue;
  private readonly STATE_COOL: CharacteristicValue;
  private readonly STATE_HEAT: CharacteristicValue;
  private readonly STATE_OFF: CharacteristicValue;

  private currentState: CharacteristicValue;
  private targetState: CharacteristicValue;
  private temperature: CharacteristicValue;

  private minTemp: number;
  private maxTemp: number;

  constructor(dependency: DummyAccessoryDependency<ThermostatConfig>) {
    super(dependency);

    this.STATE_AUTO = dependency.Characteristic.TargetHeatingCoolingState.AUTO;
    this.STATE_COOL = dependency.Characteristic.TargetHeatingCoolingState.COOL;
    this.STATE_HEAT = dependency.Characteristic.TargetHeatingCoolingState.HEAT;
    this.STATE_OFF = dependency.Characteristic.TargetHeatingCoolingState.OFF;

    if (!isValidTemperatureUnits(dependency.config.temperatureUnits)) {
      this.log.warning(strings.sensor.badTemperatureUnits, this.name, `'${dependency.config.temperatureUnits}'`, printableValues(TemperatureUnits));
    }

    if (!isValidThermostatState(dependency.config.defaultThermostatState)) {
      this.log.warning(strings.thermostat.badDefault, this.name, `'${dependency.config.defaultThermostatState}'`, printableValues(DefaultThermostatState));
    }

    this.targetState = this.defaultState;
    this.currentState = this.defaultState !== this.STATE_AUTO ? this.defaultState : this.STATE_OFF;
    this.temperature = this.defaultTemperature;

    this.accessoryService.getCharacteristic(dependency.Characteristic.TemperatureDisplayUnits)
      .onGet(this.getUnits.bind(this));

    this.accessoryService.getCharacteristic(dependency.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.getCurrentState.bind(this));

    this.accessoryService.getCharacteristic(dependency.Characteristic.TargetHeatingCoolingState)
      .setProps({
        minStep: 1,
        validValues:[
          this.STATE_OFF,
          this.STATE_HEAT,
          this.STATE_COOL,
          this.STATE_AUTO,
        ],
      })
      .onGet(this.getTargetState.bind(this))
      .onSet(this.setState.bind(this));

    this.minTemp = dependency.config.minimumTemperature !== undefined ? toCelsius(dependency.config.minimumTemperature, this.units) : DEFAULT_MINIMUM;
    this.maxTemp = dependency.config.maximumTemperature !== undefined ? toCelsius(dependency.config.maximumTemperature, this.units) : DEFAULT_MAXIMUM;

    this.accessoryService.getCharacteristic(dependency.Characteristic.CurrentTemperature)
      .onGet(this.getTemperature.bind(this))
      .setProps({ minValue: this.minTemp, maxValue: this.maxTemp });

    this.accessoryService.getCharacteristic(dependency.Characteristic.TargetTemperature)
      .onGet(this.getTemperature.bind(this))
      .onSet(this.setTemperature.bind(this))
      .setProps({ minValue: this.minTemp, maxValue: this.maxTemp });

    this.initializeThermostat();
  }

  private async initializeThermostat() {

    if (!this.isStateful) {
      this.accessoryService.updateCharacteristic(this.Characteristic.TargetHeatingCoolingState, this.targetState);
      this.accessoryService.updateCharacteristic(this.Characteristic.CurrentHeatingCoolingState, this.currentState);

      this.accessoryService.updateCharacteristic(this.Characteristic.TargetTemperature, this.temperature);
      this.accessoryService.updateCharacteristic(this.Characteristic.CurrentTemperature, this.temperature);

      return;
    }

    const state = this.getStoredProperty(CharacteristicKey.TargetHeatingCoolingState) ?? await storageGet_Deprecated(`${this.identifier}:DefaultState`);
    if (state !== undefined) {
      await this.setState(state);
    }

    const temperature = this.getStoredProperty(CharacteristicKey.TargetTemperature) ?? await storageGet_Deprecated(`${this.identifier}:Temperature`);
    if (temperature !== undefined) {
      await this.setTemperature(temperature);
    }
  }

  override getAccessoryType(): AccessoryType {
    return AccessoryType.Thermostat;
  }

  override get webhooks(): Webhook[] {

    return [

      new Webhook(this.identifier, CharacteristicKey.TargetHeatingCoolingState,
        new Values(
          [
            this.Characteristic.TargetHeatingCoolingState.OFF,
            this.Characteristic.TargetHeatingCoolingState.HEAT,
            this.Characteristic.TargetHeatingCoolingState.COOL,
            this.Characteristic.TargetHeatingCoolingState.AUTO,
          ],
          '0 (OFF), 1 (HEAT), 2 (COOL), 3 (AUTO)',
        ),
        () => this.targetState,
        (value, syncOnly) => {
          this.setState(value, syncOnly);
          return this.stateLogTemplateForCV(value).replace('%s', this.name);
        }),

      new Webhook(this.identifier, CharacteristicKey.TargetTemperature,
        new Range(fromCelsius(this.minTemp, this.units), fromCelsius(this.maxTemp, this.units)),
        () => this.temperature,
        (value, syncOnly) => {
          value = toCelsius(value as number, this.units);
          this.setTemperature(value, syncOnly);
          return this.temperatureLogTemplateForCV(value).replace('%s', this.name);
        }),
    ];
  }

  private get defaultState(): CharacteristicValue {
    switch (this.config.defaultThermostatState) {
    case DefaultThermostatState.AUTO:
      return this.STATE_AUTO;
    case DefaultThermostatState.COOL:
      return this.STATE_COOL;
    case DefaultThermostatState.HEAT:
      return this.STATE_HEAT;
    }

    return this.STATE_OFF;
  }

  private get defaultTemperature(): CharacteristicValue {
    return this.config.defaultTemperature ? toCelsius(this.config.defaultTemperature, this.config.temperatureUnits) : DEFAULT_TEMPERATURE;
  }

  private get units(): TemperatureUnits {
    return this.config.temperatureUnits ?? TemperatureUnits.CELSIUS;
  }

  private async getUnits(): Promise<CharacteristicValue> {
    return this.units === TemperatureUnits.FAHRENHEIT
      ? this.Characteristic.TemperatureDisplayUnits.FAHRENHEIT : this.Characteristic.TemperatureDisplayUnits.CELSIUS;
  }

  protected async getCurrentState(): Promise<CharacteristicValue> {
    return this.currentState;
  }

  private async getTargetState(): Promise<CharacteristicValue> {
    return this.targetState;
  }

  private async setState(value: CharacteristicValue, syncOnly: boolean = false) {

    if (this.targetState !== value) {
      this.logState(value);

      this.setStoredProperty(CharacteristicKey.TargetHeatingCoolingState, value);

      if (!syncOnly) {
        if (this.config.commandOff && value === this.STATE_OFF) {
          this.executeCommand(this.config.commandOff);
        } else if (this.config.commandOn && this.targetState === this.STATE_OFF && value !== this.STATE_OFF) {
          this.executeCommand(this.config.commandOn);
        }
      }
    }

    this.targetState = value;

    this.accessoryService.updateCharacteristic(this.Characteristic.TargetHeatingCoolingState, this.targetState);

    this.currentState = this.targetState !== this.STATE_AUTO ? this.targetState : this.currentState;
    this.accessoryService.updateCharacteristic(this.Characteristic.CurrentHeatingCoolingState, this.currentState);
  }

  private async getTemperature(): Promise<CharacteristicValue> {
    return this.temperature;
  }

  private async setTemperature(value: CharacteristicValue, syncOnly: boolean = false) {

    if (this.temperature !== value) {
      this.logTemperature(value);

      this.setStoredProperty(CharacteristicKey.TargetTemperature, value);

      if (!syncOnly) {
        if (this.config.commandTemperature) {
          this.executeCommand(this.config.commandTemperature);
        }
      }
    }

    this.temperature = value;

    this.accessoryService.updateCharacteristic(this.Characteristic.TargetTemperature, this.temperature);
    this.accessoryService.updateCharacteristic(this.Characteristic.CurrentTemperature, this.temperature);
  }

  override async trigger(): Promise<void> {
    throw new Error(`${this.trigger.name} is unsupported for ${ThermostatAccessory.name}`);
  }

  override async reset(): Promise<void> {
    throw new Error(`${this.reset.name} is unsupported for ${ThermostatAccessory.name}`);
  }

  private stateLogTemplateForCV(value: CharacteristicValue): string {
    switch(value) {
    case this.STATE_AUTO:
      return strings.thermostat.auto;
    case this.STATE_COOL:
      return strings.thermostat.cool;
    case this.STATE_HEAT:
      return strings.thermostat.heat;
    default:
      return strings.thermostat.off;
    }
  }

  protected logState(value: CharacteristicValue) {
    this.logIfDesired(this.stateLogTemplateForCV(value));
  }

  private temperatureLogTemplateForCV(value: CharacteristicValue): string {
    const message = this.units === TemperatureUnits.FAHRENHEIT ? strings.sensor.temperatureF : strings.sensor.temperatureC;
    const temperature = fromCelsius(value as number, this.config.temperatureUnits);
    return message.replace('%d', temperature.toString());
  }

  protected logTemperature(value: CharacteristicValue) {
    this.logIfDesired(this.temperatureLogTemplateForCV(value));
  }
}