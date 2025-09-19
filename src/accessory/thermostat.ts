import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { DummyAccessory } from './base.js';

import { strings } from '../i18n/i18n.js';

import { AccessoryType, DefaultThermostatState, TemperatureUnits }  from '../model/enums.js';
import { CharacteristicType, ServiceType, ThermostatConfig } from '../model/types.js';

import { Log } from '../tools/log.js';
import { STORAGE_KEY_SUFFIX_DEFAULT_TEMPERATURE, storageGet, storageSet } from '../tools/storage.js';
import { fromCelsius, toCelsius } from '../tools/temperature.js';

const DEFAULT_TEMPERATURE = 20;

export class ThermostatAccessory extends DummyAccessory<ThermostatConfig> {

  private readonly STATE_AUTO: CharacteristicValue;
  private readonly STATE_COOL: CharacteristicValue;
  private readonly STATE_HEAT: CharacteristicValue;
  private readonly STATE_OFF: CharacteristicValue;

  private state: CharacteristicValue;
  private temperature: CharacteristicValue;

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    config: ThermostatConfig,
    log: Log,
    persistPath: string,
    isGrouped: boolean,
  ) {
    super(Service, Characteristic, accessory, config, log, persistPath, isGrouped);

    this.STATE_AUTO = Characteristic.TargetHeatingCoolingState.AUTO;
    this.STATE_COOL = Characteristic.TargetHeatingCoolingState.COOL;
    this.STATE_HEAT = Characteristic.TargetHeatingCoolingState.HEAT;
    this.STATE_OFF = Characteristic.TargetHeatingCoolingState.OFF;

    this.state = this.defaultState;
    this.temperature = this.defaultTemperature;

    this.accessoryService.getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
      .onGet(this.getUnits.bind(this));

    this.accessoryService.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.getCurrentState.bind(this));

    this.accessoryService.getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
      .setProps({
        minStep: 1,
        validValues:[
          this.STATE_OFF,
          this.STATE_HEAT,
          this.STATE_COOL,
          this.STATE_AUTO,
        ],
      })
      .onGet(this.getState.bind(this))
      .onSet(this.setState.bind(this));

    this.accessoryService.getCharacteristic(this.Characteristic.CurrentTemperature)
      .onGet(this.getTemperature.bind(this));

    this.accessoryService.getCharacteristic(this.Characteristic.TargetTemperature)
      .onGet(this.getTemperature.bind(this))
      .onSet(this.setTemperature.bind(this));

    this.initializeThermostat();
  }

  private async initializeThermostat() {

    if (this.isStateful) {
      this.state = await storageGet(this.persistPath, this.defaultStateStorageKey) ?? this.state;
      this.temperature = await storageGet(this.persistPath, this.defaulTemperatureStorageKey) ?? this.temperature;
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.TargetHeatingCoolingState, this.state);

    this.accessoryService.updateCharacteristic(this.Characteristic.TargetTemperature, this.temperature);
    this.accessoryService.updateCharacteristic(this.Characteristic.CurrentTemperature, this.temperature);
  }

  private get defaulTemperatureStorageKey(): string {
    return `${this.identifier}:${STORAGE_KEY_SUFFIX_DEFAULT_TEMPERATURE}`;
  }

  override getAccessoryType(): AccessoryType {
    return AccessoryType.Thermostat;
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

  private async getUnits(): Promise<CharacteristicValue> {
    return this.config.temperatureUnits === TemperatureUnits.FAHRENHEIT ?
      this.Characteristic.TemperatureDisplayUnits.FAHRENHEIT : this.Characteristic.TemperatureDisplayUnits.CELSIUS;
  }

  protected async getCurrentState(): Promise<CharacteristicValue> {
    return this.Characteristic.CurrentHeatingCoolingState.OFF;
  }

  private async getState(): Promise<CharacteristicValue> {
    return this.state;
  }

  private async setState(value: CharacteristicValue) {

    if (this.state !== value) {
      this.logState(value);

      if (this.config.commandOff && value === this.STATE_OFF) {
        this.executeCommand(this.config.commandOff);
      } else if (this.config.commandOn && this.state === this.STATE_OFF && value !== this.STATE_OFF) {
        this.executeCommand(this.config.commandOn);
      }
    }

    this.state = value;

    if (this.isStateful) {
      await storageSet(this.persistPath, this.defaultStateStorageKey, this.state);
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.TargetHeatingCoolingState, this.state);
  }

  private async getTemperature(): Promise<CharacteristicValue> {
    return this.temperature;
  }

  private async setTemperature(value: CharacteristicValue) {

    if (this.temperature !== value) {
      this.logTemperature(value);

      if (this.config.commandTemperature) {
        this.executeCommand(this.config.commandTemperature);
      }
    }

    this.temperature = value;

    if (this.isStateful) {
      await storageSet(this.persistPath, this.defaulTemperatureStorageKey, this.temperature);
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.TargetTemperature, this.temperature);
    this.accessoryService.updateCharacteristic(this.Characteristic.CurrentTemperature, this.temperature);
  }

  override async schedule(): Promise<void> {
    throw new Error(strings.accessory.thermostat.unsupportedFunction.replace('%s', `${this.schedule.name}()`));
  }

  override async reset(): Promise<void> {
    throw new Error(strings.accessory.thermostat.unsupportedFunction.replace('%s', `${this.reset.name}()`));
  }

  protected logState(value: CharacteristicValue) {

    let message: string;
    switch(value) {
    case this.STATE_AUTO:
      message = strings.accessory.thermostat.auto;
      break;
    case this.STATE_COOL:
      message = strings.accessory.thermostat.cool;
      break;
    case this.STATE_HEAT:
      message = strings.accessory.thermostat.heat;
      break;
    default:
      message = strings.accessory.thermostat.off;
    }

    this.logIfDesired(message, this.config.name);
  }

  protected logTemperature(value: CharacteristicValue) {
    const message = this.config.temperatureUnits === TemperatureUnits.FAHRENHEIT ?
      strings.accessory.thermostat.temperatureF : strings.accessory.thermostat.temperatureC;

    const temperature = fromCelsius(value as number, this.config.temperatureUnits);
    this.logIfDesired(message, this.config.name, temperature);
  }
}