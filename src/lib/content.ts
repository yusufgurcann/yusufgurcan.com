/**
 * Content repository.
 *
 * The only module that talks to `astro:content`. It loads the collections,
 * sorts them and maps each entry to a locale-resolved view model, so that
 * components receive plain, ready-to-render data and never deal with
 * `{ tr, en }` objects or collection APIs themselves.
 */
import { getCollection, getEntry, type CollectionEntry, type CollectionKey } from 'astro:content';
import type { Locale } from '@/i18n/locales';
import { useTranslations } from '@/i18n/translate';
import { pick, pickOptional } from './localize';
import { formatPeriod, type PeriodLabel } from './period';
import { journeyStopId, projectAnchorId } from '@/config/navigation';

export type StageColor = CollectionEntry<'journey'>['data']['color'];
export type JourneyKind = CollectionEntry<'journey'>['data']['kind'];

export interface Profile {
  readonly role: string;
  readonly headline: string;
  readonly languages: string;
  readonly intro: string;
  readonly pitch: { readonly question: string; readonly answer: string; readonly offer: string };
  readonly cvSummary: string;
  readonly glance: {
    readonly label: string;
    readonly facts: readonly { readonly value: string; readonly label: string }[];
    readonly now: string;
  };
}

export interface JourneyStop {
  readonly id: string;
  readonly kind: JourneyKind;
  readonly color: StageColor;
  readonly organization: string;
  readonly title: string;
  readonly period: PeriodLabel;
  /** "YYYY-MM" start, for sorting (e.g. newest-first on the CV). */
  readonly startKey: string | null;
  readonly summary: string;
  readonly work: readonly string[];
  readonly highlights: readonly { readonly name: string; readonly description: string }[];
  readonly learned: readonly string[];
}

export type ProjectDisplay = CollectionEntry<'projects'>['data']['display'];

export interface Project {
  readonly id: string;
  readonly display: ProjectDisplay;
  readonly name: string;
  readonly icon: string | null;
  readonly screenshots: readonly { readonly src: string; readonly alt: string }[];
  readonly color: StageColor;
  readonly context: string;
  readonly tagline: string;
  readonly purpose: string | null;
  readonly role: string | null;
  readonly work: readonly string[];
  readonly stack: readonly string[];
  readonly status: string | null;
  readonly focus: readonly string[];
  readonly links: readonly { readonly label: string; readonly url: string }[];
}

export interface SkillGroup {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly items: readonly { readonly name: string; readonly context: string }[];
}

export interface EducationEntry {
  readonly id: string;
  readonly school: string;
  readonly program: string;
  readonly status: string;
  readonly period: PeriodLabel | null;
}

export interface Reason {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  /** Where the claim is backed up on the page. */
  readonly evidence: { readonly label: string; readonly href: `#${string}` };
}

export interface ChatTurn {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

type Ordered = { data: { order: number } };
const byOrder = (a: Ordered, b: Ordered) => a.data.order - b.data.order;

async function ordered<C extends CollectionKey>(collection: C) {
  const entries = await getCollection(collection);
  return (entries as (CollectionEntry<C> & Ordered)[]).sort(byOrder);
}

export async function getProfile(locale: Locale): Promise<Profile> {
  const entry = await getEntry('profile', 'main');
  if (!entry) throw new Error('src/content/profile.yaml must contain an entry with id "main".');
  const { data } = entry;
  return {
    role: pick(data.role, locale),
    headline: pick(data.headline, locale),
    languages: pick(data.languages, locale),
    intro: pick(data.intro, locale),
    cvSummary: pick(data.cv.summary, locale),
    glance: {
      label: pick(data.glance.label, locale),
      facts: data.glance.facts.map((fact) => ({ value: pick(fact.value, locale), label: pick(fact.label, locale) })),
      now: pick(data.glance.now, locale),
    },
    pitch: {
      question: pick(data.pitch.question, locale),
      answer: pick(data.pitch.answer, locale),
      offer: pick(data.pitch.offer, locale),
    },
  };
}

export async function getJourney(locale: Locale): Promise<JourneyStop[]> {
  const t = useTranslations(locale);
  return (await ordered('journey')).map(({ id, data }) => ({
    id,
    kind: data.kind,
    color: data.color,
    organization: data.organization,
    title: pick(data.title, locale),
    period: formatPeriod(data.period, locale, t, { withDuration: data.kind !== 'education' }),
    startKey: data.period.start,
    summary: pick(data.summary, locale),
    work: pickOptional(data.work, locale) ?? [],
    highlights: data.highlights.map((h) => ({ name: h.name, description: pick(h.description, locale) })),
    learned: pickOptional(data.learned, locale) ?? [],
  }));
}

export async function getProjects(locale: Locale): Promise<Project[]> {
  return (await ordered('projects')).map(({ id, data }) => ({
    id,
    display: data.display,
    name: data.name,
    icon: data.icon ?? null,
    screenshots: data.screenshots.map((shot) => ({ src: shot.src, alt: pick(shot.alt, locale) })),
    color: data.color,
    context: pick(data.context, locale),
    tagline: pick(data.tagline, locale),
    purpose: pickOptional(data.purpose, locale),
    role: pickOptional(data.role, locale),
    work: pickOptional(data.work, locale) ?? [],
    stack: data.stack,
    status: pickOptional(data.status, locale),
    focus: pickOptional(data.focus, locale) ?? [],
    links: data.links.map((link) => ({ label: pick(link.label, locale), url: link.url })),
  }));
}

export async function getSkills(locale: Locale): Promise<SkillGroup[]> {
  return (await ordered('skills')).map(({ id, data }) => ({
    id,
    title: pick(data.title, locale),
    description: pick(data.description, locale),
    items: data.items.map((item) => ({ name: item.name, context: pick(item.context, locale) })),
  }));
}

export async function getEducation(locale: Locale): Promise<EducationEntry[]> {
  const t = useTranslations(locale);
  return (await ordered('education')).map(({ id, data }) => ({
    id,
    school: pick(data.school, locale),
    program: pick(data.program, locale),
    status: pick(data.status, locale),
    period: data.period ? formatPeriod(data.period, locale, t) : null,
  }));
}

export async function getConversation(locale: Locale): Promise<ChatTurn[]> {
  return (await ordered('conversation')).map(({ id, data }) => ({
    id,
    question: pick(data.question, locale),
    answer: pick(data.answer, locale),
  }));
}

export async function getReasons(locale: Locale): Promise<Reason[]> {
  const [entries, journey, projects] = await Promise.all([
    ordered('reasons'),
    getCollection('journey'),
    getCollection('projects'),
  ]);

  return entries.map(({ id, data }) => {
    const stop = data.stop && journey.find((entry) => entry.id === data.stop?.id);
    const project = data.project && projects.find((entry) => entry.id === data.project?.id);
    const evidence = stop
      ? { label: stop.data.organization, href: `#${journeyStopId(stop.id)}` as const }
      : project
        ? { label: project.data.name, href: `#${projectAnchorId(project.id)}` as const }
        : null;
    if (!evidence) throw new Error(`Reason "${id}" points to evidence that doesn't exist.`);
    return { id, title: pick(data.title, locale), body: pick(data.body, locale), evidence };
  });
}

/** Everything the home page needs, loaded in parallel. */
export async function getHomeContent(locale: Locale) {
  const [profile, reasons, journey, projects, skills, education, conversation] = await Promise.all([
    getProfile(locale),
    getReasons(locale),
    getJourney(locale),
    getProjects(locale),
    getSkills(locale),
    getEducation(locale),
    getConversation(locale),
  ]);
  return { profile, reasons, journey, projects, skills, education, conversation };
}

export type HomeContent = Awaited<ReturnType<typeof getHomeContent>>;
