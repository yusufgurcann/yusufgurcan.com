import type { Locale } from '@/i18n/locales';

/**
 * Personal details and contact channels.
 *
 * Any value left as `null` is treated as "not provided yet":
 *  - in development (`npm run dev`) it is shown as a dashed "to be added" hint,
 *  - in the production build it is simply hidden.
 * Fill them in when ready; no other file needs to change.
 */
export interface ContactChannels {
  /** e.g. "ad@ornek.com" */
  readonly email: string | null;
  /** International format, e.g. "+905551112233". Printed on the CV only, never on the website. */
  readonly phone: string | null;
  /** Full profile URL, e.g. "https://github.com/kullanici" */
  readonly github: string | null;
  /** Full profile URL, e.g. "https://www.linkedin.com/in/kullanici" */
  readonly linkedin: string | null;
  /**
   * CV PDF per language, under /public. Generated from the site content by
   * `npm run cv` (see tools/build-cv.mjs), so the CV never drifts from the site.
   */
  readonly cv: Readonly<Record<Locale, string>> | null;
}

export interface SiteConfig {
  /**
   * Google Search Console "HTML tag" verification code (only the content="…" value).
   * Leave null if you verify via DNS instead.
   */
  readonly googleSiteVerification: string | null;
  readonly name: string;
  readonly initials: string;
  readonly location: string;
  /** More precise location, used on the CV only. */
  readonly district: string;
  readonly openToWork: boolean;
  readonly contact: ContactChannels;
}

export const site: SiteConfig = {
  googleSiteVerification: null,
  name: 'Yusuf Gürcan',
  initials: 'YG',
  location: 'İstanbul',
  district: 'Çekmeköy, İstanbul',
  openToWork: true,
  contact: {
    email: 'yusufgur401@gmail.com',
    phone: '+905525945375',
    github: 'https://github.com/yusufgurcann',
    linkedin: 'https://www.linkedin.com/in/yusuf-g%C3%BCrcan',
    cv: {
      tr: '/cv/yusuf-gurcan-cv.pdf',
      en: '/cv/yusuf-gurcan-cv-en.pdf',
    },
  },
};
