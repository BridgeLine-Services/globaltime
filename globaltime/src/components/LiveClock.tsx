import React from 'react';
import { useLiveClock } from '../hooks/useLiveClock';
import { getUTCOffset, isDaytime } from '../utils/time';

interface LiveClockProps {
  timezone: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDate?: boolean;
  className?: string;
}

export const LiveClock: React.FC<LiveClockProps> = ({ timezone, size = 'md', showDate = false, className = '' }) => {
  const time = useLiveClock(timezone);
  const offset = getUTCOffset(timezone);
  const isDay = isDaytime(timezone);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl md:text-8xl',
  };

  const msSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl md:text-4xl',
  };

  return (
    <div className={`font-mono ${className}`}>
      <div className={`flex items-baseline gap-0.5 ${sizeClasses[size]} font-bold`}>
        <span className="text-cyan-400">{time.hours}</span>
        <span className="text-white/60 animate-pulse">:</span>
        <span className="text-white">{time.minutes}</span>
        <span className="text-white/60 animate-pulse">:</span>
        <span className="text-white/80">{time.seconds}</span>
        <span className={`text-purple-400 ${msSizeClasses[size]} ml-1`}>.{time.ms}</span>
        <span className={`ml-2 text-white/40 text-sm font-sans font-normal`}>
          {time.isPM ? 'PM' : 'AM'}
        </span>
      </div>
      {showDate && (
        <div className="mt-1">
          <div className="text-white/60 text-sm">{time.dayOfWeek}, {time.date}</div>
          <div className="text-cyan-400/60 text-xs mt-0.5">{offset} · {isDay ? '☀️ Day' : '🌙 Night'}</div>
        </div>
      )}
    </div>
  );
};
