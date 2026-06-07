import React, { useMemo } from 'react';
import { useLiveClock, useStaticClock } from '../hooks/useLiveClock';
import { getUTCOffset, isDaytime } from '../utils/time';

interface LiveClockProps {
  timezone: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDate?: boolean;
  showMs?: boolean;      // default true for lg/xl, false for sm/md
  precise?: boolean;     // force RAF mode even at small sizes
  className?: string;
}

export const LiveClock: React.FC<LiveClockProps> = ({
  timezone,
  size = 'md',
  showDate = false,
  showMs,
  precise = false,
  className = '',
}) => {
  // Use high-freq RAF clock only when the ms display is actually visible,
  // otherwise a 1s interval is enough and is far cheaper when many clocks
  // are on screen at once (World Clock page).
  const wantsMs = showMs ?? (size === 'lg' || size === 'xl');
  const usePrecise = precise || wantsMs;

  const rafTime = useLiveClock(timezone);
  const staticTime = useStaticClock(timezone);
  const time = usePrecise ? rafTime : staticTime;

  // UTC offset doesn't change during a session (DST aside), so memoize it.
  const offset = useMemo(() => getUTCOffset(timezone), [timezone]);
  const isDay = isDaytime(timezone, time); // reuse snapshot — no extra Intl call

  const sizeClasses = {
    sm:  'text-lg',
    md:  'text-3xl',
    lg:  'text-5xl',
    xl:  'text-7xl md:text-8xl',
  } as const;

  const msSizeClasses = {
    sm:  'text-sm',
    md:  'text-xl',
    lg:  'text-2xl',
    xl:  'text-3xl md:text-4xl',
  } as const;

  return (
    <div className={`font-mono ${className}`}>
      <div className={`flex items-baseline gap-0.5 ${sizeClasses[size]} font-bold`}>
        {/* Hours */}
        <span className="text-cyan-400">{time.hours}</span>

        {/* Separator — blinks on the seconds boundary */}
        <span
          className="text-white/60 transition-opacity duration-100"
          style={{ opacity: parseInt(time.seconds, 10) % 2 === 0 ? 1 : 0.35 }}
        >
          :
        </span>

        {/* Minutes */}
        <span className="text-white">{time.minutes}</span>

        <span
          className="text-white/60 transition-opacity duration-100"
          style={{ opacity: parseInt(time.seconds, 10) % 2 === 0 ? 1 : 0.35 }}
        >
          :
        </span>

        {/* Seconds */}
        <span className="text-white/80">{time.seconds}</span>

        {/* Milliseconds — only rendered when requested */}
        {wantsMs && (
          <span className={`text-purple-400 ${msSizeClasses[size]} ml-1 tabular-nums`}>
            .{time.ms}
          </span>
        )}

        {/* AM/PM badge */}
        <span className="ml-2 text-white/40 text-sm font-sans font-normal">
          {time.isPM ? 'PM' : 'AM'}
        </span>
      </div>

      {showDate && (
        <div className="mt-1 space-y-0.5">
          <div className="text-white/60 text-sm">
            {time.dayOfWeek}, {time.date}
          </div>
          <div className="text-cyan-400/60 text-xs">
            {offset} · {isDay ? '☀️ Day' : '🌙 Night'}
          </div>
        </div>
      )}
    </div>
  );
};
