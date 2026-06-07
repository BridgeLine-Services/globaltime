export function getTimeInTimezone(timezone: string): {
  hours: string;
  minutes: string;
  seconds: string;
  ms: string;
  full: string;
  date: string;
  dayOfWeek: string;
  timestamp: number;
  isPM: boolean;
  hours12: string;
} {
  const now = new Date();
  
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).formatToParts(now);

  const get = (type: string) => parts.find(p => p.type === type)?.value || '00';
  const getDate = (type: string) => dateParts.find(p => p.type === type)?.value || '';

  const hours = get('hour');
  const minutes = get('minute');
  const seconds = get('second');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  const hoursNum = parseInt(hours, 10);
  const isPM = hoursNum >= 12;
  const hours12 = String(hoursNum === 0 ? 12 : hoursNum > 12 ? hoursNum - 12 : hoursNum).padStart(2, '0');

  return {
    hours,
    minutes,
    seconds,
    ms,
    full: `${hours}:${minutes}:${seconds}.${ms}`,
    date: `${getDate('month')} ${getDate('day')}, ${getDate('year')}`,
    dayOfWeek: getDate('weekday'),
    timestamp: now.getTime(),
    isPM,
    hours12,
  };
}

export function getUTCOffset(timezone: string): string {
  try {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const diff = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    const sign = diff >= 0 ? '+' : '-';
    const absDiff = Math.abs(diff);
    const hours = Math.floor(absDiff);
    const mins = Math.round((absDiff - hours) * 60);
    return `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  } catch {
    return 'UTC+00:00';
  }
}

export function isDaytime(timezone: string): boolean {
  try {
    const t = getTimeInTimezone(timezone);
    const hour = parseInt(t.hours, 10);
    return hour >= 6 && hour < 20;
  } catch {
    return true;
  }
}
