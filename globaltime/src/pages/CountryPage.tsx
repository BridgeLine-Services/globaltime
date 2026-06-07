import React, { useEffect, Suspense, lazy } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, MapPin, ArrowRight } from 'lucide-react';
import { useLiveClock } from '../hooks/useLiveClock';
import { getCountryBySlug, COUNTRIES } from '../data/countries';
import { LiveClock } from '../components/LiveClock';
import { CountryCard } from '../components/CountryCard';
import { AdSlotComponent } from '../components/AdSlot';

import { useAnalyticsStore } from '../stores/analyticsStore';

const Globe3D = lazy(() => import('../components/Globe3D').then(m => ({ default: m.Globe3D })));

export const CountryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const country = slug ? getCountryBySlug(slug) : null;
  const { recordPageView } = useAnalyticsStore();

  useEffect(() => {
    if (country) {
      recordPageView(`/time/${country.slug}`);
      document.title = `${country.name} Time — WorldClock.live | Current Time in ${country.capital}`;
    }
  }, [country]);

  if (!country) return <Navigate to="/world" replace />;

  const { isDay, utcOffset: offset } = useLiveClock(country.timezone);




  const related = COUNTRIES
    .filter(c => c.continent === country.continent && c.slug !== country.slug)
    .slice(0, 8);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Current Time in ${country.name}`,
    "description": `See the exact current local time in ${country.name} (${country.capital}). Timezone: ${country.timezone}. Live, down to the millisecond.`,
    "url": `https://worldclock.live/time/${country.slug}`,
    "about": { "@type": "Country", "name": country.name }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 ${isDay
          ? 'bg-gradient-to-br from-blue-900/30 via-[#0a0a1a] to-[#0a0a1a]'
          : 'bg-gradient-to-br from-indigo-950/30 via-[#0a0a1a] to-[#0a0a1a]'}`} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: isDay ? 'radial-gradient(#60a5fa, transparent)' : 'radial-gradient(#818cf8, transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/world" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to World Clock
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-7xl">{country.flag}</span>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white">{country.name}</h1>
                  <div className="flex items-center gap-2 mt-2 text-white/50">
                    <MapPin size={14} /> {country.capital}
                    <span className="text-white/20">·</span>
                    <Globe size={14} /> {country.continent}
                  </div>
                </div>
              </div>

              <AdSlotComponent position="header" index={0} className="mb-6" />

              <div className="p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
                <div className="text-white/40 text-sm mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  LIVE · {isDay ? '☀️ Daytime' : '🌙 Nighttime'} in {country.name}
                </div>
                <LiveClock timezone={country.timezone} size="xl" showDate />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-white/40 text-xs mb-1">TIMEZONE</div>
                  <div className="text-white font-mono text-sm">{country.timezone}</div>
                </div>
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-white/40 text-xs mb-1">UTC OFFSET</div>
                  <div className="text-cyan-400 font-mono text-sm font-bold">{offset}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="h-80 rounded-3xl overflow-hidden border border-white/10"
            >
              <Suspense fallback={<div className="w-full h-full bg-white/5 animate-pulse rounded-3xl" />}>
                <Globe3D countries={COUNTRIES} selectedCountry={country} />
              </Suspense>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* SEO Content */}
        <section className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-3">About Time in {country.name}</h2>
          <p className="text-white/50 leading-relaxed">
            {country.name} currently observes <strong className="text-white">{country.timezone}</strong> timezone,
            which is <strong className="text-cyan-400">{offset}</strong> from Coordinated Universal Time (UTC).
            The capital city, <strong className="text-white">{country.capital}</strong>, serves as the reference point
            for official local time. {isDay ? 'It is currently daytime' : 'It is currently nighttime'} in {country.name}.
          </p>
          <p className="text-white/50 leading-relaxed mt-3">
            Use WorldClock.live to track the exact current time in {country.name} with millisecond precision.
            Our live clocks update 60 times per second using your device's high-resolution timer for maximum accuracy.
          </p>
        </section>

        <AdSlotComponent position="mid-page" index={0} className="mb-8" />

        {/* Related Countries */}
        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-xl">More from {country.continent}</h2>
              <Link to="/world" className="text-cyan-400 text-sm flex items-center gap-1 hover:text-cyan-300">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {related.map(c => <CountryCard key={c.slug} country={c} compact />)}
            </div>
          </section>
        )}

        <AdSlotComponent position="mid-page" index={1} className="mt-8" />
      </div>
    </div>
  );
};
