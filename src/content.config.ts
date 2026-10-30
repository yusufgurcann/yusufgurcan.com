/**
 * Content schemas.
 *
 * Every piece of biographical text lives in a YAML file under `src/content/`
 * and is validated here at build time, so a typo in a field name or a
 * missing translation fails the build instead of shipping a broken page.
 *
 * Translatable text is written as `{ tr: "...", en: "..." }`.
 */
import { defineCollection, reference } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const localized = z.object({ tr: z.string().min(1), en: z.string().min(1) });
const localizedList = z.object({ tr: z.array(z.string().min(1)), en: z.array(z.string().min(1)) });

/** Visual identity of a journey stop; maps to a `--stage-*` colour token. */
const stageColor = z.enum(['clay', 'amber', 'sea', 'sky', 'plum', 'moss', 'rose', 'ink']);

/** "2021" or "2021-06". Coerced so unquoted YAML years also work. */
const yearMonth = z.coerce
  .string()
  .regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Use YYYY or YYYY-MM, e.g. 2021-06');

/** A date range that may be approximate or still unknown. */
const period = z.object({
  start: yearMonth.nullable().default(null),
  end: yearMonth.nullable().default(null),
  /** True while the stop is ongoing ("now"). */
  ongoing: z.boolean().default(false),
  /** Marks the dates as approximate ("≈"). */
  approximate: z.boolean().default(false),
  /** Free text that replaces the computed label, e.g. "about 3 years". */
  note: localized.optional(),
  /** Overrides the computed duration when the calendar math misleads, e.g. "1 yıl". */
  length: localized.optional(),
});

const profile = defineCollection({
  loader: file('src/content/profile.yaml'),
  schema: z.object({
    role: localized,
    headline: localized,
    languages: localized,
    intro: localized,
    /** Printable CV: a keyword-rich summary for applicant tracking systems. */
    cv: z.object({ summary: localized }),
    /** Hero "at a glance" card: a few headings a recruiter can take in at once. */
    glance: z.object({
      label: localized,
      items: z.array(z.object({ title: localized, description: localized })).min(2).max(5),
    }),
    /** The "why me?" section: the hard question, a straight answer and an offer. */
    pitch: z.object({ question: localized, answer: localized, offer: localized }),
  }),
});

const journey = defineCollection({
  loader: file('src/content/journey.yaml'),
  schema: z.object({
    order: z.number().int(),
    kind: z.enum(['education', 'work', 'internship', 'freelance', 'volunteer', 'growth']),
    color: stageColor,
    organization: z.string(),
    title: localized,
    period: period.default({ start: null, end: null, ongoing: false, approximate: false }),
    summary: localized,
    /** What I did there, one item per bullet. */
    work: localizedList.optional(),
    /** Products I worked on, e.g. at an internship. */
    highlights: z.array(z.object({ name: z.string(), description: localized })).default([]),
    learned: localizedList.optional(),
  }),
});

const projects = defineCollection({
  loader: file('src/content/projects.yaml'),
  schema: z.object({
    order: z.number().int(),
    /**
     * featured: large showcase at the top · card: regular card ·
     * mention: listed by name only under "also".
     */
    display: z.enum(['featured', 'card', 'mention']).default('card'),
    name: z.string(),
    color: stageColor,
    /** Path under /public, e.g. "/projects/blokla/icon.png". */
    icon: z.string().startsWith('/').optional(),
    /** Screenshots under /public; when empty, a featured project shows its illustrated preview. */
    screenshots: z.array(z.object({ src: z.string().startsWith('/'), alt: localized })).default([]),
    /** Where the project comes from, e.g. personal, school, volunteer. */
    context: localized,
    tagline: localized,
    purpose: localized.optional(),
    role: localized.optional(),
    /** What I built / did, one item per bullet. */
    work: localizedList.optional(),
    stack: z.array(z.string()).min(1),
    status: localized.nullable(),
    focus: localizedList.optional(),
    links: z
      .array(z.object({ label: localized, url: z.url() }))
      .default([]),
  }),
});

const skills = defineCollection({
  loader: file('src/content/skills.yaml'),
  schema: z.object({
    order: z.number().int(),
    title: localized,
    description: localized,
    items: z.array(z.object({ name: z.string(), context: localized })).min(1),
  }),
});

const education = defineCollection({
  loader: file('src/content/education.yaml'),
  schema: z.object({
    order: z.number().int(),
    school: localized,
    program: localized,
    status: localized,
    period: period.optional(),
  }),
});

const conversation = defineCollection({
  loader: file('src/content/conversation.yaml'),
  schema: z.object({
    order: z.number().int(),
    question: localized,
    answer: localized,
  }),
});

/** "Why me?" reasons, each backed by a journey stop or a project. */
const reasons = defineCollection({
  loader: file('src/content/reasons.yaml'),
  schema: z
    .object({
      order: z.number().int(),
      title: localized,
      body: localized,
      stop: reference('journey').optional(),
      project: reference('projects').optional(),
    })
    .refine((r) => Boolean(r.stop) !== Boolean(r.project), {
      message: 'Each reason needs exactly one of `stop` or `project` as evidence.',
    }),
});

export const collections = { profile, journey, projects, skills, education, conversation, reasons };
