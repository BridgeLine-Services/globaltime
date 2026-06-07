import { useState, useEffect, useRef } from 'react';
import { getTimeInTimezone, isDaytimeStable, type TimeSnapshot } from '../utils/time';

// ─── useLiveClock ─────────────────────────────────────────────────────────────
// High-frequency RAF clock for the main time display (millisecond precision).
//
// DST handling:
//   • Every snapshot now carries `offsetMinutes`. We watch it in a ref and
//     fire a "DST transition" event when it changes — no timer needed, just
//     a comparison on the value already computed during the normal tick.
//   • The `isDaytime` state uses hysteresis (isDaytimeStable) so the sun/moon
//     icon doesn't flicker during the ambiguous fall-back hour.
//   • The UTC offset string is derived fresh from each snapshot, so it updates
//     in the same render that the clock jumps — no stale badge.

export interface LiveClockResult extends TimeSnapshot {
  isDay: boolean;        // stable day/night flag (hysteresis applied)
  utcOffset: string;     // "UTC+05:30" — always live, reflects DST
  dstTransitioned: boolean; // true on the first tick after an offset change
}

function offsetToString(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs  = Math.abs(offsetMinutes);
  const h    = String(Math.floor(abs / 60)).padStart(2, '0');
  const m    = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${h}:${m}`;
}

export function useLiveClock(timezone: string): LiveClockResult {
  const [state, setState] = useState<LiveClockResult>(() => {
    const snap = getTimeInTimezone(timezone);
    return { ...snap, isDay: snap.hourNum >= 6 && snap.hourNum < 20, utcOffset: offsetToString(snap.offsetMinutes), dstTransitioned: false };
  });

  const tzRef            = useRef(timezone);
  const rafRef           = useRef(0);
  const prevKeyRef       = useRef('');
  const prevOffsetRef    = useRef(state.offsetMinutes);
  const isDayRef         = useRef(state.isDay);

  // Keep tzRef in sync; don't restart the RAF loop just because the ref updated.
  useEffect(() => { tzRef.current = timezone; }, [timezone]);

  useEffect(() => {
    // Reset state when timezone prop changes
    prevKeyRef.current    = '';
    prevOffsetRef.current = getTimeInTimezone(timezone).offsetMinutes;
    isDayRef.current      = getTimeInTimezone(timezone).hourNum >= 6 && getTimeInTimezone(timezone).hourNum < 20;

    const tick = () => {
      const snap = getTimeInTimezone(tzRef.current);

      // ── Render-skip: only update React state when visible values change ──
      // Compare HH:MM:SS + first 2 ms digits (~50ms visual granularity).
      const key = `${snap.hours}${snap.minutes}${snap.seconds}${snap.ms.slice(0, 2)}`;
      if (key === prevKeyRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      prevKeyRef.current = key;

      // ── DST transition detection ──────────────────────────────────────────
      // offsetMinutes is already computed inside getTimeInTimezone() at no
      // extra cost. If it changed since last tick, DST just flipped.
      const dstTransitioned = snap.offsetMinutes !== prevOffsetRef.current;
      if (dstTransitioned) {
        prevOffsetRef.current = snap.offsetMinutes;
        // Also reset the day/night ref so hysteresis starts fresh at new offset
        isDayRef.current = snap.hourNum >= 6 && snap.hourNum < 20;
      }

      // ── Stable day/night with hysteresis ─────────────────────────────────
      const newIsDay = isDaytimeStable(snap, isDayRef.current);
      isDayRef.current = newIsDay;

      setState({
        ...snap,
        isDay: newIsDay,
        utcOffset: offsetToString(snap.offsetMinutes),
        dstTransitioned,
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [timezone]);

  return state;
}

// ─── useStaticClock ───────────────────────────────────────────────────────────
// Lightweight per-second clock for country cards and lists (no milliseconds).
//
// DST handling:
//   • Uses a drift-corrected scheduler instead of bare setInterval(fn, 1000).
//     setInterval accumulates ~20ms/hr of drift and browsers clamp it to
//     ≥1000ms in background tabs — so after 10 minutes backgrounded the
//     displayed second can be noticeably stale.
//   • We snap to the next wall-clock second boundary using Date.now() % 1000
//     on every tick, so drift is bounded to ~1ms rather than accumulating.
//   • DST offset changes are detected the same way as useLiveClock: by
//     comparing offsetMinutes across consecutive snapshots.

export interface StaticClockResult extends TimeSnapshot {
  isDay: boolean;
  utcOffset: string;
  dstTransitioned: boolean;
}

export function useStaticClock(timezone: string): StaticClockResult {
  const [state, setState] = useState<StaticClockResult>(() => {
    const snap = getTimeInTimezone(timezone);
    return { ...snap, isDay: snap.hourNum >= 6 && snap.hourNum < 20, utcOffset: offsetToString(snap.offsetMinutes), dstTransitioned: false };
  });

  const tzRef         = useRef(timezone);
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOffsetRef = useRef(state.offsetMinutes);
  const isDayRef      = useRef(state.isDay);

  useEffect(() => { tzRef.current = timezone; }, [timezone]);

  useEffect(() => {
    // Reset on timezone change
    const initial = getTimeInTimezone(timezone);
    prevOffsetRef.current = initial.offsetMinutes;
    isDayRef.current      = initial.hourNum >= 6 && initial.hourNum < 20;

    // Drift-corrected scheduler: schedule each tick to fire at the next
    // exact wall-clock second boundary. Maximum drift = ~1ms per tick
    // (setTimeout scheduling jitter), never cumulative.
    const schedule = () => {
      const msUntilNextSecond = 1000 - (Date.now() % 1000);
      timerRef.current = setTimeout(() => {
        const snap = getTimeInTimezone(tzRef.current);

        const dstTransitioned = snap.offsetMinutes !== prevOffsetRef.current;
        if (dstTransitioned) {
          prevOffsetRef.current = snap.offsetMinutes;
          isDayRef.current = snap.hourNum >= 6 && snap.hourNum < 20;
        }

        const newIsDay = isDaytimeStable(snap, isDayRef.current);
        isDayRef.current = newIsDay;

        setState({
          ...snap,
          isDay: newIsDay,
          utcOffset: offsetToString(snap.offsetMinutes),
          dstTransitioned,
        });

        schedule(); // schedule the next tick from within this one
      }, msUntilNextSecond);
    };

    schedule();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timezone]);

  return state;
}
