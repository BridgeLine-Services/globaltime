import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { AdSlotComponent } from './AdSlot';
import { COUNTRIES } from '../data/countries';

export const Footer: React.FC = () => {
  const featured = COUNTRIES.slice(0, 12);
  return (
    <footer className="border-t border-white/10 bg-[#050510]/80 mt-16 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <AdSlotComponent position="footer" index={0} className="h-16 flex items-center" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <Globe size={14} className="text-white" />
              </div>
              <span className="text-white font-bold">GlobalTime</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Your complete time information resource. Live world clocks, time zone converter, meeting planner, and in-depth country time guides.
            </p>
          </div>
          <div>
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Tools</h3>
            <div className="space-y-2">
              {[['/', 'Home'], ['/world', 'World Clock'], ['/converter', 'Time Zone Converter'], ['/meeting-planner', 'Meeting Planner']].map(([to, label]) => (
                <Link key={to} to={to} className="block text-white/60 hover:text-cyan-400 text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Information</h3>
            <div className="space-y-2">
              {[['/guides', 'Time Zone Guides'], ['/blog', 'World Stories'], ['/faq', 'FAQ'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
                <Link key={to} to={to} className="block text-white/60 hover:text-cyan-400 text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Popular Countries</h3>
            <div className="space-y-1">
              {featured.slice(0, 6).map(c => (
                <Link key={c.slug} to={`/time/${c.slug}`} className="block text-white/60 hover:text-cyan-400 text-sm transition-colors">
                  {c.flag} {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Legal</h3>
            <div className="space-y-2">
              {[['/legal#privacy', 'Privacy Policy'], ['/legal#terms', 'Terms of Use'], ['/legal#advertising', 'Advertising'], ['/legal#donotsell', 'Do Not Sell My Info'], ['/legal#privacy-settings', 'Privacy Settings']].map(([to, label]) => (
                <Link key={to} to={to} className="block text-white/60 hover:text-cyan-400 text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-xs">© 2026 GlobalTime — Live world clocks, time zone tools, and country time guides</p>
        </div>
      </div>
    </footer>
  );
};
