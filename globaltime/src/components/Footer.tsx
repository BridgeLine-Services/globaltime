import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { AdSlotComponent } from './AdSlot';
import { COUNTRIES } from '../data/countries';

export const Footer: React.FC = () => {
  const featured = COUNTRIES.slice(0, 20);
  return (
    <footer className="border-t border-white/10 bg-[#050510]/80 mt-16 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <AdSlotComponent position="footer" index={0} className="h-16 flex items-center" />
          <AdSlotComponent position="footer" index={1} className="h-16 flex items-center" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <Globe size={14} className="text-white" />
              </div>
              <span className="text-white font-bold">WorldClock.live</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Real-time world clocks with millisecond precision. Every country on Earth, live.
            </p>
          </div>
          <div>
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Explore</h3>
            <div className="space-y-2">
              {[['/', 'Home'], ['/world', 'World Clock'], ['/games', 'Mini Games'], ['/blog', 'Blog'], ['/weather', 'World Weather'], ['/on-this-day', 'On This Day'], ['/faq', 'FAQ']].map(([to, label]) => (
                <Link key={to} to={to} className="block text-white/60 hover:text-cyan-400 text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Popular Countries</h3>
            <div className="space-y-1">
              {featured.slice(0, 8).map(c => (
                <Link key={c.slug} to={`/time/${c.slug}`} className="block text-white/60 hover:text-cyan-400 text-sm transition-colors">
                  {c.flag} {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">More Countries</h3>
            <div className="space-y-1">
              {featured.slice(8, 16).map(c => (
                <Link key={c.slug} to={`/time/${c.slug}`} className="block text-white/60 hover:text-cyan-400 text-sm transition-colors">
                  {c.flag} {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-xs">© 2026 World Clock — Real-time global time for every country</p>
          <div className="flex flex-wrap items-center gap-4">
            {[['/legal#privacy', 'Privacy Policy'], ['/legal#terms', 'Terms'], ['/legal#advertising', 'Advertising'], ['/legal#donotsell', 'Do Not Sell My Info'], ['/legal#privacy-settings', 'Privacy Settings']].map(([to, label]) => (
              <Link key={to} to={to} className="text-white/50 hover:text-white/70 text-xs transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
