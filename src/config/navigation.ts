import type { UiKey } from '@/i18n/ui';

/**
 * Section anchors. Sections and the navigation both read from here,
 * so an id can never drift between a link and its target.
 */
export const SECTION = {
  why: 'neden-ben',
  about: 'hakkimda',
  chat: 'tanisalim',
  journey: 'yol',
  projects: 'projeler',
  skills: 'beceriler',
  education: 'egitim',
  contact: 'iletisim',
} as const;

export interface NavItem {
  readonly href: `#${string}`;
  readonly label: UiKey;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: `#${SECTION.why}`, label: 'nav.why' },
  { href: `#${SECTION.about}`, label: 'nav.about' },
  { href: `#${SECTION.chat}`, label: 'nav.chat' },
  { href: `#${SECTION.journey}`, label: 'nav.journey' },
  { href: `#${SECTION.projects}`, label: 'nav.projects' },
  { href: `#${SECTION.skills}`, label: 'nav.skills' },
  { href: `#${SECTION.contact}`, label: 'nav.contact' },
];

/** Element id of a project's heading (cards and the featured showcase). */
export function projectAnchorId(projectId: string): string {
  return `project-${projectId}`;
}

/** Element id of a single journey stop in the timeline (used by the hero legend). */
export function journeyStopId(stopId: string): string {
  return `${SECTION.journey}-${stopId}`;
}
