import React, { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Zap, TrendingUp, ArrowRight, Clock, ArrowLeftRight, Users, BookOpen, Database } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { LiveClock } from '../components/LiveClock';
import { CountryCard } from '../components/CountryCard';
import { AdSlotComponent } from '../components/AdSlot';
import { COUNTRIES } from '../data/countries';
import { useSEO } from '../hooks/useSEO';
import { type Country } from '../data/countries';

const Globe3D = lazy(() => import('../components/Globe3D').then(m => ({ default: m.Globe3D })));

const FEATURED_COUNTRIES = ['united-states', 'japan', 'united-kingdom', 'germany', 'australia', 'india', 'brazil', 'singapore'];

export const HomePage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  useSEO({
    title: 'GlobalTime — Live World Clock, Time Zone Converter & Country Time Guides',
    description: "GlobalTime is your complete time information resource. Live world clocks for 140+ countries, time zone converter, meeting planner, DST information, and in-depth country time guides.",
    canonical: 'https://globaltime-pi.vercel.app/',
  });

  const featured = COUNTRIES.filter(c => FEATURED_COUNTRIES.includes(c.slug));

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header Ad */}
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-2" />
      </div>

      {/* Hero Section — Current World Time */}
      <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(0,212,255,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(179,71,234,0.06),transparent_50%)]" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#00d4ff22 1px, transparent 1px), linear-gradient(90deg, #00d4ff22 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center py-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-medium mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              LIVE — Continuously updated
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              World Clock:
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Current Time
              </span>
              <br />
              <span className="text-white/80">Around the World</span>
            </h1>

            <h2 className="sr-only">Current World Time</h2>

            <p className="text-white/50 text-lg mb-8 leading-relaxed max-w-xl">
              GlobalTime is more than a world clock — it's your complete time information resource. Live clocks, time zone converter, meeting planner, DST information, and country time guides, all in one place.
            </p>

            <SearchBar onSelect={setSelectedCountry} />

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/world" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 font-medium hover:bg-cyan-400/30 transition-all text-sm">
                <Globe size={16} /> Browse the World Clock <ArrowRight size={14} />
              </Link>
              <Link to="/converter" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-400/20 border border-purple-400/40 text-purple-400 font-medium hover:bg-purple-400/30 transition-all text-sm">
                <ArrowLeftRight size={16} /> Convert time between zones <ArrowRight size={14} />
              </Link>
              <Link to="/meeting-planner" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-400/20 border border-green-400/40 text-green-400 font-medium hover:bg-green-400/30 transition-all text-sm">
                <Users size={16} /> Plan a multi-timezone meeting <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-10 p-4 rounded-2xl border border-white/10 bg-white/5 inline-block">
              <div className="text-white/40 text-xs mb-1">YOUR LOCAL TIME</div>
              <LiveClock timezone={Intl.DateTimeFormat().resolvedOptions().timeZone} size="md" showDate />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative h-[500px] lg:h-[600px]"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border border-cyan-400/30 animate-spin-slow flex items-center justify-center">
                    <Globe size={48} className="text-cyan-400/50 animate-pulse" />
                  </div>
                </div>
              }>
                <Globe3D
                  countries={COUNTRIES}
                  selectedCountry={selectedCountry}
                  onCountrySelect={setSelectedCountry}
                />
              </Suspense>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlotComponent position="header" index={1} className="mb-10" />

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { icon: <Globe size={20} />, value: '140+', label: 'Countries' },
            { icon: <Zap size={20} />, value: 'Live', label: 'Updates' },
            { icon: <TrendingUp size={20} />, value: '24/7', label: 'Live Data' },
            { icon: <BookOpen size={20} />, value: '12+', label: 'Guides' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
              <div className="text-cyan-400 flex justify-center mb-2">{stat.icon}</div>
              <div className="text-white font-bold text-2xl">{stat.value}</div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Explore Time Around the World */}
        <section className="mb-16">
          <h2 className="text-white font-bold text-2xl mb-6">Explore Time Around the World</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-3xl mb-6">
            GlobalTime turns the world's clocks into a comprehensive time information platform. Whether you need to check the current time in Tokyo, convert 3 PM from Los Angeles to London, or plan a meeting across four continents, our tools are designed to give you accurate, useful answers.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Link to="/world" className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all">
              <Clock size={20} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-medium text-sm mb-1">World Clock</h3>
              <p className="text-white/50 text-xs">Live clocks for 140+ countries and territories, searchable by continent.</p>
            </Link>
            <Link to="/converter" className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all">
              <ArrowLeftRight size={20} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-medium text-sm mb-1">Time Zone Converter</h3>
              <p className="text-white/50 text-xs">Convert any time between two time zones with automatic daylight saving time handling.</p>
            </Link>
            <Link to="/meeting-planner" className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all">
              <Users size={20} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-medium text-sm mb-1">Meeting Planner</h3>
              <p className="text-white/50 text-xs">Find the best meeting time across multiple cities and time zones, with working-hours ratings.</p>
            </Link>
            <Link to="/guides" className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all">
              <BookOpen size={20} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-medium text-sm mb-1">Time Zone Guides</h3>
              <p className="text-white/50 text-xs">In-depth articles explaining UTC, GMT, daylight saving time, the international date line, and more.</p>
            </Link>
            <Link to="/world" className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all">
              <Globe size={20} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-medium text-sm mb-1">Country Time Guides</h3>
              <p className="text-white/50 text-xs">Detailed time information for 140+ countries — timezones, DST status, major cities, and comparisons.</p>
            </Link>
            <Link to="/about" className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all">
              <Database size={20} className="text-cyan-400 mb-3" />
              <h3 className="text-white font-medium text-sm mb-1">How It Works</h3>
              <p className="text-white/50 text-xs">Learn about the IANA Time Zone Database, how UTC offsets are calculated, and how our clocks stay accurate.</p>
            </Link>
          </div>
        </section>

        {/* Understanding World Time */}
        <section className="mb-16 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-2xl mb-4">Understanding World Time</h2>
          <div className="space-y-3 text-white/60 text-sm leading-relaxed max-w-3xl">
            <p>
              Every clock on GlobalTime is powered by the <strong className="text-white">IANA Time Zone Database</strong> — the same database used by operating systems, programming languages, and servers worldwide. When you look up a country, we use its IANA timezone identifier (like "America/New_York" or "Asia/Tokyo") to calculate the exact current time.
            </p>
            <p>
              UTC offsets are calculated live using JavaScript's <strong className="text-white">Intl API</strong>, which means our offsets automatically update the moment daylight saving time transitions occur. There's no manual updating — when a government changes a time-zone rule, the IANA database is updated, and our clocks reflect that change.
            </p>
            <p>
              Our clocks update 60 times per second using the browser's <strong className="text-white">requestAnimationFrame</strong> API, synchronized to your device's system clock for continuous, accurate updates. We also use hysteresis to prevent flickering during DST "fall-back" transitions, when the same wall-clock hour occurs twice.
            </p>
            <p>
              For a deeper dive, read our guides on <Link to="/guides/what-is-utc" className="text-cyan-400 hover:underline">what UTC is</Link>, <Link to="/guides/utc-vs-gmt" className="text-cyan-400 hover:underline">the difference between UTC and GMT</Link>, and <Link to="/guides/how-daylight-saving-time-works" className="text-cyan-400 hover:underline">how daylight saving time works</Link>.
            </p>
          </div>
        </section>

        <AdSlotComponent position="mid-page" index={0} className="mb-6" />

        {/* How to Use GlobalTime */}
        <section className="mb-16 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-2xl mb-4">How to Use GlobalTime</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-3xl mb-6">
            GlobalTime is built for travelers, remote workers, international teams, students, developers, and businesses. Here's how to get the most out of it.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">✈️</div>
              <h3 className="text-white font-medium text-sm mb-1">Travelers</h3>
              <p className="text-white/50 text-xs">Search for your destination country to see the current local time, DST status, and timezone details before you fly.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">💼</div>
              <h3 className="text-white font-medium text-sm mb-1">Remote Workers</h3>
              <p className="text-white/50 text-xs">Use the <Link to="/converter" className="text-cyan-400 hover:underline">Time Zone Converter</Link> to find the right meeting time between two cities.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">🌍</div>
              <h3 className="text-white font-medium text-sm mb-1">International Teams</h3>
              <p className="text-white/50 text-xs">Plan multi-city meetings with the <Link to="/meeting-planner" className="text-cyan-400 hover:underline">Meeting Planner</Link> and track DST changes affecting your team.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">📚</div>
              <h3 className="text-white font-medium text-sm mb-1">Students</h3>
              <p className="text-white/50 text-xs">Learn how time zones work with our <Link to="/guides" className="text-cyan-400 hover:underline">educational guides</Link> on UTC, GMT, and daylight saving time.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">💻</div>
              <h3 className="text-white font-medium text-sm mb-1">Developers</h3>
              <p className="text-white/50 text-xs">Reference IANA timezone identifiers and verify DST behavior for different regions on the <Link to="/world" className="text-cyan-400 hover:underline">World Clock</Link>.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">🏢</div>
              <h3 className="text-white font-medium text-sm mb-1">Businesses</h3>
              <p className="text-white/50 text-xs">Plan international calls and understand working hours in different markets using country time guides.</p>
            </div>
          </div>
        </section>

        {/* Popular Countries and Time Zones */}
        <section className="mb-16">
          <h2 className="text-white font-bold text-2xl mb-6">Popular Countries and Time Zones</h2>

          {/* Featured Countries */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/70 font-medium text-lg">Popular Country Time Pages</h3>
            <Link to="/world" className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1">
              View all countries <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
            {featured.map(country => (
              <CountryCard key={country.slug} country={country} />
            ))}
          </div>

          {/* Time Zone Guides preview */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/70 font-medium text-lg">Time Zone Guides</h3>
            <Link to="/guides" className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1">
              All guides <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { slug: 'what-is-utc', emoji: '🕐', title: 'What Is UTC?', desc: 'Understanding Coordinated Universal Time and why it matters.' },
              { slug: 'utc-vs-gmt', emoji: '🌍', title: 'UTC vs GMT', desc: 'What\u2019s the difference, and why do people still confuse them?' },
              { slug: 'how-daylight-saving-time-works', emoji: '☀️', title: 'How DST Works', desc: 'The origins, mechanics, and controversies of daylight saving time.' },
              { slug: 'why-china-uses-one-time-zone', emoji: '🇨🇳', title: 'Why China Has One Time Zone', desc: 'Despite spanning five time zones, China uses just one. Here\u2019s why.' },
              { slug: 'what-is-the-international-date-line', emoji: '🗺️', title: 'The International Date Line', desc: 'How the 180th meridian separates today from tomorrow.' },
              { slug: 'why-some-countries-have-half-hour-time-zones', emoji: '⏰', title: 'Half-Hour Time Zones', desc: 'Why India, Nepal, and others use 30- and 45-minute offsets.' },
            ].map(guide => (
              <Link key={guide.slug} to={`/guides/${guide.slug}`} className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all">
                <div className="text-3xl mb-3">{guide.emoji}</div>
                <div className="text-white font-bold text-sm mb-1">{guide.title}</div>
                <div className="text-white/50 text-xs">{guide.desc}</div>
                <div className="mt-3 flex items-center gap-1 text-cyan-400 text-xs">
                  Read guide <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Games Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold text-2xl">🎮 Play a Game</h2>
              <p className="text-white/40 text-sm mt-1">Quick mini games while you explore world time</p>
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
              { slug: 'quiz', emoji: '🌍', name: 'Timezone Quiz', desc: 'Test your timezone knowledge', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
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

        <AdSlotComponent position="mid-page" index={1} className="mb-10" />
      </div>
    </div>
  );
};
