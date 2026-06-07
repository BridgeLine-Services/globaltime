import { useState, useEffect, useRef } from 'react';
import { getTimeInTimezone } from '../utils/time';

export function useLiveClock(timezone: string) {
  const [time, setTime] = useState(() => getTimeInTimezone(timezone));
  const rafRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const update = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= 16) {
        setTime(getTimeInTimezone(timezone));
        lastUpdateRef.current = timestamp;
      }
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [timezone]);

  return time;
}
