/**
 * Locale definitions. Keep in sync with `i18n.locales` in astro.config.mjs.
 */
export const LOCALES = ['tr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'tr';

/** BCP 47 tags used for `<html lang>`, hreflang and Intl formatting. */
export const LOCALE_TAGS: Record<Locale, string> = {
  tr: 'tr-TR',
  en: 'en-US',
};

/** Native names shown in the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
};

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as readonly string[]).includes(value);
}

/** Root path of a locale's home page ("/" for the default locale, "/en/" otherwise). */
export function homePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '/' : `/${locale}/`;
}
