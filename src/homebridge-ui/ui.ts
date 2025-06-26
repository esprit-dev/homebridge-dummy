import { IHomebridgePluginUi } from '@homebridge/plugin-ui-utils/ui.interface';

import { Translation } from '../i18n/i18n.js';

import { MigrationState } from '../model/types.js';

declare const homebridge: IHomebridgePluginUi;

const i18n_replacements = {
  github: '<a target="_blank" href="https://github.com/mpatfield/homebridge-dummy/">GitHub</a>',
  migration: '<a target="_blank" href="https://github.com/mpatfield/homebridge-dummy/#migration">GitHub</a>',
  dummy: 'Homebridge Dummy',
};

const translateHtml = (strings: Translation) => {
  document.querySelectorAll('[i18n]').forEach(element => {

    const key = element.getAttribute('i18n') as keyof typeof strings.config;
    let string = strings.config[key] as string;

    const token = element.getAttribute('i18n_replace');
    if (token) {
      string = string.replace('%s', i18n_replacements[token]);
    }
    element.innerHTML = string;
  });
};

const translateSchema = (strings: Translation) => {
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
};

const updateAccessoryNames = (strings: Translation) => {

  const legends = Array.from(window.parent.document.querySelectorAll('fieldset legend'))
    .filter(el => !el.textContent?.includes(strings.config.title.legacyAccessories));

  for(const legend of legends) {
    const fieldset = legend.closest('fieldset');
    const input = fieldset?.querySelector('input[type="text"][name="name"]') as HTMLInputElement | null;
    if (input && legend.textContent !== (input.value || strings.config.title.legacyAccessory)) {
      legend.textContent = input.value !== '' ? input.value : strings.config.title.legacyAccessory;
    }

    if (input && !input.dataset.accessoryNameListener) {
      input.addEventListener('input', () => updateAccessoryNames(strings));
      input.dataset.accessoryNameListener = 'true';
    }
  }
};

const showSettings = async (strings: Translation) => {
  homebridge.showSpinner();
  document.getElementById('intro')!.style.display = 'none';
  document.getElementById('support')!.style.display = 'block';

  const observer = new MutationObserver(() => {
    translateSchema(strings);
    updateAccessoryNames(strings);
  });

  observer.observe(
    window.parent.document.body,
    { childList: true, subtree: true },
  );

  homebridge.showSchemaForm();
  homebridge.hideSpinner();
};

const showMigration = () => {
    document.getElementById('intro')!.style.display = 'none';
    document.getElementById('migration')!.style.display = 'block';
};

const showIntro = (strings: Translation) => {

  const noButton = document.getElementById('buttonNo') as HTMLButtonElement;
  noButton.addEventListener('click', async () => {
    homebridge.showSpinner();
    await homebridge.updatePluginConfig([{ name: i18n_replacements.dummy, migration: MigrationState.SKIPPED }]);
    await homebridge.savePluginConfig();
    showSettings(strings);
  });

  const yesButton = document.getElementById('buttonYes') as HTMLButtonElement;
  yesButton.addEventListener('click', async () => {
    await homebridge.updatePluginConfig([{ name: i18n_replacements.dummy, migration: MigrationState.NEEDED }]);
    await homebridge.savePluginConfig();
    showMigration();
  });

  document.getElementById('intro')!.style.display = 'block';

  homebridge.hideSpinner();
};

(async () => {
  homebridge.showSpinner();

  const language = await homebridge.i18nCurrentLang();
  const strings = await homebridge.request('i18n', language);
  translateHtml(strings);

  const config = await homebridge.getPluginConfig();
  if (config.length) {
    await showSettings(strings);
  } else {
    showIntro(strings);
  }
})();