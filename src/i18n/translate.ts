import { dictionaries, type UiKey } from './ui';
import type { Locale } from './locales';

export type Translate = (key: UiKey) => string;

/** Returns a translator bound to `locale`. */
export function useTranslations(locale: Locale): Translate {
  const dictionary = dictionaries[locale];
  return (key) => dictionary[key];
}
