import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Star, Telescope, Globe, ChevronDown, Search, Loader, Sparkles, Eye, Zap, MapPin } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';
import { COUNTRIES } from '../data/countries';

// ── Astronomical constants ───────────────────────────────────────────────────
const METEOR_SHOWERS = [
  { name: 'Eta Aquariids',   peak: '2026-05-05', end: '2026-05-28', zhr: 60,  emoji: '💫', origin: 'Halley\'s Comet', bestHemisphere: 'southern' },
  { name: 'Delta Aquariids', peak: '2026-07-28', end: '2026-08-23', zhr: 25,  emoji: '🌠', origin: 'Comet Marsden',   bestHemisphere: 'southern' },
  { name: 'Perseids',        peak: '2026-08-12', end: '2026-08-24', zhr: 100, emoji: '🌟', origin: 'Comet Swift-Tuttle', bestHemisphere: 'northern' },
  { name: 'Orionids',        peak: '2026-10-21', end: '2026-11-07', zhr: 20,  emoji: '⭐', origin: 'Halley\'s Comet', bestHemisphere: 'both' },
  { name: 'Leonids',         peak: '2026-11-17', end: '2026-11-30', zhr: 15,  emoji: '💥', origin: 'Comet Tempel-Tuttle', bestHemisphere: 'northern' },
  { name: 'Geminids',        peak: '2026-12-13', end: '2026-12-17', zhr: 150, emoji: '🎆', origin: 'Asteroid 3200 Phaethon', bestHemisphere: 'both' },
  { name: 'Ursids',          peak: '2026-12-22', end: '2026-12-26', zhr: 10,  emoji: '❄️', origin: 'Comet Tuttle',    bestHemisphere: 'northern' },
  { name: 'Quadrantids',     peak: '2027-01-03', end: '2027-01-05', zhr: 120, emoji: '✨', origin: 'Asteroid 2003 EH1', bestHemisphere: 'northern' },
];

const SOLAR_EVENTS = [
  { date: '2026-06-21', event: 'June Solstice', desc: 'Longest day in Northern Hemisphere, shortest in Southern', emoji: '☀️', type: 'solstice' },
  { date: '2026-08-12', event: 'Perseids Peak',  desc: 'Best night of the Perseid meteor shower — up to 100/hr', emoji: '🌠', type: 'meteor' },
  { date: '2026-09-22', event: 'September Equinox', desc: 'Equal day and night across all of Earth', emoji: '⚖️', type: 'equinox' },
  { date: '2026-09-12', event: 'Saturn at Opposition', desc: 'Saturn closest to Earth, rings fully open — visible all night', emoji: '🪐', type: 'planet' },
  { date: '2026-10-21', event: 'Orionids Peak',  desc: 'Debris from Halley\'s Comet — up to 20 meteors/hr', emoji: '💫', type: 'meteor' },
  { date: '2026-11-17', event: 'Leonids Peak',   desc: 'Fast bright meteors — up to 15/hr', emoji: '🌟', type: 'meteor' },
  { date: '2026-12-13', event: 'Geminids Peak',  desc: 'Best meteor shower of the year — up to 150/hr', emoji: '🎆', type: 'meteor' },
  { date: '2026-12-21', event: 'December Solstice', desc: 'Longest night in Northern Hemisphere', emoji: '🌙', type: 'solstice' },
  { date: '2027-01-03', event: 'Quadrantids Peak', desc: 'Short but intense shower — up to 120/hr', emoji: '✨', type: 'meteor' },
  { date: '2027-07-25', event: 'Jupiter at Opposition', desc: 'Jupiter biggest and brightest — visible all night', emoji: '🪐', type: 'planet' },
];

const PLANET_VISIBILITY = [
  { name: 'Venus',   emoji: '🌟', color: 'text-yellow-300', mag: -4.5, visible: 'Dawn sky (eastern horizon before sunrise)', tip: 'Brightest object after the Moon — rises ~2 hrs before sun' },
  { name: 'Mars',    emoji: '🔴', color: 'text-red-400',    mag: -1.3, visible: 'Evening sky (sets ~2 hrs after sunset)', tip: 'Reddish tint — look southwest after dusk' },
  { name: 'Jupiter', emoji: '🪐', color: 'text-orange-300', mag: -2.5, visible: 'Late evening, rises around midnight', tip: 'Brightest star-like object in the eastern sky after midnight' },
  { name: 'Saturn',  emoji: '💛', color: 'text-yellow-400', mag: 0.5,  visible: 'Evening sky, visible most of the night', tip: 'Golden hue — rings visible with even a small telescope' },
  { name: 'Mercury', emoji: '⚪', color: 'text-gray-300',   mag: 0.0,  visible: 'Dawn sky (low on horizon)', tip: 'Closest to sun — only 20° from horizon, best seen at twilight' },
];

interface SkyData {
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLength: number;
  civilDawn: string;
  astronomicalDawn: string;
  moonPhase: number;
  moonPhaseName: string;
  moonEmoji: string;
}

// Moon phase calculation (0 = new, 0.5 = full)
function getMoonPhase(date: Date): { phase: number; name: string; emoji: string } {
  const synodicMonth = 29.53058770576;
  // Known new moon: Jan 1 2000 18:14 UTC
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const elapsed = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((elapsed % synodicMonth) + synodicMonth) % synodicMonth;
  const normalized = phase / synodicMonth;
  const names = [
    { name: 'New Moon',         emoji: '🌑', range: [0, 0.0625] },
    { name: 'Waxing Crescent',  emoji: '🌒', range: [0.0625, 0.25] },
    { name: 'First Quarter',    emoji: '🌓', range: [0.25, 0.3125] },
    { name: 'Waxing Gibbous',   emoji: '🌔', range: [0.3125, 0.5] },
    { name: 'Full Moon',        emoji: '🌕', range: [0.5, 0.5625] },
    { name: 'Waning Gibbous',   emoji: '🌖', range: [0.5625, 0.75] },
    { name: 'Last Quarter',     emoji: '🌗', range: [0.75, 0.8125] },
    { name: 'Waning Crescent',  emoji: '🌘', range: [0.8125, 1.0] },
  ];
  const match = names.find(n => normalized >= n.range[0] && normalized < n.range[1]) ?? names[7];
  return { phase: normalized, name: match.name, emoji: match.emoji };
}

async function fetchSkyData(lat: number, lng: number): Promise<SkyData> {
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(
    `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0&date=${today}`
  );
  const d = await res.json();
  const r = d.results;

  const toLocal = (iso: string, tz: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz });
    } catch { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }
  };

  const dayLengthSecs = r.day_length;
  const moon = getMoonPhase(new Date());

  return {
    sunrise: r.sunrise,
    sunset: r.sunset,
    solarNoon: r.solar_noon,
    dayLength: dayLengthSecs,
    civilDawn: r.civil_twilight_begin,
    astronomicalDawn: r.astronomical_twilight_begin,
    moonPhase: moon.phase,
    moonPhaseName: moon.name,
    moonEmoji: moon.emoji,
  };
}

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatLocalTime(iso: string, tz: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz });
  } catch {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0,0,0,0); target.setHours(0,0,0,0);
  return Math.round((target.getTime() - now.getTime()) / (1000*60*60*24));
}

function getActiveMeteorShower(): typeof METEOR_SHOWERS[0] | null {
  const now = new Date().toISOString().split('T')[0];
  return METEOR_SHOWERS.find(s => s.peak <= now && s.end >= now) ?? null;
}

function getNextMeteorShower(): typeof METEOR_SHOWERS[0] | null {
  const now = new Date().toISOString().split('T')[0];
  return METEOR_SHOWERS.find(s => s.peak > now) ?? null;
}

function getUpcomingEvents(n = 5) {
  const now = new Date().toISOString().split('T')[0];
  return SOLAR_EVENTS.filter(e => e.date >= now).slice(0, n);
}

function moonIllumination(phase: number): number {
  return Math.round(Math.abs(Math.cos(phase * 2 * Math.PI)) * 100);
}

// ── Component ────────────────────────────────────────────────────────────────
export const SkyPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find(c => c.code === 'US') ?? COUNTRIES[0]
  );
  const [skyData, setSkyData] = useState<SkyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'sun' | 'moon' | 'events' | 'planets'>('sun');

  useSEO({
    title: 'Sky & Space Events — Sunrise, Sunset, Moon Phases, Planets | World Clock',
    description: 'Live sunrise & sunset times, moon phases, meteor showers, planet visibility, and solar system events — optimized for every country on Earth.',
    canonical: 'https://globaltime-pi.vercel.app/sky',
  });

  const load = useCallback(async (country: typeof COUNTRIES[0]) => {
    setLoading(true);
    try {
      const data = await fetchSkyData(country.lat, country.lng);
      setSkyData(data);
    } catch (e) {
      console.error('Sky data error:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(selectedCountry); }, [selectedCountry, load]);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.capital.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20);

  const activeMeteor = getActiveMeteorShower();
  const nextMeteor = getNextMeteorShower();
  const upcomingEvents = getUpcomingEvents(5);
  const moon = getMoonPhase(new Date());

  const isNorthern = selectedCountry.lat >= 0;

  // Determine meteor shower visibility for this country's hemisphere
  function meteorVisible(shower: typeof METEOR_SHOWERS[0]): string {
    if (shower.bestHemisphere === 'both') return 'Visible worldwide';
    if (shower.bestHemisphere === 'northern' && isNorthern) return 'Best from your location';
    if (shower.bestHemisphere === 'southern' && !isNorthern) return 'Best from your location';
    return 'Reduced visibility from your location';
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4 pb-20">
      {/* Star field background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 'px', height: Math.random() * 2 + 'px',
              top: Math.random() * 100 + '%', left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.1,
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: Math.random() * 3 + 's',
            }} />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-6" />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="text-6xl mb-3">🔭</div>
          <h1 className="text-5xl font-black text-white mb-3">
            Sky & <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Space</span>
          </h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Live sunrise & sunset, moon phases, meteor showers, planet visibility, and solar system events — all for your country.
          </p>
        </motion.div>

        {/* Country selector */}
        <div className="relative mb-8 max-w-md mx-auto">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/20 bg-white/5 cursor-pointer hover:border-cyan-400/40 transition-colors"
            onClick={() => setShowDropdown(v => !v)}
          >
            <span className="text-2xl">{selectedCountry.flag}</span>
            <div className="flex-1">
              <div className="text-white font-semibold">{selectedCountry.name}</div>
              <div className="text-white/40 text-xs">{selectedCountry.capital} · {selectedCountry.lat.toFixed(1)}°, {selectedCountry.lng.toFixed(1)}°</div>
            </div>
            <ChevronDown size={16} className={`text-white/40 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </div>
          <AnimatePresence>
            {showDropdown && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d24]/98 border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2 border-b border-white/10">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/5">
                    <Search size={14} className="text-white/30" />
                    <input
                      value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search country..."
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredCountries.map(c => (
                    <button key={c.slug} onClick={() => { setSelectedCountry(c); setShowDropdown(false); setSearch(''); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-sm transition-colors text-left ${c.slug === selectedCountry.slug ? 'bg-cyan-400/10 text-cyan-400' : 'text-white/70'}`}>
                      <span>{c.flag}</span><span>{c.name}</span>
                      <span className="text-white/30 text-xs ml-auto">{c.capital}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active meteor shower alert */}
        {activeMeteor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 p-4 rounded-2xl border border-yellow-400/40 bg-yellow-400/10 flex items-center gap-3">
            <span className="text-2xl">{activeMeteor.emoji}</span>
            <div>
              <div className="text-yellow-400 font-bold">{activeMeteor.name} — Active NOW!</div>
              <div className="text-white/60 text-sm">{meteorVisible(activeMeteor)} · From {activeMeteor.origin} · Up to {activeMeteor.zhr} meteors/hr</div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { id: 'sun', label: 'Sun & Moon', icon: Sun },
            { id: 'events', label: 'Sky Events', icon: Star },
            { id: 'planets', label: 'Planets', icon: Telescope },
            { id: 'moon', label: 'Moon Phase', icon: Moon },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-cyan-400/20 border border-cyan-400/40 text-cyan-400' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}>
              <tab.icon size={14} />{tab.label}
            </button>
          ))}
        </div>

        {/* ── SUN & MOON TAB ─────────────────────────────────────────── */}
        {activeTab === 'sun' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-white/40">
                <Loader size={20} className="animate-spin" />Loading sky data...
              </div>
            ) : skyData ? (
              <div className="space-y-4">
                {/* Main sun card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Sunrise',     value: formatLocalTime(skyData.sunrise, selectedCountry.timezone),      emoji: '🌅', color: 'from-orange-500/20 to-yellow-500/10' },
                    { label: 'Solar Noon',  value: formatLocalTime(skyData.solarNoon, selectedCountry.timezone),    emoji: '☀️',  color: 'from-yellow-500/20 to-orange-500/10' },
                    { label: 'Sunset',      value: formatLocalTime(skyData.sunset, selectedCountry.timezone),       emoji: '🌇', color: 'from-orange-600/20 to-purple-500/10' },
                    { label: 'Daylight',    value: formatDuration(skyData.dayLength),                               emoji: '⏱️', color: 'from-cyan-500/20 to-blue-500/10' },
                  ].map(item => (
                    <div key={item.label} className={`p-4 rounded-2xl border border-white/10 bg-gradient-to-br ${item.color} text-center`}>
                      <div className="text-3xl mb-2">{item.emoji}</div>
                      <div className="text-white font-bold text-lg">{item.value}</div>
                      <div className="text-white/50 text-xs mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Twilight times */}
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Twilight Windows</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Astronomical Dawn', time: formatLocalTime(skyData.astronomicalDawn, selectedCountry.timezone), desc: 'Sky begins to brighten', emoji: '🌌' },
                      { label: 'Civil Dawn',         time: formatLocalTime(skyData.civilDawn, selectedCountry.timezone),       desc: 'Enough light to read', emoji: '🌤️' },
                      { label: 'Sunrise',            time: formatLocalTime(skyData.sunrise, selectedCountry.timezone),          desc: 'Sun crosses horizon', emoji: '🌅' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <span className="text-xl">{item.emoji}</span>
                        <div>
                          <div className="text-white font-semibold text-sm">{item.time}</div>
                          <div className="text-white/40 text-xs">{item.label}</div>
                          <div className="text-white/30 text-xs">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Moon card */}
                <div className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{moon.emoji}</div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-xl">{moon.name}</div>
                      <div className="text-white/50 text-sm mt-1">
                        Illumination: <span className="text-white font-semibold">{moonIllumination(moon.phase)}%</span>
                        {moon.phase < 0.5 ? ' (waxing)' : ' (waning)'}
                      </div>
                      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden w-full max-w-48">
                        <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                          style={{ width: `${moonIllumination(moon.phase)}%` }} />
                      </div>
                    </div>
                    <div className="text-white/30 text-sm text-right">
                      <div>Phase</div>
                      <div className="text-white font-mono">{(moon.phase * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                  {moon.phase > 0.45 && moon.phase < 0.55 && (
                    <div className="mt-3 text-yellow-400 text-sm flex items-center gap-2">
                      <Sparkles size={14} /> Full Moon tonight — poor night for stargazing, great for moonwalking
                    </div>
                  )}
                  {(moon.phase < 0.05 || moon.phase > 0.95) && (
                    <div className="mt-3 text-cyan-400 text-sm flex items-center gap-2">
                      <Star size={14} /> New Moon — perfect dark sky for stargazing and meteor watching
                    </div>
                  )}
                </div>

                {/* Hemisphere info */}
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-3">
                  <MapPin size={16} className="text-cyan-400 flex-shrink-0" />
                  <div className="text-white/60 text-sm">
                    <span className="text-white">{selectedCountry.flag} {selectedCountry.name}</span> is in the{' '}
                    <span className="text-cyan-400">{isNorthern ? 'Northern' : 'Southern'} Hemisphere</span>
                    {' '}— currently in {(() => {
                      const m = new Date().getMonth();
                      if (isNorthern) return m >= 2 && m <= 7 ? 'spring/summer (longer days)' : 'autumn/winter (shorter days)';
                      return m >= 2 && m <= 7 ? 'autumn/winter (shorter days)' : 'spring/summer (longer days)';
                    })()}
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* ── SKY EVENTS TAB ─────────────────────────────────────────── */}
        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Star size={16} className="text-yellow-400" /> Upcoming Sky Events
              </div>
              <div className="space-y-3">
                {upcomingEvents.map((event, i) => {
                  const days = daysUntil(event.date);
                  const typeColors: Record<string, string> = {
                    meteor: 'border-yellow-400/30 bg-yellow-400/5',
                    planet: 'border-cyan-400/30 bg-cyan-400/5',
                    equinox: 'border-green-400/30 bg-green-400/5',
                    solstice: 'border-orange-400/30 bg-orange-400/5',
                    eclipse: 'border-red-400/30 bg-red-400/5',
                  };
                  return (
                    <motion.div key={event.date}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${typeColors[event.type] ?? 'border-white/10 bg-white/5'}`}>
                      <span className="text-3xl flex-shrink-0">{event.emoji}</span>
                      <div className="flex-1">
                        <div className="text-white font-bold">{event.event}</div>
                        <div className="text-white/50 text-sm mt-0.5">{event.desc}</div>
                        <div className="text-white/30 text-xs mt-1">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-sm font-bold ${days <= 7 ? 'text-yellow-400' : 'text-white/60'}`}>
                          {days === 0 ? 'TODAY' : days === 1 ? 'Tomorrow' : `${days} days`}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Meteor showers */}
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" /> Meteor Showers 2026–2027
              </div>
              <div className="space-y-2">
                {METEOR_SHOWERS.map((shower, i) => {
                  const days = daysUntil(shower.peak);
                  const isActive = shower.peak <= new Date().toISOString().split('T')[0] && shower.end >= new Date().toISOString().split('T')[0];
                  const isPast = shower.end < new Date().toISOString().split('T')[0];
                  const visibility = shower.bestHemisphere === 'both' ? '🌍 Worldwide'
                    : shower.bestHemisphere === 'northern'
                      ? isNorthern ? '✅ Best from your location' : '⚠️ Limited from your location'
                      : !isNorthern ? '✅ Best from your location' : '⚠️ Limited from your location';
                  return (
                    <motion.div key={shower.name}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        isActive ? 'border-yellow-400/40 bg-yellow-400/10' :
                        isPast ? 'border-white/5 bg-white/3 opacity-40' :
                        'border-white/10 bg-white/5'
                      }`}>
                      <span className="text-2xl">{shower.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold text-sm">{shower.name}</span>
                          {isActive && <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-bold">ACTIVE</span>}
                        </div>
                        <div className="text-white/40 text-xs">Peak: {shower.peak} · Max {shower.zhr}/hr · {shower.origin}</div>
                        <div className="text-white/40 text-xs">{visibility}</div>
                      </div>
                      {!isPast && <div className="text-white/50 text-xs text-right flex-shrink-0">
                        {days <= 0 ? 'Now' : `${days}d`}
                      </div>}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PLANETS TAB ────────────────────────────────────────────── */}
        {activeTab === 'planets' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                <Telescope size={16} className="text-cyan-400" /> Planet Visibility Tonight
              </div>
              <div className="text-white/40 text-xs mb-4">Visible from {selectedCountry.flag} {selectedCountry.name}</div>
              <div className="space-y-3">
                {PLANET_VISIBILITY.map((planet, i) => (
                  <motion.div key={planet.name}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
                    <span className="text-3xl flex-shrink-0">{planet.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold ${planet.color}`}>{planet.name}</div>
                      <div className="text-white/60 text-sm">{planet.visible}</div>
                      <div className="text-white/35 text-xs mt-0.5">{planet.tip}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white/40 text-xs">Magnitude</div>
                      <div className="text-white font-mono font-bold">{planet.mag > 0 ? '+' : ''}{planet.mag}</div>
                      <div className="text-white/30 text-xs">{planet.mag < 0 ? 'Very bright' : planet.mag < 2 ? 'Bright' : 'Dim'}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Solar system events */}
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Zap size={16} className="text-purple-400" /> Best Planet Viewing — 2026
              </div>
              <div className="space-y-3">
                {SOLAR_EVENTS.filter(e => e.type === 'planet').map((event, i) => (
                  <div key={event.date} className="flex items-center gap-3 p-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5">
                    <span className="text-2xl">{event.emoji}</span>
                    <div className="flex-1">
                      <div className="text-white font-semibold">{event.event}</div>
                      <div className="text-white/50 text-sm">{event.desc}</div>
                      <div className="text-white/30 text-xs">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <div className={`text-sm font-bold ${daysUntil(event.date) <= 30 ? 'text-cyan-400' : 'text-white/40'}`}>
                      {daysUntil(event.date) <= 0 ? 'Past' : `${daysUntil(event.date)}d`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip card */}
            <div className="p-4 rounded-2xl border border-purple-400/20 bg-purple-400/5 flex items-start gap-3">
              <Eye size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-white/60 text-sm">
                <span className="text-white font-semibold">Best viewing tip for {selectedCountry.flag} {selectedCountry.name}:</span>{' '}
                Head away from city lights, let your eyes adjust for 20 minutes, look for objects that don't twinkle —
                those are planets. {isNorthern ? 'Face south for the ecliptic path.' : 'Face north for the ecliptic path.'}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── MOON TAB ───────────────────────────────────────────────── */}
        {activeTab === 'moon' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-8 rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-center">
              <div className="text-8xl mb-4">{moon.emoji}</div>
              <div className="text-white text-3xl font-black mb-2">{moon.name}</div>
              <div className="text-white/60 text-lg">{moonIllumination(moon.phase)}% illuminated</div>

              {/* Moon phase wheel */}
              <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                {['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'].map((emoji, i) => {
                  const phase = i / 8;
                  const isActive = Math.abs(moon.phase - phase) < 0.0625 || (i === 7 && moon.phase > 0.9375);
                  return (
                    <div key={i} className={`text-3xl transition-all ${isActive ? 'scale-150 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'opacity-30'}`}>
                      {emoji}
                    </div>
                  );
                })}
              </div>
              <div className="text-white/30 text-xs mt-3">Current phase highlighted</div>
            </div>

            {/* Moon calendar — next 4 phases */}
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-white font-bold mb-4 flex items-center gap-2">
                <Moon size={15} className="text-indigo-400" /> Upcoming Moon Phases
              </div>
              {(() => {
                const synodicMonth = 29.53058770576;
                const phases: { name: string; emoji: string; date: Date }[] = [];
                const now = new Date();
                const knownNewMoon = new Date('2000-01-06T18:14:00Z');
                const elapsed = (now.getTime() - knownNewMoon.getTime()) / (1000*60*60*24);
                const currentCycleAge = ((elapsed % synodicMonth) + synodicMonth) % synodicMonth;

                const nextPhases = [
                  { name: 'First Quarter', emoji: '🌓', offset: 7.38 },
                  { name: 'Full Moon',     emoji: '🌕', offset: 14.77 },
                  { name: 'Last Quarter',  emoji: '🌗', offset: 22.15 },
                  { name: 'New Moon',      emoji: '🌑', offset: 29.53 },
                ];

                return nextPhases.map(p => {
                  const daysToPhase = ((p.offset - currentCycleAge) + synodicMonth) % synodicMonth;
                  const phaseDate = new Date(now.getTime() + daysToPhase * 24 * 60 * 60 * 1000);
                  return (
                    <div key={p.name} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                      <span className="text-2xl">{p.emoji}</span>
                      <div className="flex-1">
                        <div className="text-white font-semibold">{p.name}</div>
                        <div className="text-white/40 text-sm">{phaseDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                      </div>
                      <div className="text-white/60 text-sm">{Math.round(daysToPhase)} days</div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Stargazing quality */}
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
              <div className="text-white font-semibold mb-2 flex items-center gap-2">
                <Star size={14} className="text-yellow-400" /> Stargazing Quality Tonight
              </div>
              {(() => {
                const illum = moonIllumination(moon.phase);
                const quality = illum < 20 ? { label: 'Excellent', color: 'text-green-400', bar: 'bg-green-400', pct: 95 }
                  : illum < 50 ? { label: 'Good', color: 'text-yellow-400', bar: 'bg-yellow-400', pct: 65 }
                  : illum < 80 ? { label: 'Fair', color: 'text-orange-400', bar: 'bg-orange-400', pct: 40 }
                  : { label: 'Poor', color: 'text-red-400', bar: 'bg-red-400', pct: 15 };
                return (
                  <div>
                    <div className={`text-xl font-bold ${quality.color}`}>{quality.label}</div>
                    <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full ${quality.bar} rounded-full`} style={{ width: `${quality.pct}%` }} />
                    </div>
                    <div className="text-white/40 text-xs mt-2">
                      {illum < 20 ? 'Dark sky — perfect for Milky Way photography and deep-sky objects.'
                        : illum < 50 ? 'Moderate moonlight — bright stars and planets easy, faint objects harder.'
                        : illum < 80 ? 'Bright moon — best for viewing planets and double stars only.'
                        : 'Very bright moon — focus on the Moon itself, Jupiter, or Venus tonight.'}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}

        <AdSlotComponent position="footer" index={0} className="mt-8" />
      </div>
    </div>
  );
};
