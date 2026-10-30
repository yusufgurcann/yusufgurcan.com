import type { ContactChannels } from '@/config/site';
import type { Locale } from '@/i18n/locales';
import type { UiKey } from '@/i18n/ui';

export interface ContactLink {
  readonly key: keyof ContactChannels;
  readonly label: UiKey;
  /** `null` when the channel hasn't been provided yet. */
  readonly href: string | null;
  /** Text shown for the link (e.g. the address itself for e-mail). */
  readonly display: string | null;
  readonly external: boolean;
}

/** Strips the protocol and trailing slash so profile URLs read cleanly. */
export function prettyUrl(url: string): string {
  return decodeURI(url).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

/**
 * "+905525945375" → "0552 594 53 75" for Turkish readers, "+90 552 594 53 75" for everyone else.
 * Numbers that aren't Turkish mobiles are shown as is.
 */
export function prettyPhone(phone: string, locale: Locale): string {
  const match = /^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(phone);
  if (!match) return phone;
  const local = match.slice(1).join(' ');
  return locale === 'tr' ? `0${local}` : `+90 ${local}`;
}

/** Normalises the configured channels into a uniform, render-ready list. */
export function contactLinks(channels: ContactChannels, locale: Locale): ContactLink[] {
  // The phone number is intentionally left out: it appears on the CV only.
  const { email, github, linkedin } = channels;
  const cv = channels.cv?.[locale] ?? null;
  return [
    { key: 'email', label: 'contact.email', href: email && `mailto:${email}`, display: email, external: false },
    { key: 'github', label: 'contact.github', href: github, display: github && prettyUrl(github), external: true },
    { key: 'linkedin', label: 'contact.linkedin', href: linkedin, display: linkedin && prettyUrl(linkedin), external: true },
    { key: 'cv', label: 'contact.cv', href: cv, display: cv && 'PDF ↓', external: false },
  ];
}
