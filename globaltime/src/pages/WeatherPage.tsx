import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Sun, Wind, Droplets, Eye, Search, MapPin, ChevronDown, ArrowUp, ArrowDown, Loader } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';

const SITE = 'https://globaltime-pi.vercel.app';

// Major world cities with coordinates
const WORLD_CITIES = [
  { name: 'New York', country: 'USA', flag: '🇺🇸', lat: 40.71, lng: -74.01, tz: 'America/New_York' },
  { name: 'London', country: 'UK', flag: '🇬🇧', lat: 51.51, lng: -0.13, tz: 'Europe/London' },
  { name: 'Tokyo', country: 'Japan', flag: '🇯🇵', lat: 35.68, lng: 139.69, tz: 'Asia/Tokyo' },
  { name: 'Paris', country: 'France', flag: '🇫🇷', lat: 48.85, lng: 2.35, tz: 'Europe/Paris' },
  { name: 'Sydney', country: 'Australia', flag: '🇦🇺', lat: -33.87, lng: 151.21, tz: 'Australia/Sydney' },
  { name: 'Dubai', country: 'UAE', flag: '🇦🇪', lat: 25.20, lng: 55.27, tz: 'Asia/Dubai' },
  { name: 'Singapore', country: 'Singapore', flag: '🇸🇬', lat: 1.35, lng: 103.82, tz: 'Asia/Singapore' },
  { name: 'São Paulo', country: 'Brazil', flag: '🇧🇷', lat: -23.55, lng: -46.63, tz: 'America/Sao_Paulo' },
  { name: 'Moscow', country: 'Russia', flag: '🇷🇺', lat: 55.75, lng: 37.62, tz: 'Europe/Moscow' },
  { name: 'Mumbai', country: 'India', flag: '🇮🇳', lat: 19.08, lng: 72.88, tz: 'Asia/Kolkata' },
  { name: 'Beijing', country: 'China', flag: '🇨🇳', lat: 39.91, lng: 116.39, tz: 'Asia/Shanghai' },
  { name: 'Cairo', country: 'Egypt', flag: '🇪🇬', lat: 30.04, lng: 31.24, tz: 'Africa/Cairo' },
  { name: 'Los Angeles', country: 'USA', flag: '🇺🇸', lat: 34.05, lng: -118.24, tz: 'America/Los_Angeles' },
  { name: 'Berlin', country: 'Germany', flag: '🇩🇪', lat: 52.52, lng: 13.41, tz: 'Europe/Berlin' },
  { name: 'Toronto', country: 'Canada', flag: '🇨🇦', lat: 43.65, lng: -79.38, tz: 'America/Toronto' },
  { name: 'Mexico City', country: 'Mexico', flag: '🇲🇽', lat: 19.43, lng: -99.13, tz: 'America/Mexico_City' },
  { name: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷', lat: -34.60, lng: -58.38, tz: 'America/Argentina/Buenos_Aires' },
  { name: 'Lagos', country: 'Nigeria', flag: '🇳🇬', lat: 6.52, lng: 3.38, tz: 'Africa/Lagos' },
  { name: 'Istanbul', country: 'Turkey', flag: '🇹🇷', lat: 41.01, lng: 28.96, tz: 'Europe/Istanbul' },
  { name: 'Seoul', country: 'South Korea', flag: '🇰🇷', lat: 37.57, lng: 126.98, tz: 'Asia/Seoul' },
  { name: 'Bangkok', country: 'Thailand', flag: '🇹🇭', lat: 13.75, lng: 100.52, tz: 'Asia/Bangkok' },
  { name: 'Nairobi', country: 'Kenya', flag: '🇰🇪', lat: -1.29, lng: 36.82, tz: 'Africa/Nairobi' },
];

const WMO_CODES: Record<number, { label: string; emoji: string; bg: string }> = {
  0:  { label: 'Clear Sky',           emoji: '☀️',  bg: 'from-yellow-500/20 to-orange-500/10' },
  1:  { label: 'Mainly Clear',        emoji: '🌤️', bg: 'from-yellow-400/20 to-blue-500/10' },
  2:  { label: 'Partly Cloudy',       emoji: '⛅',  bg: 'from-blue-400/20 to-gray-500/10' },
  3:  { label: 'Overcast',            emoji: '☁️',  bg: 'from-gray-500/20 to-gray-600/10' },
  45: { label: 'Foggy',               emoji: '🌫️', bg: 'from-gray-400/20 to-gray-500/10' },
  48: { label: 'Icy Fog',             emoji: '🌫️', bg: 'from-blue-300/20 to-gray-400/10' },
  51: { label: 'Light Drizzle',       emoji: '🌦️', bg: 'from-blue-400/20 to-cyan-500/10' },
  61: { label: 'Light Rain',          emoji: '🌧️', bg: 'from-blue-500/20 to-cyan-600/10' },
  63: { label: 'Moderate Rain',       emoji: '🌧️', bg: 'from-blue-600/20 to-cyan-700/10' },
  65: { label: 'Heavy Rain',          emoji: '⛈️', bg: 'from-blue-700/20 to-indigo-600/10' },
  71: { label: 'Light Snow',          emoji: '🌨️', bg: 'from-blue-200/20 to-white/10' },
  73: { label: 'Moderate Snow',       emoji: '❄️',  bg: 'from-blue-200/20 to-indigo-200/10' },
  75: { label: 'Heavy Snow',          emoji: '🌨️', bg: 'from-indigo-300/20 to-blue-200/10' },
  80: { label: 'Rain Showers',        emoji: '🌦️', bg: 'from-blue-500/20 to-cyan-400/10' },
  95: { label: 'Thunderstorm',        emoji: '⛈️', bg: 'from-purple-600/20 to-blue-600/10' },
  99: { label: 'Heavy Thunderstorm',  emoji: '🌩️', bg: 'from-purple-700/20 to-red-500/10' },
};

function getWMO(code: number) {
  return WMO_CODES[code] ?? { label: 'Unknown', emoji: '🌡️', bg: 'from-white/10 to-white/5' };
}

interface WeatherData {
  city: typeof WORLD_CITIES[0];
  current: { temp: number; feels: number; humidity: number; windspeed: number; visibility: number; wmo: number; };
  hourly: { time: string[]; temp: number[]; wmo: number[]; precip: number[]; };
  daily: { time: string[]; maxTemp: number[]; minTemp: number[]; wmo: number[]; precip: number[]; windspeed: number[]; uvIndex: number[]; };
}

async function fetchWeather(city: typeof WORLD_CITIES[0]): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,windspeed_10m,weathercode,visibility` +
    `&hourly=temperature_2m,weathercode,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,uv_index_max` +
    `&forecast_days=16&timezone=auto`;
  const res = await fetch(url);
  const d = await res.json();
  return {
    city,
    current: {
      temp: Math.round(d.current.temperature_2m),
      feels: Math.round(d.current.apparent_temperature),
      humidity: d.current.relative_humidity_2m,
      windspeed: Math.round(d.current.windspeed_10m),
      visibility: Math.round((d.current.visibility ?? 10000) / 1000),
      wmo: d.current.weathercode,
    },
    hourly: {
      time: d.hourly.time.slice(0, 48),
      temp: d.hourly.temperature_2m.slice(0, 48),
      wmo: d.hourly.weathercode.slice(0, 48),
      precip: d.hourly.precipitation_probability.slice(0, 48),
    },
    daily: {
      time: d.daily.time,
      maxTemp: d.daily.temperature_2m_max,
      minTemp: d.daily.temperature_2m_min,
      wmo: d.daily.weathercode,
      precip: d.daily.precipitation_sum,
      windspeed: d.daily.windspeed_10m_max,
      uvIndex: d.daily.uv_index_max,
    },
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

function TempBar({ min, max, absMin, absMax }: { min: number; max: number; absMin: number; absMax: number }) {
  const range = absMax - absMin || 1;
  const left  = ((min - absMin) / range) * 100;
  const width = ((max - min) / range) * 100;
  return (
    <div className="relative h-1.5 bg-white/10 rounded-full w-24 flex-shrink-0">
      <div className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 to-orange-400"
        style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }} />
    </div>
  );
}

function WeatherCard({ data, unit }: { data: WeatherData; unit: 'C' | 'F' }) {
  const [tab, setTab] = useState<'today' | 'hourly' | '14day'>('today');
  const c = data.current;
  const wmo = getWMO(c.wmo);
  const toF = (t: number) => unit === 'F' ? Math.round(t * 9/5 + 32) : t;
  const absMin = Math.min(...data.daily.minTemp);
  const absMax = Math.max(...data.daily.maxTemp);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl bg-gradient-to-br ${wmo.bg} border border-white/10 overflow-hidden`}>
      {/* Current conditions */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{data.city.flag}</span>
              <span className="text-white font-bold text-lg">{data.city.name}</span>
              <span className="text-white/40 text-sm">{data.city.country}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-thin text-white">{toF(c.temp)}°{unit}</span>
              <span className="text-4xl pb-1">{wmo.emoji}</span>
            </div>
            <div className="text-white/60 text-sm mt-1">{wmo.label}</div>
            <div className="text-white/40 text-xs mt-0.5">Feels like {toF(c.feels)}°{unit}</div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-right">
            <div className="flex flex-col items-end">
              <span className="text-white/40 text-xs flex items-center gap-1"><Droplets size={10}/> Humidity</span>
              <span className="text-white/80 text-sm font-medium">{c.humidity}%</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white/40 text-xs flex items-center gap-1"><Wind size={10}/> Wind</span>
              <span className="text-white/80 text-sm font-medium">{c.windspeed} km/h</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white/40 text-xs flex items-center gap-1"><Eye size={10}/> Visibility</span>
              <span className="text-white/80 text-sm font-medium">{c.visibility} km</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white/40 text-xs flex items-center gap-1"><Sun size={10}/> UV</span>
              <span className="text-white/80 text-sm font-medium">{data.daily.uvIndex[0]?.toFixed(1) ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 mb-3">
        {(['today', 'hourly', '14day'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${tab === t ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}>
            {t === 'today' ? 'Today' : t === 'hourly' ? '48-Hour' : '14 Days'}
          </button>
        ))}
      </div>

      {/* Today's highlights */}
      {tab === 'today' && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><ArrowUp size={10} className="text-orange-400"/> High</div>
              <div className="text-white font-bold text-xl">{toF(data.daily.maxTemp[0])}°{unit}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><ArrowDown size={10} className="text-cyan-400"/> Low</div>
              <div className="text-white font-bold text-xl">{toF(data.daily.minTemp[0])}°{unit}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><Droplets size={10}/> Precipitation</div>
              <div className="text-white font-bold text-xl">{data.daily.precip[0]?.toFixed(1) ?? 0} mm</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><Wind size={10}/> Max Wind</div>
              <div className="text-white font-bold text-xl">{Math.round(data.daily.windspeed[0])} km/h</div>
            </div>
          </div>
        </div>
      )}

      {/* Hourly */}
      {tab === 'hourly' && (
        <div className="px-5 pb-5 overflow-x-auto">
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {data.hourly.time.map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-2.5 min-w-[52px]">
                <span className="text-white/40 text-xs">{formatHour(t)}</span>
                <span className="text-lg">{getWMO(data.hourly.wmo[i]).emoji}</span>
                <span className="text-white font-medium text-sm">{toF(data.hourly.temp[i])}°</span>
                {data.hourly.precip[i] > 0 && (
                  <span className="text-cyan-400 text-xs">{data.hourly.precip[i]}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 14-day */}
      {tab === '14day' && (
        <div className="px-5 pb-5 space-y-1.5">
          {data.daily.time.map((t, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
              <span className="text-white/60 text-xs w-24 flex-shrink-0">{formatDay(t, i)}</span>
              <span className="text-xl">{getWMO(data.daily.wmo[i]).emoji}</span>
              <span className="text-white/50 text-xs flex-1 hidden sm:block">{getWMO(data.daily.wmo[i]).label}</span>
              <TempBar min={data.daily.minTemp[i]} max={data.daily.maxTemp[i]} absMin={absMin} absMax={absMax} />
              <div className="flex gap-2 text-xs">
                <span className="text-orange-300">{toF(data.daily.maxTemp[i])}°</span>
                <span className="text-white/30">/</span>
                <span className="text-cyan-300">{toF(data.daily.minTemp[i])}°</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function WeatherPage() {
  useSEO({
    title: 'World Weather — Global Temperatures & 14-Day Forecast | World Clock',
    description: 'Live weather conditions and 14-day forecasts for cities around the world. Current temperature, humidity, wind, UV index, hourly and daily forecasts.',
    canonical: `${SITE}/weather`,
  });

  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [search, setSearch] = useState('');
  const [selectedCities, setSelectedCities] = useState<typeof WORLD_CITIES>(WORLD_CITIES.slice(0, 6));
  const [weatherData, setWeatherData] = useState<Map<string, WeatherData>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [showCityPicker, setShowCityPicker] = useState(false);

  const loadWeather = useCallback(async (city: typeof WORLD_CITIES[0]) => {
    const key = city.name;
    if (weatherData.has(key) || loading.has(key)) return;
    setLoading(prev => new Set([...prev, key]));
    try {
      const data = await fetchWeather(city);
      setWeatherData(prev => new Map([...prev, [key, data]]));
    } catch {
      setErrors(prev => new Set([...prev, key]));
    } finally {
      setLoading(prev => { const n = new Set(prev); n.delete(key); return n; });
    }
  }, [weatherData, loading]);

  useEffect(() => {
    selectedCities.forEach(city => loadWeather(city));
  }, [selectedCities]);

  const filteredCities = WORLD_CITIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCity = (city: typeof WORLD_CITIES[0]) => {
    setSelectedCities(prev => {
      const exists = prev.find(c => c.name === city.name);
      if (exists) return prev.filter(c => c.name !== city.name);
      return [...prev, city];
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs mb-4">
            <Cloud size={12} /> Live Weather Data • Open-Meteo API
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">🌍 World Temperatures</h1>
          <p className="text-white/50 text-lg">Live weather + 14-day forecasts for cities around the globe</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8 justify-between">
          <div className="flex items-center gap-3">
            {/* Unit toggle */}
            <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
              {(['C', 'F'] as const).map(u => (
                <button key={u} onClick={() => setUnit(u)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${unit === u ? 'bg-white/20 text-white' : 'text-white/40'}`}>
                  °{u}
                </button>
              ))}
            </div>
            {/* City picker toggle */}
            <button onClick={() => setShowCityPicker(s => !s)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-sm transition-colors">
              <MapPin size={14} /> Manage Cities <ChevronDown size={14} className={`transition-transform ${showCityPicker ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="text-white/30 text-xs">Powered by Open-Meteo • Refreshes on load</div>
        </div>

        {/* City picker */}
        <AnimatePresence>
          {showCityPicker && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="relative mb-4">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search cities..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {filteredCities.map(city => {
                    const active = !!selectedCities.find(c => c.name === city.name);
                    return (
                      <button key={city.name} onClick={() => toggleCity(city)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'}`}>
                        {city.flag} {city.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AdSlotComponent position="weather" index={0} className="mb-8" />

        {/* Weather cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedCities.map(city => {
            const data = weatherData.get(city.name);
            const isLoading = loading.has(city.name);
            const hasError = errors.has(city.name);
            if (isLoading) return (
              <div key={city.name} className="rounded-2xl border border-white/10 bg-white/5 p-8 flex items-center justify-center gap-3">
                <Loader size={18} className="text-cyan-400 animate-spin" />
                <span className="text-white/50 text-sm">Loading {city.flag} {city.name}…</span>
              </div>
            );
            if (hasError) return (
              <div key={city.name} className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <div className="text-white/40 text-sm">⚠️ Could not load weather for {city.name}</div>
              </div>
            );
            if (!data) return null;
            return <WeatherCard key={city.name} data={data} unit={unit} />;
          })}
        </div>

        <AdSlotComponent position="weather" index={1} className="mt-8" />

        {/* Data attribution */}
        <div className="text-center mt-8 text-white/20 text-xs">
          Weather data provided by <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400/60 hover:text-cyan-400">Open-Meteo</a> (open-source weather API). Forecasts up to 16 days. Data refreshes on page load.
        </div>
      </div>
    </div>
  );
}
