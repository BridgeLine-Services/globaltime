// ─── Core Types ──────────────────────────────────────────────────────────────

export interface TimeSnapshot {
  hours: string;     // 24h, always 2 digits, "00"–"23"
  minutes: string;   // "00"–"59"
  seconds: string;   // "00"–"59"
  ms: string;        // "000"–"999"
  full: string;      // "HH:MM:SS.mmm"
  date: string;      // "June 7, 2026"
  dayOfWeek: string; // "Sunday"
  timestamp: number; // epoch ms at call time
  isPM: boolean;
  hours12: string;   // 12h, 2 digits
  hourNum: number;   // raw 0–23 for cheap downstream math
}

// ─── Cached formatters ───────────────────────────────────────────────────────
// Intl.DateTimeFormat construction is expensive (~0.5ms each).
// We cache one per timezone so every RAF tick is just a formatToParts() call.

const timeFormatters = new Map<string, Intl.DateTimeFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function getTimeFormatter(timezone: string): Intl.DateTimeFormat {
  if (!timeFormatters.has(timezone)) {
    timeFormatters.set(
      timezone,
      new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    );
  }
  return timeFormatters.get(timezone)!;
}

function getDateFormatter(timezone: string): Intl.DateTimeFormat {
  if (!dateFormatters.has(timezone)) {
    dateFormatters.set(
      timezone,
      new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }
  return dateFormatters.get(timezone)!;
}

// ─── Main snapshot function ───────────────────────────────────────────────────

export function getTimeInTimezone(timezone: string): TimeSnapshot {
  const now = new Date();

  let timeParts: Intl.DateTimeFormatPart[];
  let dateParts: Intl.DateTimeFormatPart[];

  try {
    timeParts = getTimeFormatter(timezone).formatToParts(now);
    dateParts = getDateFormatter(timezone).formatToParts(now);
  } catch {
    // Fallback: use local time if timezone is invalid
    timeParts = getTimeFormatter('UTC').formatToParts(now);
    dateParts = getDateFormatter('UTC').formatToParts(now);
  }

  const get = (type: string) => timeParts.find(p => p.type === type)?.value ?? '00';
  const getD = (type: string) => dateParts.find(p => p.type === type)?.value ?? '';

  // Some browsers emit "24" at midnight in hour12:false mode — normalize it.
  const rawHour = get('hour');
  const hourNum = parseInt(rawHour, 10) % 24;
  const hours = String(hourNum).padStart(2, '0');

  const minutes = get('minute');
  const seconds = get('second');
  const ms = String(now.getMilliseconds()).padStart(3, '0');

  const isPM = hourNum >= 12;
  const h12 = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  const hours12 = String(h12).padStart(2, '0');

  return {
    hours,
    minutes,
    seconds,
    ms,
    full: `${hours}:${minutes}:${seconds}.${ms}`,
    date: `${getD('month')} ${getD('day')}, ${getD('year')}`,
    dayOfWeek: getD('weekday'),
    timestamp: now.getTime(),
    isPM,
    hours12,
    hourNum,
  };
}

// ─── UTC offset (correct for half-hour/quarter-hour zones) ───────────────────
// Uses Intl to extract the numeric offset directly — no floating-point date math.

const offsetFormatters = new Map<string, Intl.DateTimeFormat>();

export function getUTCOffset(timezone: string): string {
  try {
    if (!offsetFormatters.has(timezone)) {
      offsetFormatters.set(
        timezone,
        new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          timeZoneName: 'shortOffset', // e.g. "GMT+5:30"
        })
      );
    }
    const parts = offsetFormatters.get(timezone)!.formatToParts(new Date());
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0';

    // tzName is "GMT+5:30", "GMT-3", "GMT+0", etc.
    // Reformat into "UTC+05:30" style for consistency.
    const match = tzName.match(/GMT([+-])(\d+)(?::(\d+))?/);
    if (!match) return 'UTC+00:00';

    const sign = match[1];
    const h = String(parseInt(match[2], 10)).padStart(2, '0');
    const m = String(parseInt(match[3] ?? '0', 10)).padStart(2, '0');
    return `UTC${sign}${h}:${m}`;
  } catch {
    return 'UTC+00:00';
  }
}

// ─── Daytime check ───────────────────────────────────────────────────────────
// Accepts an optional pre-computed snapshot to avoid a second Intl call.

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
