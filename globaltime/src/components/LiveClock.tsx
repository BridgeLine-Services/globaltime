import React from 'react';
import { useLiveClock, useStaticClock } from '../hooks/useLiveClock';

interface LiveClockProps {
  timezone: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDate?: boolean;
  showMs?: boolean;    // default true for lg/xl, false for sm/md
  precise?: boolean;   // force RAF mode even at small sizes
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
  const wantsMs    = showMs ?? (size === 'lg' || size === 'xl');
  const usePrecise = precise || wantsMs;

  // Both hooks now return isDay + utcOffset + dstTransitioned — no extra
  // memoization or separate getUTCOffset() call needed anywhere.
  const rafState    = useLiveClock(timezone);
  const staticState = useStaticClock(timezone);
  const time        = usePrecise ? rafState : staticState;

  // isDay already has hysteresis baked in (computed inside the hook).
  // utcOffset is freshly derived from each snapshot — always correct after DST.
  const { isDay, utcOffset, dstTransitioned } = time;

  const sizeClasses: Record<string, string> = {
    sm: 'text-lg',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl md:text-8xl',
  };

  const msSizeClasses: Record<string, string> = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl md:text-4xl',
  };

  // Separator blinks on the actual seconds boundary (not CSS animation,
  // which would be unsynced to real time).
  const separatorOpacity = parseInt(time.seconds, 10) % 2 === 0 ? 1 : 0.35;

  return (
    <div className={`font-mono ${className}`}>
      <div className={`flex items-baseline gap-0.5 ${sizeClasses[size]} font-bold`}>

        {/* Hours */}
        <span className="text-cyan-400 tabular-nums">{time.hours}</span>

        {/* Separator */}
        <span
          className="text-white/60 transition-opacity duration-100"
          style={{ opacity: separatorOpacity }}
        >:</span>

        {/* Minutes */}
        <span className="text-white tabular-nums">{time.minutes}</span>

        <span
          className="text-white/60 transition-opacity duration-100"
          style={{ opacity: separatorOpacity }}
        >:</span>

        {/* Seconds */}
        <span className="text-white/80 tabular-nums">{time.seconds}</span>

        {/* Milliseconds — only when requested */}
        {wantsMs && (
          <span className={`text-purple-400 tabular-nums ${msSizeClasses[size]} ml-1`}>
            .{time.ms}
          </span>
        )}

        {/* AM/PM */}
        <span className="ml-2 text-white/40 text-sm font-sans font-normal">
          {time.isPM ? 'PM' : 'AM'}
        </span>
      </div>

      {showDate && (
        <div className="mt-1 space-y-0.5">
          <div className="text-white/60 text-sm">
            {time.dayOfWeek}, {time.date}
          </div>

          {/* UTC offset — updates in the same render as the clock jump,
              and briefly shows a DST badge when it just changed. */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-cyan-400/60">{utcOffset}</span>
            <span className="text-white/40">·</span>
            <span className="text-white/50">{isDay ? '☀️ Day' : '🌙 Night'}</span>
            {dstTransitioned && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs animate-pulse">
                DST
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
