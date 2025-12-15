import { CharacteristicValue } from 'homebridge';

import { DummyAccessory, DummyAccessoryDependency } from '../base.js';

import { strings } from '../../i18n/i18n.js';

import { AccessoryType, CharacteristicKey } from '../../model/enums.js';
import { HumiditySensorConfig } from '../../model/types.js';
import { Range, Webhook } from '../../model/webhook.js';

export class HumiditySensorAccessory extends DummyAccessory<HumiditySensorConfig> {

  private humidity: CharacteristicValue;

  constructor(dependency: DummyAccessoryDependency<HumiditySensorConfig>) {
    super(dependency);

    this.accessoryService.getCharacteristic(dependency.Characteristic.CurrentRelativeHumidity)
      .onGet(this.getHumidity.bind(this));

    this.humidity = (this.isStateful && this.getStoredProperty(CharacteristicKey.CurrentRelativeHumidity)) ?? 0;
  }

  override getAccessoryType(): AccessoryType {
    return AccessoryType.HumiditySensor;
  }

  override get webhooks(): Webhook[] {

    return [
      new Webhook(this.identifier, CharacteristicKey.CurrentRelativeHumidity,
        new Range(0, 100),
        () => this.humidity,
        (value, syncOnly) => {
          this.setHumidity(value, syncOnly);
          return strings.sensor.humidity.replace('%s', this.name).replace('%d', value.toString());
        },
        this.config.disableLogging),
    ];
  }

  private async getHumidity(): Promise<CharacteristicValue> {
    return this.humidity;
  }

  private async setHumidity(value: CharacteristicValue, syncOnly: boolean = false) {

    if (this.humidity !== value) {
      this.logIfDesired(strings.sensor.humidity, value.toString());

      this.setStoredProperty(CharacteristicKey.CurrentRelativeHumidity, value);

      if (!syncOnly) {
        if (this.config.commandHumidity) {
          this.executeCommand(this.config.commandHumidity);
        }
      }
    }

    this.humidity = value;

    this.accessoryService.updateCharacteristic(this.Characteristic.CurrentRelativeHumidity, this.humidity);
  }

  override async trigger(): Promise<void> {
    throw new Error(`${this.trigger.name} is unsupported for ${HumiditySensorAccessory.name}`);
  }

  override async reset(): Promise<void> {
    throw new Error(`${this.reset.name} is unsupported for ${HumiditySensorAccessory.name}`);
  }
}