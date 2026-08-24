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
import { getUTCOffset, getNumericOffsetMinutes, getTimeInTimezone } from '../utils/time';

const Globe3D = lazy(() => import('../components/Globe3D').then(m => ({ default: m.Globe3D })));

const CITY_MAP: Record<string, string[]> = {
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
  'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'],
  'India': ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata'],
  'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'],
  'United Kingdom': ['London', 'Manchester', 'Edinburgh', 'Birmingham'],
  'Germany': ['Berlin', 'Hamburg', 'Munich', 'Frankfurt'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
  'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'],
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Cancún'],
  'Russia': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg'],
  'Italy': ['Rome', 'Milan', 'Naples', 'Turin'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
};

const CITY_TIMEZONES: Record<string, string> = {
  'New York': 'America/New_York', 'Los Angeles': 'America/Los_Angeles', 'Chicago': 'America/Chicago', 'Houston': 'America/Chicago',
  'Toronto': 'America/Toronto', 'Vancouver': 'America/Vancouver', 'Montreal': 'America/Toronto', 'Calgary': 'America/Edmonton',
  'Sydney': 'Australia/Sydney', 'Melbourne': 'Australia/Melbourne', 'Brisbane': 'Australia/Brisbane', 'Perth': 'Australia/Perth',
  'São Paulo': 'America/Sao_Paulo', 'Rio de Janeiro': 'America/Sao_Paulo', 'Brasília': 'America/Sao_Paulo', 'Salvador': 'America/Bahia',
  'Beijing': 'Asia/Shanghai', 'Shanghai': 'Asia/Shanghai', 'Guangzhou': 'Asia/Shanghai', 'Shenzhen': 'Asia/Shanghai',
  'New Delhi': 'Asia/Kolkata', 'Mumbai': 'Asia/Kolkata', 'Bengaluru': 'Asia/Kolkata', 'Kolkata': 'Asia/Kolkata',
  'Tokyo': 'Asia/Tokyo', 'Osaka': 'Asia/Tokyo', 'Kyoto': 'Asia/Tokyo', 'Yokohama': 'Asia/Tokyo',
  'London': 'Europe/London', 'Manchester': 'Europe/London', 'Edinburgh': 'Europe/London', 'Birmingham': 'Europe/London',
  'Berlin': 'Europe/Berlin', 'Hamburg': 'Europe/Berlin', 'Munich': 'Europe/Berlin', 'Frankfurt': 'Europe/Berlin',
  'Paris': 'Europe/Paris', 'Lyon': 'Europe/Paris', 'Marseille': 'Europe/Paris', 'Toulouse': 'Europe/Paris',
  'Johannesburg': 'Africa/Johannesburg', 'Cape Town': 'Africa/Johannesburg', 'Durban': 'Africa/Johannesburg', 'Pretoria': 'Africa/Johannesburg',
  'Mexico City': 'America/Mexico_City', 'Guadalajara': 'America/Mexico_City', 'Monterrey': 'America/Monterrey', 'Cancún': 'America/Cancun',
  'Moscow': 'Europe/Moscow', 'Saint Petersburg': 'Europe/Moscow', 'Novosibirsk': 'Asia/Novosibirsk', 'Yekaterinburg': 'Asia/Yekaterinburg',
  'Rome': 'Europe/Rome', 'Milan': 'Europe/Rome', 'Naples': 'Europe/Rome', 'Turin': 'Europe/Rome',
  'Madrid': 'Europe/Madrid', 'Barcelona': 'Europe/Madrid', 'Valencia': 'Europe/Madrid', 'Seville': 'Europe/Madrid',
};

const COMPARISON_CITIES = [
  ['Los Angeles', 'America/Los_Angeles'], ['New York', 'America/New_York'], ['London', 'Europe/London'],
  ['Paris', 'Europe/Paris'], ['Tokyo', 'Asia/Tokyo'], ['Sydney', 'Australia/Sydney'],
] as const;

function formatDifference(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const mins = absolute % 60;
  return `${sign}${hours}${mins ? `h ${mins}m` : 'h'}`;
}

export const CountryPage: React.FC = () => {
  const { slug }    = useParams<{ slug: string }>();
  const country     = slug ? getCountryBySlug(slug) : null;
  const { recordPageView } = useAnalyticsStore();

  // Must be called unconditionally (hooks rule) — safe because we redirect below if no country
  const utcOffset = country ? getUTCOffset(country.timezone) : 'UTC+00:00';

  useSEO(country ? {
    title: `Current Time in ${country.name} — ${country.capital} Live Clock | World Clock`,
    description: `What time is it in ${country.name} right now? Live local time in ${country.capital} — timezone ${country.timezone} (${utcOffset}), currency, population, and country details.`,
    canonical: `https://globaltime-pi.vercel.app/time/${country.slug}`,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': `Current Time in ${country.name}`,
        'description': `Live local time in ${country.name} (${country.capital}). Timezone: ${country.timezone}. UTC offset: ${utcOffset}.`,
        'url': `https://globaltime-pi.vercel.app/time/${country.slug}`,
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home',         'item': 'https://globaltime-pi.vercel.app/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'World Clock',  'item': 'https://globaltime-pi.vercel.app/world' },
            { '@type': 'ListItem', 'position': 3, 'name': country.name,   'item': `https://globaltime-pi.vercel.app/time/${country.slug}` },
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
    title: 'Country Not Found | World Clock',
    description: 'This country page was not found.',
    canonical: 'https://globaltime-pi.vercel.app/world',
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
  const cityNames = CITY_MAP[country.name] ?? [country.capital];
  const cityTimes = cityNames.map(name => ({
    name,
    timezone: CITY_TIMEZONES[name] ?? country.timezone,
    time: getTimeInTimezone(CITY_TIMEZONES[name] ?? country.timezone),
  }));
  const countryOffset = getNumericOffsetMinutes(country.timezone);
  const comparisons = COMPARISON_CITIES.map(([name, timezone]) => ({
    name,
    difference: formatDifference(countryOffset - getNumericOffsetMinutes(timezone)),
  }));
  const regionDescription = country.continent === 'Europe'
    ? 'European countries commonly coordinate around Central, Western, or Eastern European time, with seasonal clock changes in many locations.'
    : country.continent === 'Asia'
      ? 'Asia spans a wide range of offsets, and many countries use one official time across a large area even when the sun reaches noon at different moments.'
      : country.continent === 'North America'
        ? 'North American timekeeping can vary across broad east–west distances, with regional rules and daylight-saving policies affecting the displayed offset.'
        : country.continent === 'Oceania'
          ? 'Oceania includes island nations and territories spread across several offsets, so nearby places may still have different local dates and times.'
          : country.continent === 'South America'
            ? 'South American time zones follow the continent’s longitudes, while seasonal clock policies can differ between neighboring countries.'
            : 'The local offset reflects this country’s adopted civil-time rules and its position relative to the UTC reference meridian.';

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
        {/* Country time guide */}
        <section className="mb-8 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-3">About Time in {country.name}</h2>
          <p className="text-white/60 leading-relaxed">
            {country.name} uses <strong className="text-white">{country.timezone}</strong> for the local time shown here.
            Its current offset is <strong className="text-cyan-400">{utcOffset}</strong> from Coordinated Universal Time (UTC),
            with {country.capital} used as the country reference city in this guide. {regionDescription}
          </p>
          <p className="text-white/60 leading-relaxed mt-3">
            The displayed offset is calculated from the project&apos;s live timezone data, so it reflects daylight-saving changes
            when the region observes them. {isDay ? 'It is currently daytime' : 'It is currently nighttime'} in {country.name}.
          </p>
        </section>

        <section className="mb-8 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-4">Major Cities and Their Current Times</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cityTimes.map(city => (
              <div key={city.name} className="p-4 rounded-xl border border-white/10 bg-black/10">
                <div className="text-white font-semibold">{city.name}</div>
                <div className="text-cyan-400 font-mono text-lg mt-2">{city.time.hours}:{city.time.minutes}:{city.time.seconds}</div>
                <div className="text-white/40 text-xs mt-1">{getUTCOffset(city.timezone)} · live local time</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-4">Time Difference From Major Cities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {comparisons.map(item => (
              <div key={item.name} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/10">
                <span className="text-white/70 text-sm">{item.name}</span>
                <span className="text-cyan-400 font-mono font-bold">{item.difference}</span>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs mt-3">Positive values mean {country.name} is ahead of the comparison city; values are live and can change with daylight-saving rules.</p>
        </section>

        <section className="mb-8 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-3">Planning a Call or Meeting</h2>
          <p className="text-white/60 leading-relaxed">
            Start with the live clock above, then compare the time in each participant&apos;s city before sending an invitation.
            For recurring meetings, check the difference again near daylight-saving transitions because one location may change its
            offset while another does not. A practical approach is to choose overlapping working hours, state the time zone in the
            invitation, and include the calendar date so a meeting near midnight cannot be misunderstood.
          </p>
        </section>

        <section className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-3">Country Time Zone Facts</h2>
          <ul className="list-disc pl-5 space-y-2 text-white/60 leading-relaxed">
            <li>{country.name}&apos;s project timezone identifier is <strong className="text-white">{country.timezone}</strong>.</li>
            <li>The live offset currently resolves to <strong className="text-cyan-400">{utcOffset}</strong>, including any seasonal rule active today.</li>
            <li>{country.name} is listed in the <strong className="text-white">{country.continent}</strong> region, where neighboring countries may use different civil-time rules.</li>
            <li>The country reference city in this dataset is <strong className="text-white">{country.capital}</strong>.</li>
          </ul>
        </section>

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

      </div>
    </div>
  );
};
