import { readFileSync } from 'fs';
import merge from 'lodash.merge';

import de from './de.js';
import el from './el.js';
import en from './en.js';
import es from './es.js';
import ru from './ru.js';
import vi from './vi.js';

export enum Language {
  DE = 'de',
  EL = 'el',
  EN = 'en',
  ES = 'es',
  RU = 'ru',
  VI = 'vi',
}

const Translations = {
  [Language.DE]: de,
  [Language.EL]: el,
  [Language.EN]: en,
  [Language.ES]: es,
  [Language.RU]: ru,
  [Language.VI]: vi,
};

let currentLanguage = Language.EN;

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(configPath: string) {

  let isoLang: string | undefined;
  try {
    const systemConfig = readFileSync(configPath, { encoding: 'utf8' });
    isoLang = JSON.parse(systemConfig).platforms.filter( (c: Record<string, unknown>) => c.platform === 'config')[0].lang;
  } catch {
    // nothing
  }

  if (isoLang === undefined || isoLang.trim().length === 0 || isoLang === 'auto') {
    isoLang = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
  }

  currentLanguage = isoLang in Translations ? isoLang as Language : Language.EN;
}

type Translation = typeof en;

export function getTranslation(language: Language): Record<string, string | object> {
  return Translations[language] ?? {};
}

export function getStrings(language: Language): Translation {
  return merge({}, en, getTranslation(language));
}

const translations = new Proxy({} as Translation, {
  get(_target, prop: keyof Translation) {
    return getTranslation(currentLanguage)[prop] ?? en[prop];
  },
});

export { translations as strings };