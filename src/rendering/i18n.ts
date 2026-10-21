import {createInstance} from 'i18next';
import en from '../assets/en/translation.json';
import ar from '../assets/ar/translation.json';
import type {Language} from './preferences';

// A fresh instance belongs to one render. Concurrent requests must never share language state.
export function createLanguage(language: Language) {
  const instance = createInstance();
  void instance.init({
    resources:{en:{translation:en}, ar:{translation:ar}}, lng:language,
    fallbackLng:'en', initImmediate:false, interpolation:{escapeValue:false},
  });
  return instance;
}
