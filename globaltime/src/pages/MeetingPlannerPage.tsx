import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, X, Sun, Moon, Coffee, Briefcase, Bed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';
import { getNumericOffsetMinutes } from '../utils/time';
import { COUNTRIES } from '../data/countries';

const POPULAR_TIMEZONES = (() => {
  const seen = new Set<string>();
  return COUNTRIES
    .map(c => ({ label: `${c.name} (${c.capital})`, tz: c.timezone, flag: c.flag }))
    .filter(p => {
      if (seen.has(p.tz)) return false;
      seen.add(p.tz);
      return true;
    });
})();

interface Participant {
  id: string;
  tz: string;
  label: string;
  flag: string;
}

// Rating for a given hour: good, acceptable, poor
type HourRating = 'good' | 'acceptable' | 'poor';
function rateHour(hour: number): HourRating {
  if (hour >= 9 && hour < 18) return 'good';      // Business hours
  if (hour >= 7 && hour < 9) return 'acceptable';  // Early morning
  if (hour >= 18 && hour < 21) return 'acceptable'; // Evening
  return 'poor';                                    // Night/very early
}

function RatingIcon({ rating }: { rating: HourRating }) {
  if (rating === 'good') return <Briefcase size={12} className="text-green-400" />;
  if (rating === 'acceptable') return <Coffee size={12} className="text-yellow-400" />;
  return <Bed size={12} className="text-red-400" />;
}

export const MeetingPlannerPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', tz: 'America/New_York', label: 'New York', flag: '🇺🇸' },
    { id: '2', tz: 'Europe/London', label: 'London', flag: '🇬🇧' },
    { id: '3', tz: 'Asia/Tokyo', label: 'Tokyo', flag: '🇯🇵' },
  ]);
  const [newTz, setNewTz] = useState('Asia/Kolkata');

  useSEO({
    title: 'International Meeting Planner — Find the Best Time Across Time Zones | GlobalTime',
    description: 'Plan meetings across multiple time zones. Add participants from different cities and find the best overlapping working hours. Free meeting planner with DST support.',
    canonical: 'https://globaltime-pi.vercel.app/meeting-planner',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'GlobalTime Meeting Planner',
        'description': 'Find the best meeting time across multiple time zones.',
        'url': 'https://globaltime-pi.vercel.app/meeting-planner',
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'Web',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://globaltime-pi.vercel.app/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Meeting Planner', 'item': 'https://globaltime-pi.vercel.app/meeting-planner' },
        ],
      },
    ],
  });

  const addParticipant = () => {
    const country = COUNTRIES.find(c => c.timezone === newTz);
    const label = country?.capital || newTz.split('/').pop()?.replace(/_/g, ' ') || newTz;
    const flag = country?.flag || '🌍';
    setParticipants([...participants, { id: Date.now().toString(), tz: newTz, label, flag }]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  // Generate the time grid: for each UTC hour 0-23, calculate each participant's local hour and rate it
  const timeGrid = useMemo(() => {

    return Array.from({ length: 24 }, (_, utcHour) => {
      const entries = participants.map(p => {
        const offset = getNumericOffsetMinutes(p.tz);
        let localHour = utcHour + offset / 60;
        localHour = ((localHour % 24) + 24) % 24;
        const intHour = Math.floor(localHour);
        const rating = rateHour(intHour);
        const isDay = intHour >= 6 && intHour < 20;
        return { ...p, localHour: intHour, rating, isDay };
      });
      const allGood = entries.every(e => e.rating === 'good');
      const allAcceptable = entries.every(e => e.rating === 'good' || e.rating === 'acceptable');
      const overall: HourRating = allGood ? 'good' : allAcceptable ? 'acceptable' : 'poor';
      return { utcHour, entries, overall };
    });
  }, [participants]);

  // Find best slots
  const bestSlots = useMemo(() => {
    const good = timeGrid.filter(g => g.overall === 'good');
    const acceptable = timeGrid.filter(g => g.overall === 'acceptable');
    return { good, acceptable };
  }, [timeGrid]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-8" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Meeting <span className="text-cyan-400">Planner</span>
          </h1>
          <p className="text-white/50">
            Find the best time for a meeting across multiple time zones. Add participants and see overlapping working hours.
          </p>
        </motion.div>

        {/* Participants */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-cyan-400" />
            <h2 className="text-white font-bold text-lg">Participants</h2>
          </div>
          <div className="space-y-2 mb-4">
            {participants.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.flag}</span>
                  <div>
                    <div className="text-white text-sm font-medium">{p.label}</div>
                    <div className="text-white/40 text-xs font-mono">{p.tz}</div>
                  </div>
                </div>
                <button onClick={() => removeParticipant(p.id)} className="text-white/40 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              value={newTz}
              onChange={e => setNewTz(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-400/50 focus:outline-none transition-colors"
            >
              {POPULAR_TIMEZONES.map(tz => (
                <option key={tz.tz} value={tz.tz} className="bg-[#0a0a1a]">
                  {tz.flag} {tz.label}
                </option>
              ))}
            </select>
            <button
              onClick={addParticipant}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 text-sm font-medium hover:bg-cyan-400/30 transition-all whitespace-nowrap"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Best times summary */}
        {(bestSlots.good.length > 0 || bestSlots.acceptable.length > 0) && (
          <div className="p-6 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 mb-6">
            <h2 className="text-white font-bold text-lg mb-3">Recommended Meeting Times</h2>
            {bestSlots.good.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
                  <Briefcase size={14} /> Best — everyone is in business hours
                </div>
                <div className="flex flex-wrap gap-2">
                  {bestSlots.good.map(slot => (
                    <div key={slot.utcHour} className="px-3 py-1.5 rounded-lg bg-green-400/10 border border-green-400/30 text-green-400 text-sm font-mono">
                      {String(slot.utcHour).padStart(2, '0')}:00 UTC
                    </div>
                  ))}
                </div>
              </div>
            )}
            {bestSlots.acceptable.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-2">
                  <Coffee size={14} /> Acceptable — some participants outside business hours
                </div>
                <div className="flex flex-wrap gap-2">
                  {bestSlots.acceptable.map(slot => (
                    <div key={slot.utcHour} className="px-3 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-mono">
                      {String(slot.utcHour).padStart(2, '0')}:00 UTC
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Time grid */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-8 overflow-x-auto">
          <h2 className="text-white font-bold text-lg mb-4">24-Hour Time Grid (UTC)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/40 text-xs font-medium py-2 px-2">UTC</th>
                {participants.map(p => (
                  <th key={p.id} className="text-center text-white/40 text-xs font-medium py-2 px-2">
                    {p.flag} {p.label}
                  </th>
                ))}
                <th className="text-center text-white/40 text-xs font-medium py-2 px-2">Rating</th>
              </tr>
            </thead>
            <tbody>
              {timeGrid.map(row => (
                <tr
                  key={row.utcHour}
                  className={`border-b border-white/5 ${row.overall === 'good' ? 'bg-green-400/5' : row.overall === 'acceptable' ? 'bg-yellow-400/5' : ''}`}
                >
                  <td className="py-2 px-2 text-white/60 font-mono text-xs">
                    {String(row.utcHour).padStart(2, '0')}:00
                  </td>
                  {row.entries.map(entry => (
                    <td key={entry.id} className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {entry.isDay ? <Sun size={10} className="text-yellow-400/60" /> : <Moon size={10} className="text-blue-400/60" />}
                        <span className={`font-mono text-xs ${entry.rating === 'good' ? 'text-green-400' : entry.rating === 'acceptable' ? 'text-yellow-400' : 'text-red-400/60'}`}>
                          {String(entry.localHour).padStart(2, '0')}:00
                        </span>
                      </div>
                    </td>
                  ))}
                  <td className="py-2 px-2 text-center">
                    <div className="flex justify-center">
                      <RatingIcon rating={row.overall} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AdSlotComponent position="mid-page" index={0} className="mb-8" />

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-8 text-xs">
          <div className="flex items-center gap-1.5 text-white/50"><Briefcase size={12} className="text-green-400" /> Business hours (9 AM – 6 PM)</div>
          <div className="flex items-center gap-1.5 text-white/50"><Coffee size={12} className="text-yellow-400" /> Early morning / evening (7-9 AM, 6-9 PM)</div>
          <div className="flex items-center gap-1.5 text-white/50"><Bed size={12} className="text-red-400" /> Night hours</div>
        </div>

        {/* Educational content */}
        <section className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-6">
          <h2 className="text-white font-bold text-xl mb-4">Tips for Scheduling International Meetings</h2>
          <div className="space-y-3 text-white/60 text-sm leading-relaxed">
            <p>
              When scheduling across time zones, the goal is to find overlapping working hours — times when all participants are awake and ideally within their normal business hours. This gets harder as you add more time zones, especially when the spread exceeds 8 hours.
            </p>
            <p>
              A common strategy is to rotate meeting times so the burden of inconvenient hours is shared fairly. If your team spans across the Pacific (e.g., US and Asia), there's often a narrow window in the early morning/late evening that works for both sides.
            </p>
            <p>
              Always check whether participants are in daylight saving time — a meeting scheduled in June may shift by an hour when DST ends in October. Our planner uses the IANA Time Zone Database to calculate current offsets, so the times shown reflect today's DST status.
            </p>
            <p>
              Need to convert a specific time between two cities? Use our <Link to="/converter" className="text-cyan-400 hover:underline">Time Zone Converter</Link>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
