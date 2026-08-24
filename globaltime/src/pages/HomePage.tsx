import React, { Component, type ErrorInfo, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Zap, Gamepad2, TrendingUp, ArrowRight } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { LiveClock } from '../components/LiveClock';
import { CountryCard } from '../components/CountryCard';
import { AdSlotComponent } from '../components/AdSlot';
import { COUNTRIES } from '../data/countries';
import { useSEO } from '../hooks/useSEO';
import { type Country } from '../data/countries';

const Globe3D = lazy(() => import('../components/Globe3D').then(m => ({ default: m.Globe3D })));

class GlobeErrorBoundary extends Component<React.PropsWithChildren, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Interactive globe unavailable:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center rounded-3xl border border-cyan-400/20 bg-[#0d0d2b]/80 p-8 text-center">
          <div className="max-w-sm">
            <Globe size={48} className="mx-auto mb-4 text-cyan-400/60" aria-hidden="true" />
            <h2 className="text-xl font-bold text-white">World clock, without the globe</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              The interactive globe is not available in this browser, but the live local-time clocks and country search are ready to use.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const FEATURED_COUNTRIES = ['united-states', 'japan', 'united-kingdom', 'germany', 'australia', 'india', 'brazil', 'singapore'];

export const HomePage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  useSEO({
    title: 'World Clock — Live Time in Every Country on Earth',
    description: "It's always the right time somewhere. Find the exact local time in 195 countries instantly — interactive 3D globe, timezone converter, and live clocks that never miss a beat.",
    canonical: 'https://globaltime-pi.vercel.app/',
  });

  const featured = COUNTRIES.filter(c => FEATURED_COUNTRIES.includes(c.slug));

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-4">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(0,212,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(179,71,234,0.06),transparent_50%)]" />

        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#00d4ff22 1px, transparent 1px), linear-gradient(90deg, #00d4ff22 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center py-16">
          {/* Left: Text + Search */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-medium mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              LIVE — Live local time
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              Every country.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Every timezone.
              </span>
              <br />
              <span className="text-white/80">Right now.</span>
            </h1>

            <p className="text-white/50 text-lg mb-8 leading-relaxed max-w-xl">
              A clear way to check live local time around the world, with an interactive 3D globe, country search, and clocks for 150+ countries.
            </p>

            <SearchBar onSelect={setSelectedCountry} />

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/world" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 font-medium hover:bg-cyan-400/30 transition-all text-sm">
                <Globe size={16} /> World Clock <ArrowRight size={14} />
              </Link>
              <Link to="/games" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-400/20 border border-purple-400/40 text-purple-400 font-medium hover:bg-purple-400/30 transition-all text-sm">
                <Gamepad2 size={16} /> Play Games <ArrowRight size={14} />
              </Link>
            </div>

            {/* Live local clock */}
            <div className="mt-10 p-4 rounded-2xl border border-white/10 bg-white/5 inline-block">
              <div className="text-white/40 text-xs mb-1">YOUR LOCAL TIME</div>
              <LiveClock timezone={Intl.DateTimeFormat().resolvedOptions().timeZone} size="md" showDate />
            </div>
          </motion.div>

          {/* Right: 3D Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative h-[500px] lg:h-[600px]"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <GlobeErrorBoundary>
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center rounded-3xl border border-cyan-400/20 bg-[#0d0d2b]/60" aria-label="Loading interactive globe">
                    <div className="w-48 h-48 rounded-full border border-cyan-400/30 animate-spin-slow flex items-center justify-center">
                      <Globe size={48} className="text-cyan-400/50 animate-pulse" aria-hidden="true" />
                    </div>
                  </div>
                }>
                  <Globe3D
                    countries={COUNTRIES}
                    selectedCountry={selectedCountry}
                    onCountrySelect={setSelectedCountry}
                  />
                </Suspense>
              </GlobeErrorBoundary>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section id="understanding-world-time" className="mx-auto max-w-4xl border-y border-white/10 py-16" aria-labelledby="understanding-world-time-title">
          <h2 id="understanding-world-time-title" className="text-3xl font-bold text-white md:text-4xl">Understanding World Time</h2>
          <div className="mt-6 space-y-5 text-base leading-7 text-white/65">
            <p>A time zone is a geographic region that observes the same standard time. The idea makes it possible for clocks to follow the position of the sun while also giving communities a shared schedule for work, school, transport, and daily life. Time zones are often described as an offset from Coordinated Universal Time, but their real boundaries follow national borders, coastlines, and local decisions rather than perfectly straight lines.</p>
            <p>UTC, or Coordinated Universal Time, is the international reference used to coordinate clocks around the world. It is based on highly stable atomic time and is kept aligned with Earth&apos;s rotation. You can think of UTC as the starting point for every offset: a location at UTC+1 is one hour ahead of UTC, while UTC−5 is five hours behind. UTC does not belong to one country, and it does not change for daylight saving time. Local clocks may move seasonally, but UTC remains the common reference underneath.</p>
            <p>Countries use different time zones because the Earth rotates and different longitudes face the sun at different moments. Historically, towns set time by local solar noon, which became impractical once railways, telegraphs, aviation, and international trade connected distant places. Standardized zones made timetables and communication manageable. Governments then adapted those zones to practical and political needs, so one country may choose to share a clock with a neighboring region even when its geography suggests another offset.</p>
            <p>Daylight saving time is a seasonal clock change used in some places to extend evening daylight during part of the year. A region typically moves clocks forward by one hour in spring and returns to standard time in autumn. It is not observed everywhere, and the dates can differ between countries. Some areas have stopped using it, while others change their rules regularly. That is why a meeting time that works in January may shift relative to another city in July, even when neither location has moved.</p>
            <p>Some countries and territories use unusual UTC offsets, including half-hour and quarter-hour differences. These offsets can reflect historical administration, regional identity, or a desire to align working hours with nearby economies and daylight patterns. India uses UTC+5:30, Nepal uses UTC+5:45, and parts of Australia use offsets that include a half hour. International date line decisions also create surprising cases: two places can be geographically close while showing different calendar days.</p>
            <p>WorldClock.live helps turn those rules into an easy comparison. Search for a country to see its current local time, compare several destinations before arranging a call, and use the globe as a visual way to understand where day and night are falling. The live clocks keep the information practical while time-zone rules, seasonal changes, and unusual offsets stay in the background. Whether you are coordinating across offices, checking in with family, or planning a trip, a clear world clock gives you a shared point of reference.</p>
          </div>
        </section>

        <section id="how-to-use-worldclock" className="mx-auto max-w-4xl py-16" aria-labelledby="how-to-use-worldclock-title">
          <h2 id="how-to-use-worldclock-title" className="text-3xl font-bold text-white md:text-4xl">How to Use WorldClock.live</h2>
          <div className="mt-6 space-y-5 text-base leading-7 text-white/65">
            <p>Start with the country search in the main clock area. Enter a country name and select a result to focus on its live local time. You can use the world clock page to browse more destinations and compare places across continents without doing UTC-offset math yourself.</p>
            <p>For international meetings, check each participant&apos;s location before sending an invitation. Look for reasonable working hours, account for daylight saving changes, and share the selected locations so everyone understands the reference. For travel, use the country pages to check the destination clock before departure and after arrival, helping you plan calls, transfers, and sleep around the local day.</p>
          </div>
        </section>

        {/* Header Ad 2 */}
        <AdSlotComponent position="header" index={1} className="mb-10" />

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { icon: <Globe size={20} />, value: '150+', label: 'Countries' },
            { icon: <Zap size={20} />, value: 'Live', label: 'Local Time' },
            { icon: <TrendingUp size={20} />, value: '24/7', label: 'Live Data' },
            { icon: <Gamepad2 size={20} />, value: '5', label: 'Mini Games' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
              <div className="text-cyan-400 flex justify-center mb-2">{stat.icon}</div>
              <div className="text-white font-bold text-2xl">{stat.value}</div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Featured Countries */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-2xl">🌟 Featured Countries</h2>
            <Link to="/world" className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {featured.map(country => (
              <CountryCard key={country.slug} country={country} />
            ))}
          </div>
        </section>

        {/* Games Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold text-2xl">🎮 Bored? Play a Game!</h2>
              <p className="text-white/40 text-sm mt-1">Quick, addictive mini games while you travel the world clock</p>
            </div>
            <Link to="/games" className="text-purple-400 text-sm hover:text-purple-300 flex items-center gap-1">
              All games <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { slug: 'reaction', emoji: '⚡', name: 'Reaction Test', desc: 'How fast are your reflexes?', color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30' },
              { slug: 'memory', emoji: '🧠', name: 'Memory Flip', desc: 'Match the cards, beat the clock', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
              { slug: 'clicker', emoji: '👆', name: 'Click Speed', desc: 'How many clicks per second?', color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
              { slug: 'puzzle', emoji: '🧩', name: 'Number Puzzle', desc: 'Slide and solve the board', color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
              { slug: 'runner', emoji: '🏃', name: 'Endless Runner', desc: 'Jump obstacles, go forever', color: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/30' },
            ].map(game => (
              <Link
                key={game.slug}
                to={`/games/${game.slug}`}
                className={`group p-5 rounded-2xl border ${game.border} bg-gradient-to-br ${game.color} hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="text-4xl mb-3">{game.emoji}</div>
                <div className="text-white font-bold text-lg">{game.name}</div>
                <div className="text-white/50 text-sm mt-1">{game.desc}</div>
                <div className="mt-4 flex items-center gap-1 text-white/40 text-xs group-hover:text-white/60 transition-colors">
                  Play now <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All Countries Quick Grid */}
        <section className="mb-16">
          <h2 className="text-white font-bold text-2xl mb-6">🌍 Explore All Countries</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {COUNTRIES.slice(0, 50).map(c => (
              <Link
                key={c.slug}
                to={`/time/${c.slug}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/30 transition-all text-sm group"
              >
                <span>{c.flag}</span>
                <span className="text-white/70 group-hover:text-white transition-colors truncate">{c.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/world" className="text-cyan-400 text-sm hover:text-cyan-300">
              + {COUNTRIES.length - 50} more countries →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
