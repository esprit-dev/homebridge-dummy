import de from './de.js';
import en from './en.js';
import es from './es.js';
import ru from './ru.js';

export enum Language {
  DE = 'de',
  EN = 'en',
  ES = 'es',
  RU = 'ru',
}

const Translations: Record<Language, Translation> = {
  [Language.DE]: de,
  [Language.EN]: en,
  [Language.ES]: es,
  [Language.RU]: ru,
};

export type Translation = typeof en;

let currentLanguage: Language = Language.EN;

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(i18nLang: string) {

  let language = Language.EN;
  switch(i18nLang) {
  case Language.DE:
    language = Language.DE;
    break;
  case Language.EN:
    language = Language.EN;
    break;
  case Language.ES:
    language = Language.ES;
    break;
  case Language.RU:
    language = Language.RU;
    break;
  }

  currentLanguage = Translations[language] ? language : Language.EN;
}

export function getAllTranslations(): Translation {
  return Translations[currentLanguage];
}

const translations = new Proxy({} as Translation, {
  get(_target, prop: string) {
    return (
      Translations[currentLanguage][prop as keyof Translation] ??
      Translations[Language.EN][prop as keyof Translation]
    );
  },
});

export { translations as strings };