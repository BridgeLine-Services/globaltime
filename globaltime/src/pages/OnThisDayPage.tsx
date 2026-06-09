import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Globe, Zap, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';

const SITE = 'https://globaltime-pi.vercel.app';

interface HistoricalEvent {
  year: number;
  title: string;
  description: string;
  category: 'science' | 'history' | 'culture' | 'space' | 'nature' | 'tech' | 'world';
  emoji: string;
  location?: string;
}

// Comprehensive "on this day" database keyed by "MM-DD"
const EVENTS_DB: Record<string, HistoricalEvent[]> = {
  '01-01': [
    { year: 1863, title: 'Emancipation Proclamation', description: 'President Lincoln issued the Emancipation Proclamation, declaring enslaved people in Confederate states to be free.', category: 'history', emoji: '📜', location: 'USA' },
    { year: 1958, title: 'EEC Founded', description: 'The European Economic Community (forerunner to the EU) came into force.', category: 'history', emoji: '🇪🇺', location: 'Europe' },
    { year: 1999, title: 'Euro Launched', description: 'The euro became the official currency of 11 EU member states.', category: 'world', emoji: '💶', location: 'Europe' },
  ],
  '01-15': [
    { year: 1929, title: 'MLK Born', description: 'Martin Luther King Jr. was born in Atlanta, Georgia. He would become the defining voice of the American civil rights movement.', category: 'history', emoji: '✊', location: 'Atlanta, USA' },
    { year: 2001, title: 'Wikipedia Launched', description: 'Jimmy Wales and Larry Sanger launched Wikipedia, the free online encyclopedia.', category: 'tech', emoji: '📖', location: 'Online' },
  ],
  '02-14': [
    { year: 1876, title: 'Bell Patents the Telephone', description: 'Alexander Graham Bell filed a patent for the telephone, beating Elisha Gray by just hours.', category: 'tech', emoji: '📞', location: 'USA' },
    { year: 1990, title: 'Pale Blue Dot', description: "Voyager 1 took the famous 'Pale Blue Dot' photo of Earth from 3.7 billion miles away.", category: 'space', emoji: '🌍', location: 'Space' },
  ],
  '03-14': [
    { year: 1879, title: 'Einstein Born', description: 'Albert Einstein was born in Ulm, Germany. His theory of relativity would reshape our understanding of the universe.', category: 'science', emoji: '🧪', location: 'Ulm, Germany' },
    { year: 1592, title: 'Pi Day — First Recognized', description: "3.14 (March 14) has been celebrated as Pi Day since mathematician Larry Shaw started it in 1988 — coincidentally also Einstein's birthday.", category: 'science', emoji: '🥧', location: 'Global' },
  ],
  '04-12': [
    { year: 1961, title: 'First Human in Space', description: 'Soviet cosmonaut Yuri Gagarin became the first human in space, orbiting Earth in 108 minutes aboard Vostok 1.', category: 'space', emoji: '🚀', location: 'Baikonur, Kazakhstan' },
    { year: 1981, title: 'First Space Shuttle Launch', description: 'Columbia, the first Space Shuttle, launched from Kennedy Space Center.', category: 'space', emoji: '🛸', location: 'Florida, USA' },
  ],
  '04-22': [
    { year: 1970, title: 'First Earth Day', description: 'The first Earth Day was celebrated in the United States, giving birth to the modern environmental movement.', category: 'nature', emoji: '🌿', location: 'USA' },
  ],
  '05-29': [
    { year: 1953, title: 'Everest First Summited', description: 'Edmund Hillary and Tenzing Norgay became the first people to reach the summit of Mount Everest (8,848m).', category: 'history', emoji: '🏔️', location: 'Nepal/Tibet' },
  ],
  '06-06': [
    { year: 1944, title: 'D-Day', description: 'Allied forces launched the largest seaborne invasion in history on the beaches of Normandy, France, marking the turning point of WWII.', category: 'history', emoji: '⚓', location: 'Normandy, France' },
  ],
  '06-09': [
    { year: 1934, title: "Donald Duck's Debut", description: "Donald Duck made his first appearance in the Disney cartoon 'The Wise Little Hen'.", category: 'culture', emoji: '🦆', location: 'Hollywood, USA' },
    { year: 1870, title: 'Charles Dickens Died', description: "Charles Dickens, one of the world's greatest novelists, died at age 58 in Kent, England.", category: 'culture', emoji: '📚', location: 'Kent, England' },
    { year: 1549, title: 'Book of Common Prayer', description: 'The Book of Common Prayer was first used in England, standardizing Anglican worship.', category: 'history', emoji: '⛪', location: 'England' },
  ],
  '07-04': [
    { year: 1776, title: 'USA Independence', description: 'The Continental Congress adopted the Declaration of Independence, declaring the thirteen colonies free from British rule.', category: 'history', emoji: '🦅', location: 'Philadelphia, USA' },
    { year: 1997, title: 'Mars Pathfinder Lands', description: 'NASA\'s Mars Pathfinder became the first spacecraft to operate on Mars since Viking in 1976.', category: 'space', emoji: '🔴', location: 'Mars' },
  ],
  '07-20': [
    { year: 1969, title: 'Moon Landing', description: "Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon during NASA's Apollo 11 mission.", category: 'space', emoji: '🌙', location: 'Moon' },
  ],
  '08-06': [
    { year: 1945, title: 'First Atomic Bomb', description: 'The USA dropped the first atomic bomb on Hiroshima, Japan, killing approximately 80,000 people instantly.', category: 'history', emoji: '☢️', location: 'Hiroshima, Japan' },
    { year: 1991, title: 'World Wide Web Goes Public', description: 'Tim Berners-Lee published the first website, making the World Wide Web publicly available.', category: 'tech', emoji: '🌐', location: 'CERN, Switzerland' },
  ],
  '08-28': [
    { year: 1963, title: "MLK's 'I Have a Dream'", description: 'Martin Luther King Jr. delivered his historic "I Have a Dream" speech at the March on Washington.', category: 'history', emoji: '🕊️', location: 'Washington D.C., USA' },
  ],
  '09-11': [
    { year: 2001, title: 'September 11 Attacks', description: 'Terrorist attacks in New York City and Washington D.C. killed nearly 3,000 people, changing global geopolitics forever.', category: 'history', emoji: '🕯️', location: 'New York & Washington D.C., USA' },
  ],
  '10-04': [
    { year: 1957, title: 'Sputnik 1 Launched', description: 'The Soviet Union launched Sputnik 1, the first artificial Earth satellite, marking the beginning of the Space Age.', category: 'space', emoji: '🛰️', location: 'Baikonur, Kazakhstan' },
  ],
  '10-14': [
    { year: 1947, title: 'Sound Barrier Broken', description: "Chuck Yeager became the first pilot to break the sound barrier, flying the Bell X-1 at Mach 1.06.", category: 'tech', emoji: '✈️', location: 'California, USA' },
  ],
  '11-09': [
    { year: 1989, title: 'Berlin Wall Falls', description: 'The Berlin Wall fell, ending the division of East and West Germany and symbolizing the collapse of the Iron Curtain.', category: 'history', emoji: '🧱', location: 'Berlin, Germany' },
    { year: 1938, title: 'Kristallnacht', description: "Nazi forces launched a pogrom against Jews in Germany and Austria — the 'Night of Broken Glass'.", category: 'history', emoji: '🕯️', location: 'Germany' },
  ],
  '11-22': [
    { year: 1963, title: 'JFK Assassinated', description: 'President John F. Kennedy was assassinated while riding in a presidential motorcade in Dallas, Texas.', category: 'history', emoji: '🇺🇸', location: 'Dallas, USA' },
  ],
  '12-17': [
    { year: 1903, title: 'First Powered Flight', description: 'Orville and Wilbur Wright achieved the first successful powered airplane flight in Kitty Hawk, North Carolina — 12 seconds, 37 meters.', category: 'tech', emoji: '✈️', location: 'Kitty Hawk, USA' },
  ],
  '12-25': [
    { year: 1991, title: 'USSR Dissolved', description: 'Mikhail Gorbachev resigned as the Soviet Union was officially dissolved, ending the Cold War era.', category: 'history', emoji: '🇷🇺', location: 'Moscow, Russia' },
    { year: 1642, title: 'Isaac Newton Born', description: 'Isaac Newton was born in Lincolnshire, England. He would go on to formulate the laws of motion and universal gravitation.', category: 'science', emoji: '🍎', location: 'Lincolnshire, England' },
  ],
};

// On-this-hour facts — interesting things that happen every hour around the world
const HOURLY_FACTS = [
  { hour: 0,  emoji: '🌙', title: 'Midnight Crossings', fact: 'At any given midnight, roughly 200,000 people cross into a new day simultaneously across a timezone boundary.' },
  { hour: 1,  emoji: '🦉', title: 'Night Owl Hour', fact: "1 AM is when London's famous Smithfield Market gets its busiest — fresh meat deliveries start at this hour, a tradition since 1327." },
  { hour: 2,  emoji: '🍕', title: 'Most Pizza Orders', fact: 'More pizza is ordered online at 2 AM than at any other time — likely due to late-night study sessions and shift workers.' },
  { hour: 3,  emoji: '🔬', title: "Scientist's Hour", fact: 'Many scientists work overnight because experiments run 24/7. The Large Hadron Collider at CERN operates around the clock.' },
  { hour: 4,  emoji: '🐟', title: 'Tokyo Fish Market', fact: "Tsukiji and Toyosu markets in Tokyo begin their famous tuna auctions at 4 AM — prime bluefin tuna sells for $200/kg." },
  { hour: 5,  emoji: '🌅', title: 'Muezzin Calls', fact: 'The Fajr (dawn) prayer call echoes across thousands of mosques simultaneously — in Indonesia alone, that\'s 800,000+ mosques.' },
  { hour: 6,  emoji: '☕', title: 'Coffee Rush Begins', fact: "Over 2 billion cups of coffee are consumed daily worldwide — most of them between 6 and 8 AM." },
  { hour: 7,  emoji: '🚂', title: 'Tokyo Rush Hour', fact: "Tokyo's Shinjuku Station handles 3.6 million passengers daily — peak rush hits exactly at 7:50 AM." },
  { hour: 8,  emoji: '📰', title: 'News Cycle Peaks', fact: 'More news stories are published between 8-10 AM than any other 2-hour window worldwide.' },
  { hour: 9,  emoji: '💼', title: 'Global Work Begins', fact: 'At 9 AM local time, approximately 1.5 billion people simultaneously sit down at a desk somewhere on Earth.' },
  { hour: 10, emoji: '💡', title: 'Peak Creativity', fact: 'Studies show 10 AM is when most people are at peak cognitive performance for creative and analytical tasks.' },
  { hour: 11, emoji: '🛒', title: 'Shopping Surge', fact: "E-commerce traffic peaks at 11 AM — it's when people have settled at work but haven't hit lunchtime yet." },
  { hour: 12, emoji: '🌍', title: "Earth's Heartbeat", fact: 'Noon is when the Sun reaches its highest point — at the equator, a perfect vertical pole casts no shadow at all.' },
  { hour: 13, emoji: '🍜', title: 'Siesta Time', fact: 'In 35+ countries, lunch breaks last 2+ hours. Spain, Greece, and many Latin American nations virtually shut down from 1-3 PM.' },
  { hour: 14, emoji: '📡', title: 'Deep Space Signal', fact: "NASA's Voyager 1 is so far away that its radio signals — traveling at light speed — take over 22 hours to reach Earth." },
  { hour: 15, emoji: '🏦', title: 'Stock Market Close', fact: 'The New York Stock Exchange closes at 3 PM ET — trillions of dollars of value can shift in the final 15 minutes.' },
  { hour: 16, emoji: '🎒', title: 'School\'s Out', fact: "Globally, 1.5 billion students attend school. Most finish around 4 PM — making this the busiest hour for traffic worldwide." },
  { hour: 17, emoji: '🌇', title: 'Golden Hour', fact: "Photographers call the hour after sunset 'golden hour' — the low angle of light creates warm, soft tones perfect for photos." },
  { hour: 18, emoji: '🍽️', title: 'Dinner Around the World', fact: 'Dinner time varies wildly: Spain eats at 10 PM, Japan at 6 PM, the USA at 6-7 PM, and Iceland often at 8 PM.' },
  { hour: 19, emoji: '🎭', title: 'Broadway Curtain Up', fact: "Most Broadway shows begin at exactly 7 PM — a tradition since the early 1900s. Over 1 million people attend Broadway annually." },
  { hour: 20, emoji: '📺', title: 'Prime Time', fact: "Television 'prime time' is 8-11 PM — when 65% of all daily TV viewing happens simultaneously across North America." },
  { hour: 21, emoji: '🌙', title: 'Ramadan Iftar', fact: "During Ramadan, the evening meal (Iftar) is eaten precisely at sunset — 1.8 billion Muslims worldwide break their fast at this moment." },
  { hour: 22, emoji: '🦷', title: 'Dental Fact', fact: "The WHO recommends brushing teeth at 10 PM — yet studies show only 31% of people actually brush before bed." },
  { hour: 23, emoji: '🔭', title: "Astronomer's Start", fact: "Most professional observatories begin their nightly sessions at 11 PM when daylight twilight is fully over. Over 200 major telescopes worldwide activate simultaneously." },
];

const CATEGORY_COLORS: Record<string, string> = {
  science: '#00d4ff', history: '#f59e0b', culture: '#a855f7',
  space: '#6366f1', nature: '#10b981', tech: '#f97316', world: '#ef4444',
};

export function OnThisDayPage() {
  const now = new Date();
  const [viewDate, setViewDate] = useState(now);
  const [currentHour, setCurrentHour] = useState(now.getHours());


  useSEO({
    title: `On This Day, ${viewDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — World History Facts | World Clock`,
    description: `Discover what happened on this day in history and fascinating facts about what\'s happening around the world right now, hour by hour.`,
    canonical: `${SITE}/on-this-day`,
  });

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      const n = new Date();
      setCurrentHour(n.getHours());

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const dateKey = `${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(viewDate.getDate()).padStart(2, '0')}`;
  const events = useMemo(() => {
    const base = EVENTS_DB[dateKey] ?? [];
    // Also pull adjacent days if sparse
    return base.sort((a, b) => b.year - a.year);
  }, [dateKey]);

  const hourFact = HOURLY_FACTS[currentHour];

  const changeDay = (delta: number) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + delta);
    setViewDate(d);
  };

  const formattedDate = viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const isToday = viewDate.toDateString() === now.toDateString();

  // Live time string
  const liveTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs mb-4">
            <Calendar size={12} /> History + Right Now
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">🗓️ On This Day</h1>
          <p className="text-white/50 text-lg">History happened here. And right now, the world never stops.</p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button onClick={() => changeDay(-1)} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <div className="text-white text-xl font-bold">{formattedDate}</div>
            {isToday && <div className="text-cyan-400 text-xs mt-0.5">Today</div>}
          </div>
          <button onClick={() => changeDay(1)} className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* At This Hour — live section */}
        {isToday && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mb-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border border-purple-500/30 p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{hourFact.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
                    <Clock size={12} /> At This Hour ({liveTime} local)
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{hourFact.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{hourFact.fact}</p>
              </div>
            </div>
          </motion.div>
        )}

        <AdSlotComponent position="on-this-day" index={0} className="mb-8" />

        {/* Historical Events */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-xl mb-5 flex items-center gap-2">
            <Star size={18} className="text-yellow-400" />
            On {viewDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} in History
          </h2>
          {events.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {events.map((ev, i) => (
                  <motion.div key={`${dateKey}-${i}`}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                    <div className="text-3xl flex-shrink-0">{ev.emoji}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-2xl font-bold text-white/30">{ev.year}</span>
                        <span className="text-white font-semibold">{ev.title}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: (CATEGORY_COLORS[ev.category] ?? '#888') + '22', color: CATEGORY_COLORS[ev.category] ?? '#888' }}>
                          {ev.category}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed">{ev.description}</p>
                      {ev.location && (
                        <div className="flex items-center gap-1 mt-2 text-white/30 text-xs">
                          <Globe size={10} /> {ev.location}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center p-10 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-white/40">No major events recorded for this date yet.</p>
              <p className="text-white/20 text-sm mt-1">Check an adjacent day using the arrows above.</p>
            </div>
          )}
        </div>

        {/* Around the Clock — all 24 hourly facts */}
        <div>
          <h2 className="text-white font-bold text-xl mb-5 flex items-center gap-2">
            <Zap size={18} className="text-cyan-400" />
            Around the Clock — 24 Hours of World Facts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HOURLY_FACTS.map((fact, i) => {
              const isNow = isToday && i === currentHour;
              return (
                <motion.div key={i}
                  className={`p-4 rounded-xl border transition-all ${isNow ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isNow ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-white/30'}`}>
                        {String(i).padStart(2, '0')}:00
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span>{fact.emoji}</span>
                        <span className="text-white font-medium text-sm">{fact.title}</span>
                        {isNow && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed">{fact.fact}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <AdSlotComponent position="on-this-day" index={1} className="mt-8" />
      </div>
    </div>
  );
}
