import React from 'react';
import { Link } from 'react-router-dom';
import { Country } from '../data/countries';
import { LiveClock } from './LiveClock';
import { isDaytime } from '../utils/time';
import { ArrowRight } from 'lucide-react';

interface CountryCardProps {
  country: Country;
  compact?: boolean;
}

export const CountryCard: React.FC<CountryCardProps> = ({ country, compact = false }) => {
  const isDay = isDaytime(country.timezone);

  return (
    <Link
      to={`/time/${country.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-cyan-400/40 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,212,255,0.1)] block"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(179,71,234,0.05))' }} />
      
      <div className={`relative ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`${compact ? 'text-2xl' : 'text-3xl'}`}>{country.flag}</span>
            <div>
              <div className={`text-white font-semibold ${compact ? 'text-sm' : 'text-base'} leading-tight`}>{country.name}</div>
              <div className="text-white/40 text-xs">{country.capital}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs">{isDay ? '☀️' : '🌙'}</span>
            <ArrowRight size={14} className="text-white/20 group-hover:text-cyan-400 transition-colors" />
          </div>
        </div>
        
        <LiveClock timezone={country.timezone} size="sm" />
        
        <div className="mt-1.5 text-white/30 text-xs truncate">{country.timezone}</div>
      </div>
    </Link>
  );
};
