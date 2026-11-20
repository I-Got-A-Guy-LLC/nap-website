export interface HolidayClosure {
  /** ISO date of the cancelled meeting */
  date: string;
  /** City slug matching cityData keys */
  citySlug: string;
  /** Display name */
  city: string;
  /** Normal meeting day */
  day: string;
  /** Short reason shown to visitors */
  reason: string;
}

export interface HolidayClosureConfig {
  /** Unique key for localStorage dismiss state */
  id: string;
  /** Full banner text */
  bannerText: string;
  /** Last date (inclusive, America/Chicago) the banner and notices display */
  showThrough: string;
  /** Cities whose meetings are cancelled */
  closures: HolidayClosure[];
}

// Set to null when no holiday closure is active.
export const ACTIVE_CLOSURE: HolidayClosureConfig | null = {
  id: "thanksgiving-2026",
  bannerText:
    "Happy Thanksgiving! Murfreesboro (Nov 25), Nolensville (Nov 26), and Smyrna (Nov 27) will not meet Thanksgiving week. Manchester meets as usual Tuesday, Nov 24. All groups are back the following week.",
  showThrough: "2026-11-27",
  closures: [
    { date: "2026-11-25", citySlug: "murfreesboro", city: "Murfreesboro", day: "Wednesday", reason: "Thanksgiving week" },
    { date: "2026-11-26", citySlug: "nolensville", city: "Nolensville", day: "Thursday", reason: "Thanksgiving week" },
    { date: "2026-11-27", citySlug: "smyrna", city: "Smyrna", day: "Friday", reason: "Thanksgiving week" },
  ],
};

/** Today in Central time as YYYY-MM-DD. */
export function todayInCentral(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** True while the closure window is active (through showThrough inclusive). */
export function isClosureActive(): boolean {
  if (!ACTIVE_CLOSURE) return false;
  return todayInCentral() <= ACTIVE_CLOSURE.showThrough;
}

/** Closure for a given city slug, or undefined. */
export function closureForCity(slug: string): HolidayClosure | undefined {
  return ACTIVE_CLOSURE?.closures.find((c) => c.citySlug === slug);
}

/** All closed ISO dates as a Set (for calendar use). */
export function closedDatesSet(): Set<string> {
  if (!ACTIVE_CLOSURE) return new Set();
  return new Set(ACTIVE_CLOSURE.closures.map((c) => c.date));
}

/** Closed dates for a city slug (for schema exceptDate). */
export function exceptDatesFor(citySlug: string): string[] {
  if (!ACTIVE_CLOSURE) return [];
  return ACTIVE_CLOSURE.closures
    .filter((c) => c.citySlug === citySlug)
    .map((c) => c.date);
}
