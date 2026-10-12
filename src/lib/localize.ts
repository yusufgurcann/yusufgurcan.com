import type { Locale } from '@/i18n/locales';

/** A value authored once per locale in the content files. */
export type Localized<T> = Readonly<Record<Locale, T>>;

export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}

export function pickOptional<T>(value: Localized<T> | null | undefined, locale: Locale): T | null {
  return value ? value[locale] : null;
}
