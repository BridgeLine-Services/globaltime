import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from '../components/SearchBar';
import { CountryCard } from '../components/CountryCard';
import { AdSlotComponent } from '../components/AdSlot';
import { COUNTRIES, CONTINENTS } from '../data/countries';

export const WorldClockPage: React.FC = () => {
  const [activeContinent, setActiveContinent] = useState('All');
  const [searchActive, setSearchActive] = useState(false);

  const filtered = activeContinent === 'All'
    ? COUNTRIES
    : COUNTRIES.filter(c => c.continent === activeContinent);

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-6" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">
            🌍 World <span className="text-cyan-400">Clock</span>
          </h1>
          <p className="text-white/50">Real-time clocks for {COUNTRIES.length}+ countries, live down to the millisecond</p>
        </motion.div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <SearchBar placeholder="Search any country..." />
        </div>

        {/* Continent filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CONTINENTS.map(cont => (
            <button
              key={cont}
              onClick={() => setActiveContinent(cont)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeContinent === cont
                  ? 'bg-cyan-400 text-[#0a0a1a] shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              {cont} {cont !== 'All' && `(${COUNTRIES.filter(c => c.continent === cont).length})`}
            </button>
          ))}
        </div>

        <AdSlotComponent position="mid-page" index={0} className="mb-6" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
          {filtered.map((country, i) => (
            <motion.div
              key={country.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              <CountryCard country={country} compact />
            </motion.div>
          ))}
        </div>

        <AdSlotComponent position="mid-page" index={1} className="mb-6" />
        <AdSlotComponent position="sidebar" index={0} className="mb-4" />
      </div>
    </div>
  );
};
