import React, { useState, Suspense, lazy } from 'react';
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
      {/* Header Ad */}
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-2" />
      </div>

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
              LIVE — Updated every millisecond
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
              The world's most precise global time platform. Millisecond accuracy, interactive 3D globe, and 150+ countries live.
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
        {/* Header Ad 2 */}
        <AdSlotComponent position="header" index={1} className="mb-10" />

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { icon: <Globe size={20} />, value: '150+', label: 'Countries' },
            { icon: <Zap size={20} />, value: '<16ms', label: 'Update Rate' },
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

        {/* Mid-page Ad */}
        <AdSlotComponent position="mid-page" index={0} className="mb-6" />

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

        {/* Mid-page Ad 2 */}
        <AdSlotComponent position="mid-page" index={1} className="mb-10" />

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
