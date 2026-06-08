import React, { Suspense, lazy } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, MapPin, ArrowRight } from 'lucide-react';
import { useLiveClock } from '../hooks/useLiveClock';
import { getCountryBySlug, COUNTRIES } from '../data/countries';
import { LiveClock } from '../components/LiveClock';
import { CountryCard } from '../components/CountryCard';
import { AdSlotComponent } from '../components/AdSlot';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useSEO } from '../hooks/useSEO';
import { getUTCOffset } from '../utils/time';

const Globe3D = lazy(() => import('../components/Globe3D').then(m => ({ default: m.Globe3D })));

export const CountryPage: React.FC = () => {
  const { slug }    = useParams<{ slug: string }>();
  const country     = slug ? getCountryBySlug(slug) : null;
  const { recordPageView } = useAnalyticsStore();

  // Must be called unconditionally (hooks rule) — safe because we redirect below if no country
  const utcOffset = country ? getUTCOffset(country.timezone) : 'UTC+00:00';

  useSEO(country ? {
    title: `Current Time in ${country.name} — ${country.capital} Live Clock | WorldClock.live`,
    description: `What time is it in ${country.name} right now? See the live local time in ${country.capital} (${country.timezone}, ${utcOffset}). Updated every millisecond.`,
    canonical: `https://worldclock.live/time/${country.slug}`,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': `Current Time in ${country.name}`,
        'description': `Live local time in ${country.name} (${country.capital}). Timezone: ${country.timezone}. UTC offset: ${utcOffset}.`,
        'url': `https://worldclock.live/time/${country.slug}`,
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home',         'item': 'https://worldclock.live/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'World Clock',  'item': 'https://worldclock.live/world' },
            { '@type': 'ListItem', 'position': 3, 'name': country.name,   'item': `https://worldclock.live/time/${country.slug}` },
          ],
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Country',
        'name': country.name,
        'containsPlace': { '@type': 'City', 'name': country.capital },
      },
    ],
  } : {
    title: 'Country Not Found | WorldClock.live',
    description: 'This country page was not found.',
    canonical: 'https://worldclock.live/world',
    noindex: true,
  });

  // Analytics (safe to call after hooks)
  React.useEffect(() => {
    if (country) recordPageView(`/time/${country.slug}`);
  }, [country?.slug]);

  if (!country) return <Navigate to="/world" replace />;

  const { isDay } = useLiveClock(country.timezone);

  const related = COUNTRIES
    .filter(c => c.continent === country.continent && c.slug !== country.slug)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 ${isDay
          ? 'bg-gradient-to-br from-blue-900/30 via-[#0a0a1a] to-[#0a0a1a]'
          : 'bg-gradient-to-br from-indigo-950/30 via-[#0a0a1a] to-[#0a0a1a]'}`} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: isDay ? 'radial-gradient(#60a5fa, transparent)' : 'radial-gradient(#818cf8, transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb nav — also visible to Google */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li className="text-white/20">/</li>
              <li><Link to="/world" className="hover:text-white transition-colors">World Clock</Link></li>
              <li className="text-white/20">/</li>
              <li className="text-white/70">{country.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-7xl" role="img" aria-label={`${country.name} flag`}>{country.flag}</span>
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
                  <div className="text-cyan-400 font-mono text-sm font-bold">{utcOffset}</div>
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
        {/* SEO Content block */}
        <section className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-3">About Time in {country.name}</h2>
          <p className="text-white/50 leading-relaxed">
            {country.name} currently observes the <strong className="text-white">{country.timezone}</strong> timezone,
            which is <strong className="text-cyan-400">{utcOffset}</strong> from Coordinated Universal Time (UTC).
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
