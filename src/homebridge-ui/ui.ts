import { IHomebridgePluginUi } from '@homebridge/plugin-ui-utils/ui.interface';

import { Translation } from '../i18n/i18n.js';

import { PLUGIN_ALIAS } from '../homebridge/settings.js';

import { DummyPlatformConfig } from '../model/types.js';
import { ScheduleType } from '../model/enums.js';

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
    });
  });

  if (changed) {
    await homebridge.updatePluginConfig(configs);
  }
}

async function migrateDeprecatedFields(configs: DummyPlatformConfig[]) {

  let changed = false;

  configs.forEach( (config) => {
    config.accessories?.forEach( (accessoryConfig) => {

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
  });

  observer.observe(
    window.parent.document.body,
    { childList: true, subtree: true },
  );

  homebridge.addEventListener('configChanged', async (evt: Event) => {
    const configs = (evt as MessageEvent).data as DummyPlatformConfig[];
    await updateConfigsWithUUIDs(configs);
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