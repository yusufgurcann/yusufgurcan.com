import { LOCALE_TAGS, type Locale } from '@/i18n/locales';
import type { Translate } from '@/i18n/translate';
import { pick, type Localized } from './localize';

export interface PeriodInput {
  /** "YYYY" or "YYYY-MM" */
  readonly start: string | null;
  readonly end: string | null;
  readonly ongoing: boolean;
  readonly approximate: boolean;
  readonly note?: Localized<string> | undefined;
  readonly length?: Localized<string> | undefined;
}

export interface PeriodLabel {
  /** Human readable range, or `null` when nothing is known yet. */
  readonly text: string | null;
  /** e.g. "2 yıl 8 ay"; only when both ends are known to the month. */
  readonly duration: string | null;
  readonly ongoing: boolean;
  readonly approximate: boolean;
}

interface YearMonth {
  readonly year: number;
  /** 1–12, or `null` when only the year is known. */
  readonly month: number | null;
}

function parse(value: string): YearMonth {
  const [year, month] = value.split('-').map(Number);
  return { year: year ?? 0, month: month ?? null };
}

function formatPoint({ year, month }: YearMonth, locale: Locale): string {
  if (month === null) return String(year);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

/** Inclusive length in months (June–January = 8), as LinkedIn and most CVs count it. */
function lengthInMonths(start: YearMonth, end: YearMonth): number | null {
  if (start.month === null || end.month === null) return null;
  const months = (end.year - start.year) * 12 + (end.month - start.month) + 1;
  return months > 0 ? months : null;
}

function formatDuration(totalMonths: number, locale: Locale): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const unit = (value: number, kind: 'year' | 'month') =>
    new Intl.NumberFormat(LOCALE_TAGS[locale], { style: 'unit', unit: kind, unitDisplay: 'long' }).format(value);
  return [years > 0 && unit(years, 'year'), months > 0 && unit(months, 'month')].filter(Boolean).join(' ');
}

/**
 * Turns a (possibly incomplete) period into display labels.
 * Unknown dates are never invented: with no dates and no note, `text` is `null`.
 */
export function formatPeriod(
  period: PeriodInput,
  locale: Locale,
  t: Translate,
  { withDuration = false }: { withDuration?: boolean } = {},
): PeriodLabel {
  const base = { ongoing: period.ongoing, approximate: period.approximate };
  const start = period.start ? parse(period.start) : null;
  const end = period.end ? parse(period.end) : null;

  const months = withDuration && start && end ? lengthInMonths(start, end) : null;
  const computed = months ? formatDuration(months, locale) : null;
  const duration = withDuration && period.length ? pick(period.length, locale) : computed;

  if (period.note) return { ...base, duration, text: pick(period.note, locale) };

  const approx = period.approximate ? '≈ ' : '';
  const from = start && formatPoint(start, locale);
  const to = end ? formatPoint(end, locale) : period.ongoing ? t('journey.now') : null;

  let text: string | null = null;
  if (from && to) text = `${approx}${from} – ${to}`;
  else if (from) text = `${approx}${from} – …`;
  else if (period.ongoing) text = t('journey.now');

  return { ...base, duration, text };
}
