// ─── Core Types ───────────────────────────────────────────────────────────────

export interface TimeSnapshot {
  hours: string;         // 24h, always 2 digits, "00"–"23"
  minutes: string;       // "00"–"59"
  seconds: string;       // "00"–"59"
  ms: string;            // "000"–"999"
  full: string;          // "HH:MM:SS.mmm"
  date: string;          // "June 7, 2026"
  dayOfWeek: string;     // "Sunday"
  timestamp: number;     // epoch ms at call time
  isPM: boolean;
  hours12: string;       // 12h, 2 digits
  hourNum: number;       // raw 0–23 for cheap downstream math
  offsetMinutes: number; // e.g. -300 for EST, +330 for IST — carried for DST detection
}

// ─── Cached Intl formatters ───────────────────────────────────────────────────
// Construction is expensive (~0.5ms). We cache one per timezone so every
// RAF tick is just a cheap formatToParts() call.
// Intl.DateTimeFormat objects are stateless — they always format the date
// argument you pass — so caching them is safe across DST transitions.

const timeFormatters   = new Map<string, Intl.DateTimeFormat>();
const dateFormatters   = new Map<string, Intl.DateTimeFormat>();
const offsetFormatters = new Map<string, Intl.DateTimeFormat>();

function getTimeFormatter(timezone: string): Intl.DateTimeFormat {
  if (!timeFormatters.has(timezone)) {
    timeFormatters.set(timezone, new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }));
  }
  return timeFormatters.get(timezone)!;
}

function getDateFormatter(timezone: string): Intl.DateTimeFormat {
  if (!dateFormatters.has(timezone)) {
    dateFormatters.set(timezone, new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }));
  }
  return dateFormatters.get(timezone)!;
}

function getOffsetFormatter(timezone: string): Intl.DateTimeFormat {
  if (!offsetFormatters.has(timezone)) {
    // shortOffset gives "GMT+5:30", "GMT-4", "GMT+0", etc.
    // It's live — it changes automatically when DST flips.
    offsetFormatters.set(timezone, new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    }));
  }
  return offsetFormatters.get(timezone)!;
}

// ─── DST-aware numeric offset ─────────────────────────────────────────────────
// Returns the current UTC offset in signed whole minutes (e.g. -300 for EST,
// +330 for IST, +345 for Nepal). Because we pass `new Date()` on every call,
// this is always live and reflects the post-transition value the instant DST
// flips. Returning an integer makes equality comparison exact — no float drift.

export function getNumericOffsetMinutes(timezone: string): number {
  try {
    const parts   = getOffsetFormatter(timezone).formatToParts(new Date());
    const tzName  = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0';
    const match   = tzName.match(/GMT([+-])(\d+)(?::(\d+))?/);
    if (!match) return 0;
    const sign = match[1] === '+' ? 1 : -1;
    const h    = parseInt(match[2], 10);
    const m    = parseInt(match[3] ?? '0', 10);
    return sign * (h * 60 + m);
  } catch {
    return 0;
  }
}

// ─── Human-readable UTC offset string ────────────────────────────────────────
// Always reads the *live* offset via getNumericOffsetMinutes so it is correct
// immediately after a DST transition. Callers must NOT memo this with only
// [timezone] as a dep — they need a time-aware invalidation (see LiveClock).

export function getUTCOffset(timezone: string): string {
  const totalMins = getNumericOffsetMinutes(timezone);
  const sign = totalMins >= 0 ? '+' : '-';
  const abs  = Math.abs(totalMins);
  const h    = String(Math.floor(abs / 60)).padStart(2, '0');
  const m    = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${h}:${m}`;
}

// ─── Main time snapshot ───────────────────────────────────────────────────────

export function getTimeInTimezone(timezone: string): TimeSnapshot {
  const now = new Date();

  let timeParts: Intl.DateTimeFormatPart[];
  let dateParts: Intl.DateTimeFormatPart[];

  try {
    timeParts = getTimeFormatter(timezone).formatToParts(now);
    dateParts = getDateFormatter(timezone).formatToParts(now);
  } catch {
    // Invalid / unknown timezone — fall back to UTC silently.
    timeParts = getTimeFormatter('UTC').formatToParts(now);
    dateParts = getDateFormatter('UTC').formatToParts(now);
  }

  const get  = (type: string) => timeParts.find(p => p.type === type)?.value ?? '00';
  const getD = (type: string) => dateParts.find(p => p.type === type)?.value ?? '';

  // Normalize: some browsers emit "24" at midnight in hour12:false mode.
  const hourNum = parseInt(get('hour'), 10) % 24;
  const hours   = String(hourNum).padStart(2, '0');
  const minutes = get('minute');
  const seconds = get('second');
  const ms      = String(now.getMilliseconds()).padStart(3, '0');

  const isPM    = hourNum >= 12;
  const h12raw  = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  const hours12 = String(h12raw).padStart(2, '0');

  // Embed the live offset in the snapshot so consumers can detect DST
  // transitions by comparing consecutive snapshots — no extra Intl call needed.
  const offsetMinutes = getNumericOffsetMinutes(timezone);

  return {
    hours, minutes, seconds, ms,
    full: `${hours}:${minutes}:${seconds}.${ms}`,
    date: `${getD('month')} ${getD('day')}, ${getD('year')}`,
    dayOfWeek: getD('weekday'),
    timestamp: now.getTime(),
    isPM, hours12, hourNum,
    offsetMinutes,
  };
}

// ─── Stable daytime check with hysteresis ─────────────────────────────────────
// During a DST "fall-back" the same wall-clock hour occurs twice. Without
// hysteresis, isDaytime() would flicker on/off because hourNum hovers at the
// boundary. We solve this by only flipping the day/night state when the clock
// has moved at least 5 minutes past the threshold (06:05 / 20:05).
//
// prevIsDay: the caller's last known state (stored in a ref, not recomputed).
// Returns the new stable state.

export function isDaytimeStable(
  snapshot: TimeSnapshot,
  prevIsDay: boolean,
): boolean {
  const h   = snapshot.hourNum;
  const min = parseInt(snapshot.minutes, 10);

  if (prevIsDay) {
    // Stay "day" until solidly past 20:05
    return !(h > 20 || (h === 20 && min >= 5));
  } else {
    // Stay "night" until solidly past 06:05
    return h > 6 || (h === 6 && min >= 5);
  }
}

// Convenience wrapper — no hysteresis, for one-shot callers (CountryCard etc.)
export function isDaytime(timezone: string, snapshot?: TimeSnapshot): boolean {
  try {
    const h = snapshot ? snapshot.hourNum : getTimeInTimezone(timezone).hourNum;
    return h >= 6 && h < 20;
  } catch {
    return true;
  }
}

// ─── Validate timezone string ─────────────────────────────────────────────────

export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
