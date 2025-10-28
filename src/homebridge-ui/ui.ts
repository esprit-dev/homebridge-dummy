import { IHomebridgePluginUi } from '@homebridge/plugin-ui-utils/ui.interface';

import { Translation } from '../i18n/i18n.js';

import { PLUGIN_ALIAS } from '../homebridge/settings.js';

import { DummyConfig, DummyPlatformConfig, OnOffConfig } from '../model/types.js';
import { AccessoryType, OnState, ScheduleType } from '../model/enums.js';

declare const homebridge: IHomebridgePluginUi;

const i18n_replacements = {
  github: '<a target="_blank" href="https://github.com/mpatfield/homebridge-dummy/">GitHub</a>',
  migration: '<a target="_blank" href="https://github.com/mpatfield/homebridge-dummy?tab=readme-ov-file#v10-migration">GitHub</a>',
  dummy: PLUGIN_ALIAS,
};

function translateHtml(strings: Translation) {
  document.querySelectorAll('[i18n]').forEach(element => {

    const key = element.getAttribute('i18n') as keyof typeof strings.config;
    let string = strings.config[key] as string;

    const token = element.getAttribute('i18n_replace') as keyof typeof i18n_replacements;
    if (token) {
      string = string.replace('%s', i18n_replacements[token]);
    }
    element.innerHTML = string;
  });
}

function translateSchema(strings: Translation) {
  const tags = ['span', 'label', 'legend', 'option', 'p'];
  const elements = Array.from(
    window.parent.document.querySelectorAll(tags.join(',')),
  ).sort((a, b) => {
    return tags.indexOf(a.tagName.toLowerCase()) - tags.indexOf(b.tagName.toLowerCase());
  });

  elements.forEach(element => {
    let newHtml = element.innerHTML;
    newHtml = newHtml.replaceAll(
      /\$\{config\.(title|description|enumNames)\.([^}]+)\}/g,
      (match, type: keyof typeof strings.config, key) => {
        if (
          strings.config[type] &&
          typeof strings.config[type] === 'object' &&
          key in (strings.config[type] as Record<string, string>)
        ) {
          return (strings.config[type] as Record<string, string>)[key];
        }
        return match;
      },
    );
    if (element.innerHTML !== newHtml) {
      element.innerHTML = newHtml;
    }
  });
}

function updateAccessoryNames(strings: Translation) {

  const legends = Array.from(window.parent.document.querySelectorAll('fieldset legend'));

  for(const legend of legends) {
    const fieldset = legend.closest('fieldset');
    const input = fieldset?.querySelector('input[type="text"][name="name"]') as HTMLInputElement | null;
    if (input && legend.textContent !== (input.value || strings.config.title.accessory)) {
      legend.textContent = input.value !== '' ? input.value : strings.config.title.accessory;
    }

    if (input && !input.dataset.accessoryNameListener) {
      input.addEventListener('input', () => updateAccessoryNames(strings));
      input.dataset.accessoryNameListener = 'true';
    }
  }
}

function generateUUID() {

  if (typeof crypto !== 'undefined') {

    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }

    if (crypto.getRandomValues) {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] & 0xf;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function updateConfigsWithUUIDs(configs: DummyPlatformConfig[]) {

  let changed = false;

  configs.forEach( (config) => {
    config.accessories?.forEach( (accessoryConfig) => {

      if (accessoryConfig.id === undefined) {
        accessoryConfig.id = generateUUID();
        changed = true;
      }

      if (accessoryConfig.limiter !== undefined && accessoryConfig.limiter.id === undefined) {
        accessoryConfig.limiter.id = generateUUID();
        changed = true;
      }
    });
  });

  if (changed) {
    await homebridge.updatePluginConfig(configs);
  }
}

function findNextByName(element: Element, name: string): Element | null {
  const walker = window.parent.document.createTreeWalker(window.parent.document.body, NodeFilter.SHOW_ELEMENT);

  let found = false;
  while (walker.nextNode()) {
    if (walker.currentNode === element) {
      found = true;
      break;
    }
  }

  while (found && walker.nextNode()) {
    const node = walker.currentNode as Element;
    if (node.getAttribute('name') === name) {
      return node;
    }
  }

  return null;
}

let accessories: DummyConfig[] = [];
async function updateConditionDropdowns(strings: Translation, configs?: DummyPlatformConfig[]) {

  const accessoryIdInputs = window.parent.document.querySelectorAll('[name="accessoryId"]');
  if (accessoryIdInputs.length === 0) {
    return;
  }

  if (configs === undefined) {
    configs = await homebridge.getPluginConfig() as DummyPlatformConfig[];
  }

  const newAccessories: DummyConfig[] = [];

  for (const config of configs) {
    const populated = (config.accessories ?? []).filter( (accessory) => accessory.id && accessory.name && accessory.type !== AccessoryType.Thermostat);
    newAccessories.push(...populated);
  }

  let accessoriesChanged = false;
  if (accessories.length !== newAccessories.length) {
    accessories = newAccessories;
    accessoriesChanged = true;
  } else {
    accessories.forEach( (accessory, index) => {
      const compare = newAccessories[index];
      if (accessory.name !== compare.name || accessory.type !== compare.type || accessory.id !== compare.id) {
        accessories = newAccessories;
        accessoriesChanged = true;
      }
    });
  }

  accessoryIdInputs.forEach(element => {

    const idInput = element as HTMLInputElement;

    let accessorySelect = idInput.parentElement?.querySelector('select.form-select[data-accessory-name-select="true"]') as HTMLSelectElement;

    if (accessorySelect && accessorySelect.dataset.accessoryNameSelect !== 'true') {
      console.error('Unable to retrieve accessory name selector');
      return;
    }

    if (!accessorySelect) {
      accessorySelect = document.createElement('select');
      accessorySelect.className = 'form-select';

      accessorySelect.dataset.accessoryNameSelect = 'true';

      idInput.hidden = true;

      accessorySelect.addEventListener('change', () => {
        if (accessorySelect.selectedIndex === -1) {
          idInput.value = '';
        } else {
          const accessoryId = accessories[accessorySelect.selectedIndex].id;
          idInput.value = accessoryId;
        }
        idInput.dispatchEvent(new Event('input', { bubbles: true }));
      });

      idInput.parentElement?.appendChild(accessorySelect);
    }

    if (accessoriesChanged || accessorySelect.length === 0) {

      accessorySelect.length = 0;

      accessories.forEach(accessory => {
        const option = document.createElement('option');
        option.text = accessory.name;
        accessorySelect.add(option);
      });
    }

    const accessoryIndex = idInput.value.length ? accessories.findIndex( (accessory) => accessory.id === idInput.value) : -1;
    if (accessoryIndex === -1) {
      accessorySelect.selectedIndex = -1;
    } else {
      accessorySelect.selectedIndex = accessoryIndex ;

      const accessory = accessories[accessoryIndex];

      const stateSelect = findNextByName(accessorySelect, 'accessoryState') as HTMLSelectElement;
      if (!stateSelect) {
        console.error('Unable to find accessory state selector');
        return;
      }

      if (stateSelect.length !== 7) {
        console.error('Accessory state selector has an unexpected number of options');
        return;
      }

      const noneOption = stateSelect.options[0];
      const onOption = stateSelect.options[1];
      const offOption = stateSelect.options[2];
      const openOption = stateSelect.options[3];
      const closedOption = stateSelect.options[4];
      const lockedOption = stateSelect.options[5];
      const unlockedOption = stateSelect.options[6];

      noneOption.hidden = true;
      onOption.hidden = true;
      offOption.hidden = true;
      openOption.hidden = true;
      closedOption.hidden = true;
      lockedOption.hidden = true;
      unlockedOption.hidden = true;

      switch (accessory.type) {
      case AccessoryType.Lightbulb:
      case AccessoryType.Outlet:
      case AccessoryType.Switch:
        onOption.hidden = false;
        offOption.hidden = false;
        if (stateSelect.selectedIndex !== 1 && stateSelect.selectedIndex !== 2) {
          stateSelect.selectedIndex = -1;
          stateSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        break;
      case AccessoryType.Door:
      case AccessoryType.GarageDoorOpener:
      case AccessoryType.Window:
      case AccessoryType.WindowCovering:
        openOption.hidden = false;
        closedOption.hidden = false;
        if (stateSelect.selectedIndex !== 3 && stateSelect.selectedIndex !== 4) {
          stateSelect.selectedIndex = -1;
          stateSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        break;
      case AccessoryType.LockMechanism:
        if (stateSelect.selectedIndex !== 5 && stateSelect.selectedIndex !== 6) {
          stateSelect.selectedIndex = -1;
          stateSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        lockedOption.hidden = false;
        unlockedOption.hidden = false;
        break;
      case AccessoryType.Thermostat:
      default:
        return;
      }
    }
  });
}

async function migrateDeprecatedFields(configs: DummyPlatformConfig[]) {

  let changed = false;

  configs.forEach( (config) => {
    config.accessories?.forEach( (accessoryConfig) => {

      if ('defaultOn' in accessoryConfig) {
        (accessoryConfig as OnOffConfig).defaultState = accessoryConfig.defaultOn ? OnState.ON : OnState.OFF;
        accessoryConfig.defaultOn = undefined;
        changed = true;
      }

      const currentSensor = accessoryConfig.sensor;
      if (typeof currentSensor === 'string') {
        accessoryConfig.sensor = {
          type: currentSensor,
        };
        changed = true;
      }

      const schedule = accessoryConfig.schedule;
      if (schedule?.type === ScheduleType.CRON && schedule.cron !== 'CRON_CUSTOM' && !schedule.cron?.startsWith('@')) {
        accessoryConfig.schedule = {
          ...schedule,
          cron: 'CRON_CUSTOM',
          cronCustom: schedule.cron,
        };
        changed = true;
      }
    });
  });

  if (changed) {
    await homebridge.updatePluginConfig(configs);
  }
}

function showSettings(strings: Translation) {
  document.getElementById('intro')!.style.display = 'none';
  document.getElementById('migration')!.style.display = 'none';
  document.getElementById('support')!.style.display = 'block';

  const observer = new MutationObserver(() => {
    translateSchema(strings);
    updateAccessoryNames(strings);
    updateConditionDropdowns(strings);
  });

  observer.observe(
    window.parent.document.body,
    { childList: true, subtree: true },
  );

  homebridge.addEventListener('configChanged', async (evt: Event) => {
    const configs = (evt as MessageEvent).data as DummyPlatformConfig[];
    await updateConfigsWithUUIDs(configs);
    await updateConditionDropdowns(strings, configs);
  });

  homebridge.showSchemaForm();
  homebridge.hideSpinner();
  homebridge.enableSaveButton();
}

function showMigration(strings: Translation) {
    document.getElementById('header')!.style.display = 'none';
    document.getElementById('intro')!.style.display = 'none';
    document.getElementById('migration')!.style.display = 'block';

    const noButton = document.getElementById('skipMigration') as HTMLButtonElement;
    noButton.addEventListener('click', async () => {
      await homebridge.updatePluginConfig([{ name: PLUGIN_ALIAS }]);
      await homebridge.savePluginConfig();
      showSettings(strings);
    });

    const yesButton = document.getElementById('doMigration') as HTMLButtonElement;
    yesButton.addEventListener('click', async () => {
      await homebridge.updatePluginConfig([{ name: PLUGIN_ALIAS, migrationNeeded: true }]);
      await homebridge.savePluginConfig();
      homebridge.closeSettings();
      homebridge.toast.info(strings.config.migrationRestartDescription.replace('%s', PLUGIN_ALIAS), strings.config.migrationRestartTitle);
    });
}

function showIntro(strings: Translation) {

  const noButton = document.getElementById('showSettings') as HTMLButtonElement;
  noButton.addEventListener('click', async () => {
    await homebridge.updatePluginConfig([{ name: PLUGIN_ALIAS }]);
    showSettings(strings);
  });

  const yesButton = document.getElementById('showMigration') as HTMLButtonElement;
  yesButton.addEventListener('click', () => {
    showMigration(strings);
  });

  document.getElementById('intro')!.style.display = 'block';

  homebridge.hideSpinner();
}

(() => {
  homebridge.disableSaveButton();
  homebridge.showSpinner();
})();

(async () => {
  const language = await homebridge.i18nCurrentLang();
  const strings = await homebridge.request('i18n', language);
  translateHtml(strings);

  const configs = await homebridge.getPluginConfig() as DummyPlatformConfig[];
  if (configs.length) {
    await migrateDeprecatedFields(configs);
    showSettings(strings);
  } else {
    showIntro(strings);
  }
})();