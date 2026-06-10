import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudLightning, Wind, Droplets, AlertTriangle, Eye, Thermometer, ArrowUp, ChevronDown, Search, Loader, Shield, Tornado } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';
import { COUNTRIES } from '../data/countries';

// ── WMO codes for dangerous conditions ──────────────────────────────────────
const WMO_LABELS: Record<number, { label: string; emoji: string; severity: 'extreme' | 'high' | 'medium' | 'low' | 'clear' }> = {
  0:  { label: 'Clear Sky',           emoji: '☀️',  severity: 'clear' },
  1:  { label: 'Mainly Clear',        emoji: '🌤️', severity: 'clear' },
  2:  { label: 'Partly Cloudy',       emoji: '⛅',  severity: 'clear' },
  3:  { label: 'Overcast',            emoji: '☁️',  severity: 'low' },
  45: { label: 'Fog',                 emoji: '🌫️', severity: 'medium' },
  48: { label: 'Icy Fog',             emoji: '🌫️', severity: 'high' },
  51: { label: 'Light Drizzle',       emoji: '🌦️', severity: 'low' },
  53: { label: 'Drizzle',             emoji: '🌦️', severity: 'low' },
  55: { label: 'Heavy Drizzle',       emoji: '🌧️', severity: 'medium' },
  61: { label: 'Light Rain',          emoji: '🌧️', severity: 'low' },
  63: { label: 'Moderate Rain',       emoji: '🌧️', severity: 'medium' },
  65: { label: 'Heavy Rain',          emoji: '⛈️', severity: 'high' },
  71: { label: 'Light Snow',          emoji: '🌨️', severity: 'low' },
  73: { label: 'Moderate Snow',       emoji: '❄️',  severity: 'medium' },
  75: { label: 'Heavy Snow',          emoji: '🌨️', severity: 'high' },
  77: { label: 'Snow Grains',         emoji: '🌨️', severity: 'medium' },
  80: { label: 'Rain Showers',        emoji: '🌦️', severity: 'medium' },
  81: { label: 'Moderate Showers',    emoji: '🌧️', severity: 'medium' },
  82: { label: 'Violent Showers',     emoji: '⛈️', severity: 'high' },
  85: { label: 'Snow Showers',        emoji: '🌨️', severity: 'medium' },
  86: { label: 'Heavy Snow Showers',  emoji: '❄️',  severity: 'high' },
  95: { label: 'Thunderstorm',        emoji: '⛈️', severity: 'high' },
  96: { label: 'Thunderstorm w/ Hail',emoji: '🌩️', severity: 'extreme' },
  99: { label: 'Severe Thunderstorm', emoji: '🌩️', severity: 'extreme' },
};

function getWMO(code: number) {
  return WMO_LABELS[code] ?? { label: 'Unknown', emoji: '🌡️', severity: 'low' as const };
}

const SEVERITY_CONFIG = {
  extreme: { color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/40',    label: 'EXTREME RISK',  ring: 'ring-red-400/30' },
  high:    { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/40', label: 'HIGH RISK',     ring: 'ring-orange-400/30' },
  medium:  { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', label: 'MODERATE RISK', ring: 'ring-yellow-400/20' },
  low:     { color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   label: 'LOW RISK',      ring: 'ring-blue-400/20' },
  clear:   { color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  label: 'ALL CLEAR',     ring: 'ring-green-400/20' },
};

interface HourlyPoint {
  time: string;
  temp: number;
  wmo: number;
  wind: number;
  precip: number;
  cape: number;
  liftedIndex: number;
  cloudcover: number;
}

interface DailyPoint {
  time: string;
  maxTemp: number;
  minTemp: number;
  wmo: number;
  precip: number;
  wind: number;
  uvIndex: number;
  precipProb: number;
}

interface StormData {
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  currentWmo: number;
  currentTemp: number;
  currentWind: number;
  currentHumidity: number;
  currentFeels: number;
}

function capeToRisk(cape: number): string {
  if (cape < 300)  return 'Stable — no convective activity';
  if (cape < 1000) return 'Weakly unstable — isolated showers possible';
  if (cape < 2500) return 'Moderately unstable — thunderstorms likely';
  if (cape < 4000) return 'Very unstable — severe thunderstorms possible';
  return 'Extremely unstable — violent storms expected';
}

function liToRisk(li: number): string {
  if (li > 2)  return 'Stable atmosphere';
  if (li > -2) return 'Slightly unstable';
  if (li > -4) return 'Unstable — thunderstorms possible';
  if (li > -6) return 'Very unstable — severe storms likely';
  return 'Extremely unstable — tornado risk';
}

function getOverallSeverity(hourly: HourlyPoint[]): 'extreme' | 'high' | 'medium' | 'low' | 'clear' {
  const next24 = hourly.slice(0, 24);
  const maxCape = Math.max(...next24.map(h => h.cape));
  const maxWind = Math.max(...next24.map(h => h.wind));
  const hasSevereWmo = next24.some(h => [96, 99].includes(h.wmo));
  const hasThunder = next24.some(h => [95, 96, 99].includes(h.wmo));
  const minLI = Math.min(...next24.map(h => h.liftedIndex));

  if (hasSevereWmo || maxCape > 3000 || minLI < -6) return 'extreme';
  if (hasThunder || maxCape > 1500 || maxWind > 80 || minLI < -4) return 'high';
  if (maxCape > 500 || maxWind > 50 || minLI < -2) return 'medium';
  if (next24.some(h => getWMO(h.wmo).severity !== 'clear')) return 'low';
  return 'clear';
}

async function fetchStormData(lat: number, lng: number): Promise<StormData> {
  const [forecast] = await Promise.allSettled([
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&hourly=temperature_2m,weathercode,windspeed_10m,precipitation_probability,cape,lifted_index,cloudcover` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,uv_index_max,precipitation_probability_max` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,windspeed_10m,weathercode` +
      `&timezone=auto&forecast_days=7`).then(r => r.json()),
  ]);

  const d = forecast.status === 'fulfilled' ? forecast.value : null;
  if (!d || d.error) throw new Error('Weather API error');

  const hourly: HourlyPoint[] = d.hourly.time.slice(0, 72).map((t: string, i: number) => ({
    time: t,
    temp: Math.round(d.hourly.temperature_2m[i]),
    wmo: d.hourly.weathercode[i],
    wind: Math.round(d.hourly.windspeed_10m[i]),
    precip: d.hourly.precipitation_probability[i] ?? 0,
    cape: d.hourly.cape?.[i] ?? 0,
    liftedIndex: d.hourly.lifted_index?.[i] ?? 3,
    cloudcover: d.hourly.cloudcover?.[i] ?? 0,
  }));

  const daily: DailyPoint[] = d.daily.time.map((t: string, i: number) => ({
    time: t,
    maxTemp: Math.round(d.daily.temperature_2m_max[i]),
    minTemp: Math.round(d.daily.temperature_2m_min[i]),
    wmo: d.daily.weathercode[i],
    precip: d.daily.precipitation_sum[i] ?? 0,
    wind: Math.round(d.daily.windspeed_10m_max[i]),
    uvIndex: d.daily.uv_index_max[i] ?? 0,
    precipProb: d.daily.precipitation_probability_max[i] ?? 0,
  }));

  return {
    hourly,
    daily,
    currentWmo: d.current.weathercode,
    currentTemp: Math.round(d.current.temperature_2m),
    currentWind: Math.round(d.current.windspeed_10m),
    currentHumidity: d.current.relative_humidity_2m,
    currentFeels: Math.round(d.current.apparent_temperature),
  };
}

function formatDay(dateStr: string, idx: number) {
  if (idx === 0) return 'Today';
  if (idx === 1) return 'Tomorrow';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatHour(timeStr: string) {
  return new Date(timeStr).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

// ── Component ────────────────────────────────────────────────────────────────
export const StormsPage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find(c => c.code === 'US') ?? COUNTRIES[0]
  );
  const [stormData, setStormData] = useState<StormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'hourly' | 'daily' | 'science'>('overview');

  useSEO({
    title: 'Storm Tracker & Severe Weather Alerts by Country | World Clock',
    description: 'Live storm forecasts, severe weather alerts, CAPE/Lifted Index atmospheric analysis, and 7-day hazard outlook — for every country on Earth.',
    canonical: 'https://globaltime-pi.vercel.app/storms',
  });

  const load = useCallback(async (country: typeof COUNTRIES[0]) => {
    setLoading(true); setError('');
    try {
      const data = await fetchStormData(country.lat, country.lng);
      setStormData(data);
    } catch (e) {
      setError('Could not load weather data. Please try again.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(selectedCountry); }, [selectedCountry, load]);

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.capital.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20);

  const severity = stormData ? getOverallSeverity(stormData.hourly) : 'clear';
  const sev = SEVERITY_CONFIG[severity];
  const currentWmo = stormData ? getWMO(stormData.currentWmo) : null;

  // Find next severe hour
  const nextSevereHour = stormData?.hourly.find((h, i) => i > 0 && ['extreme','high'].includes(getWMO(h.wmo).severity));
  // Find the peak cape hour in next 24h
  const next24 = stormData?.hourly.slice(0, 24) ?? [];
  const peakCapeHour = next24.reduce((best, h) => h.cape > best.cape ? h : best, next24[0] ?? { cape: 0, time: '', liftedIndex: 0 });

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-6" />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-3">⛈️</div>
          <h1 className="text-5xl font-black text-white mb-3">
            Storm <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">Tracker</span>
          </h1>
          <p className="text-white/50 max-w-xl mx-auto">
            Live severe weather analysis, CAPE atmospheric instability index, and 7-day hazard forecasts for every country on Earth.
          </p>
          <div className="text-white/30 text-xs mt-2">Powered by Open-Meteo · Data refreshed every hour</div>
        </motion.div>

        {/* Country selector */}
        <div className="relative mb-6 max-w-md mx-auto">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/20 bg-white/5 cursor-pointer hover:border-cyan-400/40 transition-colors"
            onClick={() => setShowDropdown(v => !v)}>
            <span className="text-2xl">{selectedCountry.flag}</span>
            <div className="flex-1">
              <div className="text-white font-semibold">{selectedCountry.name}</div>
              <div className="text-white/40 text-xs">{selectedCountry.capital}</div>
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
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search country..." autoFocus
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30" />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredCountries.map(c => (
                    <button key={c.slug} onClick={() => { setSelectedCountry(c); setShowDropdown(false); setSearch(''); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-sm transition-colors text-left ${c.slug === selectedCountry.slug ? 'bg-cyan-400/10 text-cyan-400' : 'text-white/70'}`}>
                      <span>{c.flag}</span><span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-white/40">
            <Loader size={22} className="animate-spin" /> Fetching storm data for {selectedCountry.name}...
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : stormData ? (
          <>
            {/* Overall severity alert */}
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className={`mb-6 p-5 rounded-2xl border ${sev.border} ${sev.bg} ring-1 ${sev.ring}`}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{currentWmo?.emoji}</div>
                <div className="flex-1">
                  <div className={`text-lg font-black ${sev.color}`}>{sev.label} — Next 24 Hours</div>
                  <div className="text-white text-sm font-semibold">{currentWmo?.label} · {stormData.currentTemp}°C, feels {stormData.currentFeels}°C</div>
                  <div className="text-white/50 text-xs mt-1">
                    Wind: {stormData.currentWind} km/h · Humidity: {stormData.currentHumidity}%
                    {peakCapeHour?.cape > 300 && ` · Peak CAPE: ${Math.round(peakCapeHour.cape)} J/kg at ${formatHour(peakCapeHour.time)}`}
                  </div>
                </div>
                {severity !== 'clear' && severity !== 'low' && (
                  <AlertTriangle size={28} className={`${sev.color} flex-shrink-0 animate-pulse`} />
                )}
              </div>
              {nextSevereHour && (
                <div className={`mt-3 text-sm ${sev.color} flex items-center gap-2`}>
                  <AlertTriangle size={13} />
                  Next severe event: {getWMO(nextSevereHour.wmo).label} around {formatHour(nextSevereHour.time)}
                </div>
              )}
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {([
                { id: 'overview', label: 'Overview', icon: Shield },
                { id: 'hourly',   label: '72-Hr Forecast', icon: CloudLightning },
                { id: 'daily',    label: '7-Day Outlook', icon: Wind },
                { id: 'science',  label: 'Storm Science', icon: Tornado },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-cyan-400/20 border border-cyan-400/40 text-cyan-400' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}>
                  <tab.icon size={14} />{tab.label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Current conditions grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Thermometer, label: 'Temperature',  value: `${stormData.currentTemp}°C`,    sub: `Feels ${stormData.currentFeels}°C`, color: 'text-orange-400' },
                    { icon: Wind,        label: 'Wind Speed',   value: `${stormData.currentWind} km/h`, sub: stormData.currentWind > 70 ? '⚠️ Gale force' : stormData.currentWind > 50 ? 'Strong' : 'Moderate', color: 'text-cyan-400' },
                    { icon: Droplets,    label: 'Humidity',     value: `${stormData.currentHumidity}%`, sub: stormData.currentHumidity > 85 ? 'Very humid' : 'Comfortable', color: 'text-blue-400' },
                    { icon: Eye,         label: 'Conditions',   value: currentWmo?.emoji ?? '❓',        sub: currentWmo?.label ?? '', color: 'text-purple-400' },
                  ].map(item => (
                    <div key={item.label} className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                      <item.icon size={18} className={`${item.color} mx-auto mb-2`} />
                      <div className="text-white font-bold text-xl">{item.value}</div>
                      <div className="text-white/40 text-xs mt-0.5">{item.label}</div>
                      <div className={`text-xs mt-1 ${item.color}`}>{item.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Hazard summary — next 7 days */}
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-white font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-orange-400" /> Hazard Summary — 7 Days
                  </div>
                  <div className="space-y-2">
                    {stormData.daily.map((day, i) => {
                      const wmo = getWMO(day.wmo);
                      const sev2 = SEVERITY_CONFIG[wmo.severity];
                      return (
                        <div key={day.time} className={`flex items-center gap-3 p-3 rounded-xl border ${sev2.border} ${sev2.bg}`}>
                          <span className="text-xl flex-shrink-0">{wmo.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold text-sm">{formatDay(day.time, i)}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${sev2.bg} ${sev2.color} border ${sev2.border}`}>{sev2.label}</span>
                            </div>
                            <div className="text-white/50 text-xs">{wmo.label} · Wind max {day.wind} km/h · Rain {day.precip.toFixed(1)}mm</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-white text-sm font-bold">{day.maxTemp}° / {day.minTemp}°</div>
                            <div className="text-white/40 text-xs">{day.precipProb}% rain</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── HOURLY TAB ───────────────────────────────────────── */}
            {activeTab === 'hourly' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-white font-bold mb-4">72-Hour Hourly Forecast</div>
                  <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                    {stormData.hourly.map((h, i) => {
                      const wmo = getWMO(h.wmo);
                      const isNow = i === 0;
                      const isWarning = ['extreme','high'].includes(wmo.severity);
                      return (
                        <div key={h.time}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                            isNow ? 'bg-cyan-400/10 border border-cyan-400/20' :
                            isWarning ? 'bg-orange-400/5 border border-orange-400/15' :
                            'hover:bg-white/5'}`}>
                          <div className="w-14 text-white/40 text-xs flex-shrink-0 font-mono">
                            {isNow ? 'Now' : formatHour(h.time)}
                          </div>
                          <span className="text-lg flex-shrink-0">{wmo.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-white/70 text-xs truncate">{wmo.label}</div>
                            {isWarning && (
                              <div className="text-orange-400 text-xs flex items-center gap-1">
                                <AlertTriangle size={10} />{SEVERITY_CONFIG[wmo.severity].label}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                            <span className="text-white font-mono">{h.temp}°</span>
                            <span className="text-cyan-400 font-mono w-12 text-right">{h.wind}km/h</span>
                            <span className="text-blue-400 w-8 text-right">{h.precip}%</span>
                            {h.cape > 500 && <span className="text-orange-400 text-xs">⚡{Math.round(h.cape)}J</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-white/25 text-xs flex gap-4">
                    <span>Wind in km/h</span><span>Rain probability %</span><span>CAPE in J/kg (⚡ when storm risk)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── DAILY TAB ────────────────────────────────────────── */}
            {activeTab === 'daily' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {stormData.daily.map((day, i) => {
                  const wmo = getWMO(day.wmo);
                  const sev2 = SEVERITY_CONFIG[wmo.severity];
                  const uvRisk = day.uvIndex >= 8 ? '🔴 Very High' : day.uvIndex >= 6 ? '🟠 High' : day.uvIndex >= 3 ? '🟡 Moderate' : '🟢 Low';
                  return (
                    <motion.div key={day.time}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`p-5 rounded-2xl border ${sev2.border} bg-white/5`}>
                      <div className="flex items-start gap-4">
                        <span className="text-4xl flex-shrink-0">{wmo.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-bold text-lg">{formatDay(day.time, i)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${sev2.border} ${sev2.color} ${sev2.bg}`}>{sev2.label}</span>
                          </div>
                          <div className="text-white/70 text-sm mt-0.5">{wmo.label}</div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                            {[
                              { icon: Thermometer, label: 'High/Low', value: `${day.maxTemp}° / ${day.minTemp}°`, color: 'text-orange-400' },
                              { icon: Wind,        label: 'Max Wind', value: `${day.wind} km/h`,                  color: 'text-cyan-400' },
                              { icon: Droplets,    label: 'Rainfall',  value: `${day.precip.toFixed(1)} mm`,      color: 'text-blue-400' },
                              { icon: Eye,         label: 'UV Index',  value: uvRisk,                             color: 'text-yellow-400' },
                            ].map(item => (
                              <div key={item.label} className="flex items-center gap-2">
                                <item.icon size={13} className={item.color} />
                                <div>
                                  <div className="text-white/40 text-xs">{item.label}</div>
                                  <div className="text-white text-sm font-semibold">{item.value}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ── SCIENCE TAB ──────────────────────────────────────── */}
            {activeTab === 'science' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* CAPE meter */}
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-white font-bold mb-1 flex items-center gap-2">
                    <Tornado size={15} className="text-orange-400" /> CAPE — Convective Available Potential Energy
                  </div>
                  <div className="text-white/40 text-xs mb-4">Higher CAPE = more energy available for thunderstorm development</div>
                  {(() => {
                    const maxCape = Math.max(...next24.map(h => h.cape));
                    const capeRisk = capeToRisk(maxCape);
                    const pct = Math.min((maxCape / 4000) * 100, 100);
                    const color = maxCape > 3000 ? 'bg-red-500' : maxCape > 1500 ? 'bg-orange-500' : maxCape > 500 ? 'bg-yellow-500' : 'bg-green-500';
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-mono text-2xl font-black">{Math.round(maxCape)} <span className="text-sm text-white/40">J/kg</span></span>
                          <span className={maxCape > 1500 ? 'text-orange-400 font-bold' : 'text-green-400'}>{capeRisk.split(' — ')[0]}</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                            className={`h-full ${color} rounded-full`} />
                        </div>
                        <div className="text-white/50 text-sm mt-2">{capeRisk}</div>
                        <div className="grid grid-cols-4 text-xs text-white/30 mt-2">
                          <span>0 Stable</span><span className="text-center">300</span><span className="text-center">1500</span><span className="text-right">4000+ Extreme</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Lifted Index */}
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-white font-bold mb-1 flex items-center gap-2">
                    <ArrowUp size={15} className="text-blue-400" /> Lifted Index (LI)
                  </div>
                  <div className="text-white/40 text-xs mb-4">Lower (negative) = more unstable atmosphere = higher storm risk</div>
                  {(() => {
                    const minLI = Math.min(...next24.map(h => h.liftedIndex));
                    const liRisk = liToRisk(minLI);
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-mono text-2xl font-black">{minLI.toFixed(1)}</span>
                          <span className={minLI < -4 ? 'text-red-400 font-bold' : minLI < -2 ? 'text-orange-400' : 'text-green-400'}>{liRisk.split(' — ')[0]}</span>
                        </div>
                        <div className="text-white/50 text-sm">{liRisk}</div>
                        <div className="mt-3 space-y-1">
                          {[
                            { range: 'LI > 2',    label: 'Stable',       color: 'bg-green-500/60',  active: minLI > 2 },
                            { range: '0 to 2',    label: 'Slight risk',   color: 'bg-yellow-500/60', active: minLI <= 2 && minLI > 0 },
                            { range: '-2 to 0',   label: 'Moderate risk', color: 'bg-orange-500/60', active: minLI <= 0 && minLI > -2 },
                            { range: '-4 to -2',  label: 'High risk',     color: 'bg-red-500/60',    active: minLI <= -2 && minLI > -4 },
                            { range: 'LI < -4',   label: 'Extreme risk',  color: 'bg-red-700/80',    active: minLI <= -4 },
                          ].map(item => (
                            <div key={item.range} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${item.active ? 'bg-white/10 border border-white/20' : ''}`}>
                              <div className={`w-2 h-2 rounded-full ${item.color}`} />
                              <span className="text-white/60 w-16">{item.range}</span>
                              <span className={item.active ? 'text-white font-bold' : 'text-white/30'}>{item.label}</span>
                              {item.active && <span className="ml-auto text-cyan-400">← Current</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Storm types for this region */}
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-white font-bold mb-3 flex items-center gap-2">
                    <CloudLightning size={15} className="text-purple-400" /> Storm Types for {selectedCountry.flag} {selectedCountry.name}
                  </div>
                  {(() => {
                    const lat = selectedCountry.lat;
                    const isCoastal = Math.abs(selectedCountry.lng) > 60 || selectedCountry.code === 'AU' || selectedCountry.code === 'JP' || selectedCountry.code === 'PH' || selectedCountry.code === 'ID';
                    const isTropical = Math.abs(lat) < 23.5;
                    const isMidLatitude = Math.abs(lat) >= 23.5 && Math.abs(lat) < 60;
                    const isPolar = Math.abs(lat) >= 60;
                    const types = [];
                    if (isTropical) types.push({ icon: '🌀', name: 'Tropical Cyclones / Hurricanes', risk: 'Seasonal', desc: 'Typhoons (W. Pacific), Cyclones (Indian Ocean/S. Pacific), Hurricanes (Atlantic/E. Pacific) — June to November peak season' });
                    if (isMidLatitude) types.push({ icon: '⛈️', name: 'Supercell Thunderstorms', risk: 'Spring/Summer', desc: 'Most severe thunderstorms with rotating updrafts — capable of large hail, damaging winds, and tornadoes' });
                    if (isMidLatitude) types.push({ icon: '🌪️', name: 'Tornadoes', risk: 'Moderate', desc: 'Violent rotating columns of air — most common in mid-latitude regions with flat terrain' });
                    if (isCoastal) types.push({ icon: '🌊', name: 'Storm Surge / Coastal Flooding', risk: 'High during storms', desc: 'Abnormal rise in sea level driven by tropical cyclones and strong winds — major coastal threat' });
                    types.push({ icon: '🌩️', name: 'Lightning & Hailstorms', risk: 'Year-round', desc: 'Convective storms producing lightning and hail — common in all latitudes during warm season' });
                    if (isPolar || Math.abs(lat) > 45) types.push({ icon: '❄️', name: 'Blizzards & Ice Storms', risk: 'Winter', desc: 'Severe winter storms with heavy snow, high winds, and dangerous wind chills — whiteout conditions possible' });
                    types.push({ icon: '💨', name: 'High Wind Events', risk: 'Year-round', desc: 'Extra-tropical cyclones and pressure gradients driving sustained damaging winds' });
                    return (
                      <div className="space-y-2">
                        {types.map((t, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-2xl flex-shrink-0">{t.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold text-sm">{t.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">{t.risk}</span>
                              </div>
                              <div className="text-white/40 text-xs mt-0.5">{t.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Data attribution */}
                <div className="p-4 rounded-xl border border-white/5 bg-white/3 text-white/25 text-xs">
                  Weather data from <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/50">Open-Meteo</a> (CC BY 4.0) — free, open-source, no tracking. 
                  CAPE and Lifted Index data from ERA5 model reanalysis via Open-Meteo. For life-threatening weather, always consult your national weather service.
                </div>
              </motion.div>
            )}
          </>
        ) : null}

        <AdSlotComponent position="footer" index={0} className="mt-8" />
      </div>
    </div>
  );
};
