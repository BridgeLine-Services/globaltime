import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Map, Search, ChevronDown, Lock, CheckCircle2, Gem } from 'lucide-react';
import { useTreasureStore, getTrinketsForCountry, COUNTRY_TRINKETS } from '../stores/treasureStore';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';

const CONTINENT_FLAG: Record<string, string> = {
  'North America': '🌎', 'South America': '🌎', 'Europe': '🌍',
  'Africa': '🌍', 'Asia': '🌏', 'Oceania': '🌏',
};

// Map country codes to continent & name for display
const COUNTRY_META: Record<string, { name: string; flag: string; continent: string }> = {
  US: { name: 'United States', flag: '🇺🇸', continent: 'North America' },
  GB: { name: 'United Kingdom', flag: '🇬🇧', continent: 'Europe' },
  JP: { name: 'Japan',          flag: '🇯🇵', continent: 'Asia' },
  FR: { name: 'France',         flag: '🇫🇷', continent: 'Europe' },
  DE: { name: 'Germany',        flag: '🇩🇪', continent: 'Europe' },
  GH: { name: 'Ghana',          flag: '🇬🇭', continent: 'Africa' },
  BR: { name: 'Brazil',         flag: '🇧🇷', continent: 'South America' },
  IN: { name: 'India',          flag: '🇮🇳', continent: 'Asia' },
  CN: { name: 'China',          flag: '🇨🇳', continent: 'Asia' },
  AU: { name: 'Australia',      flag: '🇦🇺', continent: 'Oceania' },
  CA: { name: 'Canada',         flag: '🇨🇦', continent: 'North America' },
  MX: { name: 'Mexico',         flag: '🇲🇽', continent: 'North America' },
  ZA: { name: 'South Africa',   flag: '🇿🇦', continent: 'Africa' },
  IT: { name: 'Italy',          flag: '🇮🇹', continent: 'Europe' },
  NG: { name: 'Nigeria',        flag: '🇳🇬', continent: 'Africa' },
  EG: { name: 'Egypt',          flag: '🇪🇬', continent: 'Africa' },
  RU: { name: 'Russia',         flag: '🇷🇺', continent: 'Europe' },
};

type Tab = 'collection' | 'leaderboard';

export const CollectionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('collection');
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  const { isFound, playerName, setPlayerName, leaderboard, submitToLeaderboard, getTotalFound } = useTreasureStore();

  useSEO({
    title: 'Trinket Collections — Global Treasure Hunt | World Clock',
    description: 'Track your global treasure hunt progress. Find hidden trinkets in countries around the world, claim your collection, and compete on the leaderboard.',
    canonical: 'https://globaltime-pi.vercel.app/collections',
  });

  const totalTrinkets = Object.values(COUNTRY_TRINKETS).reduce((s, arr) => s + arr.length, 0);
  const totalFound = getTotalFound();
  const completedCountries = Object.keys(COUNTRY_TRINKETS).filter(code => {
    const trinkets = getTrinketsForCountry(code);
    return trinkets.every(t => isFound(t.id));
  });

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setPlayerName(nameInput.trim());
      submitToLeaderboard(nameInput.trim());
      setShowNamePrompt(false);
    }
  };

  const progress = totalTrinkets > 0 ? (totalFound / totalTrinkets) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-6" />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Treasure <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Hunt</span>
          </h1>
          <p className="text-white/50 max-w-lg mx-auto">
            Hidden across the globe are unique trinkets. Click countries on the globe to find them!
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: <Gem size={20} className="text-yellow-400" />, value: `${totalFound}/${totalTrinkets}`, label: 'Trinkets Found' },
            { icon: <Map size={20} className="text-cyan-400" />,   value: `${completedCountries.length}/${Object.keys(COUNTRY_TRINKETS).length}`, label: 'Countries Complete' },
            { icon: <Star size={20} className="text-purple-400" />,value: `${Math.round(progress)}%`, label: 'Total Progress' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <div className="text-white font-bold text-xl">{stat.value}</div>
              <div className="text-white/40 text-xs">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Progress bar */}
        <div className="mb-6 p-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/5">
          <div className="flex justify-between text-xs text-white/50 mb-2">
            <span>Global Progress</span>
            <span>{totalFound} / {totalTrinkets}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2.5">
            <motion.div
              className="h-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Player name */}
        <div className="mb-6 p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
            {playerName ? playerName[0].toUpperCase() : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold">{playerName || 'Anonymous Explorer'}</div>
            <div className="text-white/40 text-xs">{totalFound} trinkets found</div>
          </div>
          <button
            onClick={() => { setNameInput(playerName); setShowNamePrompt(true); }}
            className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-lg border border-cyan-400/20 hover:border-cyan-400/40"
          >
            {playerName ? 'Edit Name' : 'Set Name'}
          </button>
        </div>

        {/* Name prompt modal */}
        <AnimatePresence>
          {showNamePrompt && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
              onClick={() => setShowNamePrompt(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-[#0d0d2b] border border-white/20 rounded-2xl p-6 w-full max-w-sm"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-white font-bold text-lg mb-2">Your Explorer Name</h3>
                <p className="text-white/40 text-sm mb-4">This appears on the leaderboard</p>
                <input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  placeholder="Enter your name..."
                  maxLength={20}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-yellow-400/50 mb-4"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:opacity-90 transition-opacity"
                >
                  Save Name
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['collection', 'leaderboard'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-yellow-400/20 border border-yellow-400/40 text-yellow-300'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/80'
              }`}
            >
              {tab === 'collection' ? '🗺️ My Collection' : '🏆 Leaderboard'}
            </button>
          ))}
        </div>

        {/* Collection Tab */}
        {activeTab === 'collection' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {totalFound === 0 && (
              <div className="text-center py-16 text-white/30">
                <div className="text-5xl mb-4">🗺️</div>
                <div className="text-lg font-bold text-white/50 mb-2">No trinkets found yet</div>
                <div className="text-sm">Go to the homepage, click a country on the globe,<br />and look for the golden ✨ markers!</div>
              </div>
            )}
            {Object.entries(COUNTRY_TRINKETS).map(([code, trinkets]) => {
              const meta = COUNTRY_META[code];
              if (!meta) return null;
              const foundInCountry = trinkets.filter(t => isFound(t.id));
              if (foundInCountry.length === 0) return null;
              const isComplete = foundInCountry.length === trinkets.length;
              const isExpanded = expandedCountry === code;

              return (
                <motion.div key={code} layout className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: isComplete ? '#ffd70040' : '#ffffff15', background: isComplete ? '#ffd70008' : '#ffffff05' }}>
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left"
                    onClick={() => setExpandedCountry(isExpanded ? null : code)}
                  >
                    <span className="text-2xl">{meta.flag}</span>
                    <div className="flex-1">
                      <div className="text-white font-bold flex items-center gap-2">
                        {meta.name}
                        {isComplete && <span className="text-yellow-400 text-xs">⭐ COMPLETE!</span>}
                      </div>
                      <div className="text-white/40 text-xs">{CONTINENT_FLAG[meta.continent]} {meta.continent}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 text-sm font-bold">{foundInCountry.length}/{trinkets.length}</span>
                      <div className="w-16 bg-white/10 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                          style={{ width: `${(foundInCountry.length / trinkets.length) * 100}%` }} />
                      </div>
                      <ChevronDown size={14} className={`text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {trinkets.map(t => {
                            const claimed = isFound(t.id);
                            return (
                              <div key={t.id}
                                className={`p-3 rounded-xl border text-center transition-all ${
                                  claimed
                                    ? 'border-yellow-400/30 bg-yellow-400/10'
                                    : 'border-white/10 bg-white/5 opacity-40'
                                }`}>
                                <div className="text-2xl mb-1">{claimed ? t.emoji : '❓'}</div>
                                <div className={`text-xs font-bold ${claimed ? 'text-white' : 'text-white/30'}`}>
                                  {claimed ? t.name : '???'}
                                </div>
                                {claimed && (
                                  <div className="text-white/40 text-xs mt-1 leading-relaxed italic line-clamp-2">
                                    "{t.fact}"
                                  </div>
                                )}
                                <div className="mt-1.5">
                                  {claimed
                                    ? <CheckCircle2 size={12} className="text-yellow-400 mx-auto" />
                                    : <Lock size={12} className="text-white/20 mx-auto" />
                                  }
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Countries not yet started */}
            {totalFound > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-white/40 text-sm font-bold mb-3 flex items-center gap-2">
                  <Search size={14} />
                  Countries Not Yet Explored
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(COUNTRY_TRINKETS).map(([code, trinkets]) => {
                    const meta = COUNTRY_META[code];
                    if (!meta || trinkets.some(t => isFound(t.id))) return null;
                    return (
                      <span key={code} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-white/30 text-xs">
                        {meta.flag} {meta.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" />
                <span className="text-white font-bold">Global Trinket Hunters</span>
                <span className="ml-auto text-white/30 text-xs">Top {Math.min(leaderboard.length, 75)}</span>
              </div>

              {leaderboard.length === 0 ? (
                <div className="py-12 text-center text-white/30">
                  <div className="text-4xl mb-3">🏆</div>
                  <div>No hunters yet — be the first!</div>
                  <div className="text-xs mt-2 text-white/20">Find trinkets & set your name to appear here</div>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {leaderboard.slice(0, 75).map((entry, idx) => {
                    const isMe = playerName && entry.name.toLowerCase() === playerName.toLowerCase();
                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
                    return (
                      <div key={entry.id}
                        className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                          isMe ? 'bg-yellow-400/10' : 'hover:bg-white/5'
                        }`}>
                        <span className="w-8 text-center text-sm font-bold">
                          {medal ?? <span className="text-white/30 text-xs">#{idx + 1}</span>}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400/40 to-orange-500/40 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {entry.name[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold text-sm truncate ${isMe ? 'text-yellow-300' : 'text-white'}`}>
                            {entry.name} {isMe && <span className="text-yellow-400/60 text-xs font-normal">(you)</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-yellow-400 font-bold">{entry.count}</span>
                          <span className="text-white/30 text-xs">trinkets</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {!playerName && totalFound > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 text-center">
                <div className="text-white/70 text-sm mb-3">You have {totalFound} trinkets! Set your name to appear on the leaderboard.</div>
                <button
                  onClick={() => setShowNamePrompt(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                >
                  Join the Leaderboard
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        <AdSlotComponent position="mid-page" index={0} className="mt-8" />
      </div>
    </div>
  );
};
