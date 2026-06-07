import { useState, useEffect, useRef } from 'react';
import { getTimeInTimezone, type TimeSnapshot } from '../utils/time';

// ─── useLiveClock ─────────────────────────────────────────────────────────────
// Drives a smooth millisecond clock via requestAnimationFrame.
//
// Key refinements vs. the original:
//  1. Only triggers a React re-render when the displayed string values actually
//     change — not on every single animation frame (~60fps would re-render
//     every component on every frame otherwise).
//  2. Resets and restarts the RAF loop cleanly when `timezone` changes so we
//     never get a stale closure reading the old timezone.
//  3. The RAF callback captures `timezone` via a ref so the closure never goes
//     stale between renders.

export function useLiveClock(timezone: string): TimeSnapshot {
  const [snapshot, setSnapshot] = useState<TimeSnapshot>(() => getTimeInTimezone(timezone));
  const rafRef = useRef<number>(0);
  const tzRef = useRef<string>(timezone);
  const prevKeyRef = useRef<string>('');

  // Keep tzRef in sync without restarting the loop unnecessarily
  useEffect(() => {
    tzRef.current = timezone;
  }, [timezone]);

  useEffect(() => {
    // Reset prev key so the first frame after a timezone change always fires
    prevKeyRef.current = '';

    const tick = () => {
      const next = getTimeInTimezone(tzRef.current);

      // Only re-render when seconds (or ms chunk) visibly change.
      // We compare HH:MM:SS — milliseconds update every frame so we
      // throttle them to every ~50ms (3 digits, last digit changes at 10ms
      // granularity on RAF). Comparing the first 2 ms digits is enough to
      // keep the display smooth without hammering React's reconciler.
      const key = `${next.hours}${next.minutes}${next.seconds}${next.ms.slice(0, 2)}`;

      if (key !== prevKeyRef.current) {
        prevKeyRef.current = key;
        setSnapshot(next);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [timezone]); // restart loop only when timezone actually changes

  return snapshot;
}

// ─── useStaticClock ───────────────────────────────────────────────────────────
// Lighter version for cards/lists that only need per-second updates.
// Much cheaper — uses setInterval instead of RAF, no milliseconds.

export function useStaticClock(timezone: string): TimeSnapshot {
  const [snapshot, setSnapshot] = useState<TimeSnapshot>(() => getTimeInTimezone(timezone));
  const tzRef = useRef<string>(timezone);

  useEffect(() => { tzRef.current = timezone; }, [timezone]);

  useEffect(() => {
    const id = setInterval(() => {
      setSnapshot(getTimeInTimezone(tzRef.current));
    }, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  return snapshot;
}
