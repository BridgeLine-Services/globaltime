import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Search, Clock, Globe, Gamepad2, Cloud, Shield, Zap } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';

const SITE = 'https://globaltime-pi.vercel.app';

interface FAQItem {
  q: string;
  a: React.ReactNode;
}
interface FAQCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'general',
    label: 'General',
    icon: <Globe size={16} />,
    color: '#00d4ff',
    items: [
      {
        q: 'What is World Clock?',
        a: 'World Clock is a free, real-time time zone website showing the exact current time in every country on Earth. We also offer an interactive 3D globe, country information, world weather forecasts, mini-games, a world blog, historical facts, and much more — all at no cost.',
      },
      {
        q: 'Is World Clock free to use?',
        a: 'Yes, completely free. No account, no subscription, no paywall. We are supported by Google AdSense advertisements that keep the lights on.',
      },
      {
        q: 'Does World Clock require an account or login?',
        a: 'No. Everything on the site works without registration. Game scores and preferences are saved locally in your browser.',
      },
      {
        q: 'What countries and territories does World Clock cover?',
        a: 'We cover 195+ countries and territories, including all UN member states, their overseas territories, and disputed/special administrative regions.',
      },
      {
        q: 'What languages is the site available in?',
        a: 'The site is in English by default but can be translated into 100+ languages using the built-in language switcher powered by Google Translate.',
      },
    ],
  },
  {
    id: 'clocks',
    label: 'Clocks & Time',
    icon: <Clock size={16} />,
    color: '#a855f7',
    items: [
      {
        q: 'How accurate is the time displayed?',
        a: 'Times are derived from the IANA Timezone Database and your device\'s system clock. The accuracy is generally within ±1 second of the actual local time. For millisecond accuracy, your device\'s clock must be synchronized via NTP (most modern devices do this automatically).',
      },
      {
        q: 'Why does my clock show a different time than another world clock site?',
        a: 'Small differences (1-2 seconds) between world clock sites are normal and usually due to page load time, rendering delays, or clock synchronization differences on the server side. We display times using your local device clock, which is synchronized by your OS automatically.',
      },
      {
        q: 'Does World Clock handle Daylight Saving Time (DST) automatically?',
        a: 'Yes. We use the IANA Timezone Database (the same database used by most operating systems) which tracks all current and historical DST transitions for every timezone automatically.',
      },
      {
        q: 'What is UTC and why is it used?',
        a: 'UTC (Coordinated Universal Time) is the international time standard that all other timezones are measured from. It has no daylight saving adjustments. For example, New York is UTC-5 in winter and UTC-4 in summer.',
      },
      {
        q: 'How do I convert between time zones?',
        a: <span>Visit the <a href="/world" className="text-cyan-400 hover:underline">World Clock page</a>, find your target country, and compare. The time shown for each country is always live and in that country's local time. A full timezone converter feature is on our roadmap.</span>,
      },
    ],
  },
  {
    id: 'weather',
    label: 'Weather',
    icon: <Cloud size={16} />,
    color: '#10b981',
    items: [
      {
        q: 'Where does the weather data come from?',
        a: 'Weather data is provided by Open-Meteo (open-meteo.com), a free and open-source weather API. Open-Meteo combines data from multiple national weather services including NOAA, ECMWF, and others to produce high-accuracy forecasts.',
      },
      {
        q: 'How far ahead does the weather forecast go?',
        a: 'Up to 16 days, including hourly breakdowns for the next 48 hours. The 14-day forecast is generally accurate to ±2°C for temperature. Beyond 7 days, treat forecasts as estimates.',
      },
      {
        q: 'Can I see weather for my exact city?',
        a: 'The weather page currently covers 22 major world cities. You can show/hide cities using the "Manage Cities" button. We plan to add a custom location search feature in a future update.',
      },
      {
        q: 'How do I switch between Celsius and Fahrenheit?',
        a: 'Use the °C / °F toggle at the top of the Weather page. Your preference applies to all city cards simultaneously.',
      },
      {
        q: 'Does the weather update automatically?',
        a: 'Weather data loads fresh each time you visit the page. There is no live auto-refresh within the page session, but reloading the page will fetch the latest data.',
      },
    ],
  },
  {
    id: 'games',
    label: 'Mini Games',
    icon: <Gamepad2 size={16} />,
    color: '#f59e0b',
    items: [
      {
        q: 'How many games are available?',
        a: 'Currently 19 games: Reaction Time, Memory Flip, Clicker, Puzzle, Runner, Speed Typing, Timezone Quiz, Snake, Color Match, Math Blitz, Flag Quiz, Capitals Quiz, Simon Wave, Number Memory, Word Scramble, Tic Tac Toe, Chrono Word, Countdown Timer, and Minesweeper.',
      },
      {
        q: 'How does the leaderboard work?',
        a: 'Each game has its own leaderboard that tracks the top 20 scores. Scores are saved in your browser\'s localStorage. To submit a score, enter your name when prompted after a game ends. Your personal best is tracked separately and shown with a 🏆 badge.',
      },
      {
        q: 'Are scores shared online with other players?',
        a: 'Currently leaderboards are local to your browser — they show scores from your own play sessions. Cross-player global leaderboards are on our roadmap for a future update.',
      },
      {
        q: 'Do games work on mobile?',
        a: 'Most games are fully playable on mobile with touch controls. A few reflex/keyboard games (like Typing Game and Runner) work best on desktop with a physical keyboard.',
      },
      {
        q: 'Why did my score reset?',
        a: 'Scores are stored in browser localStorage. They can be reset if you clear your browser data, use private/incognito mode, or switch browsers. We recommend using the same browser consistently for leaderboard continuity.',
      },
    ],
  },
  {
    id: 'globe',
    label: '3D Globe',
    icon: <Globe size={16} />,
    color: '#6366f1',
    items: [
      {
        q: 'How do I interact with the 3D globe?',
        a: <ul className="list-disc list-inside space-y-1 mt-1 text-white/60 text-sm">
          <li>🖱 <strong className="text-white/80">Desktop:</strong> Click & drag to rotate, scroll to zoom, click a marker to get info</li>
          <li>📱 <strong className="text-white/80">Mobile:</strong> Swipe to rotate, pinch to zoom, tap a marker</li>
          <li>🏔 <strong className="text-white/80">Colored markers</strong> = landmarks (gold = wonders, green = nature, blue = cities, pink = quirky, purple = space)</li>
          <li>💙 <strong className="text-white/80">Small blue dots</strong> = countries — click to navigate to that country's page</li>
        </ul>,
      },
      {
        q: 'Why don\'t the landmark markers show facts when I click them?',
        a: 'Make sure you\'re clicking directly on the larger colored dots (not the outer glow ring). On mobile, try a firm single tap. The hit area is intentionally generous but small rapid clicks may be interpreted as a drag. Try clicking and releasing without moving.',
      },
      {
        q: 'The globe is slow on my device — how can I improve performance?',
        a: 'The 3D globe uses WebGL and can be GPU-intensive. Try: closing other browser tabs, using Chrome or Firefox (best WebGL support), reducing browser window size, or disabling browser extensions. Very old devices may struggle with 3D rendering.',
      },
      {
        q: 'What are all the landmark categories?',
        a: <div className="space-y-1 mt-1 text-sm">
          {[
            ['🟡', 'Wonders', 'World Heritage Sites & iconic structures'],
            ['🟢', 'Nature', 'Mountains, reefs, waterfalls & natural wonders'],
            ['🔵', 'Cities', 'Landmark city structures & neighborhoods'],
            ['🟣', 'Quirky', 'Weird, mysterious & unusual locations'],
            ['🟣', 'Space', 'Launch sites & space-related locations'],
          ].map(([dot, name, desc]) => (
            <div key={name} className="flex gap-2"><span>{dot}</span><span className="text-white/80 font-medium">{name}</span><span className="text-white/40">— {desc}</span></div>
          ))}
        </div>,
      },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy & Ads',
    icon: <Shield size={16} />,
    color: '#ef4444',
    items: [
      {
        q: 'Does World Clock collect my personal data?',
        a: 'We do not collect your name, email, or payment information. We use anonymous analytics (Vercel Analytics) and Google AdSense, which may use cookies. See our full Privacy Policy for details.',
      },
      {
        q: 'Why am I seeing ads?',
        a: 'Ads are how we keep World Clock free for everyone. We use Google AdSense to display relevant advertisements. You can manage ad personalization settings in our Privacy Settings page.',
      },
      {
        q: 'How do I opt out of personalized ads?',
        a: <span>Visit our <a href="/legal" className="text-cyan-400 hover:underline">Privacy Settings</a> page, or go directly to <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Ad Settings</a> to turn off personalization.</span>,
      },
      {
        q: 'Is World Clock GDPR compliant?',
        a: 'We take GDPR compliance seriously. Fonts are self-hosted (no Google Fonts DNS calls), Google Translate is deferred, and you can manage cookie/tracking preferences in our Privacy Settings page. EU users can contact us to exercise their data rights.',
      },
      {
        q: 'How do I contact World Clock for privacy questions?',
        a: <span>Email us at <a href="mailto:privacy@worldclock.live" className="text-cyan-400 hover:underline">privacy@worldclock.live</a>. We respond within 48 hours.</span>,
      },
    ],
  },
  {
    id: 'technical',
    label: 'Technical',
    icon: <Zap size={16} />,
    color: '#f97316',
    items: [
      {
        q: 'What browsers does World Clock support?',
        a: 'World Clock works best in Chrome, Firefox, Safari, and Edge (2020 or later). Internet Explorer is not supported. We use modern web standards including WebGL for the 3D globe.',
      },
      {
        q: 'Why is the globe not showing on my device?',
        a: 'The 3D globe requires WebGL support. Most modern devices support this. Check that hardware acceleration is enabled in your browser settings (Chrome: Settings → System → Use hardware acceleration). Safari on some older iPhones may have limited WebGL support.',
      },
      {
        q: 'Can I use World Clock offline?',
        a: 'The site works as a Progressive Web App (PWA) — you can add it to your home screen. However, live time data and weather require an internet connection. Cached pages may load offline but times won\'t update.',
      },
      {
        q: 'How do I report a bug or suggest a feature?',
        a: <span>Email us at <a href="mailto:privacy@worldclock.live" className="text-cyan-400 hover:underline">privacy@worldclock.live</a> with a description of the issue or your idea. We read every message.</span>,
      },
      {
        q: 'Why is the site so fast?',
        a: 'We use Vite + React for builds, self-hosted fonts (no Google CDN), aggressive code splitting (each game loads on demand), and Vercel\'s global edge network. JS/CSS assets are cached with 1-year immutable headers for repeat visitors.',
      },
    ],
  },
];

export function FAQPage() {
  useSEO({
    title: 'FAQ — Frequently Asked Questions | World Clock',
    description: 'Answers to the most common questions about World Clock — time accuracy, DST, weather data, games, the 3D globe, privacy, and more.',
    canonical: `${SITE}/faq`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_CATEGORIES.flatMap(cat =>
        cat.items.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: typeof item.a === 'string' ? item.a : item.q },
        }))
      ),
    },
  });

  const [activeCategory, setActiveCategory] = useState('general');
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const activecat = FAQ_CATEGORIES.find(c => c.id === activeCategory)!;

  const filteredItems = search
    ? FAQ_CATEGORIES.flatMap(cat => cat.items.filter(item =>
        item.q.toLowerCase().includes(search.toLowerCase())
      ).map(item => ({ ...item, category: cat })))
    : activecat.items.map(item => ({ ...item, category: activecat }));

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs mb-4">
            <HelpCircle size={12} /> Frequently Asked Questions
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">❓ FAQ</h1>
          <p className="text-white/50 text-lg">Got questions? We've got answers.</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setOpenItem(null); }}
            placeholder="Search frequently asked questions…"
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50 text-sm"
          />
        </div>

        {/* Category tabs (only when not searching) */}
        {!search && (
          <div className="flex flex-wrap gap-2 mb-8">
            {FAQ_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setOpenItem(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${activeCategory === cat.id
                  ? 'border-transparent text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'}`}
                style={activeCategory === cat.id ? { backgroundColor: cat.color + '33', borderColor: cat.color + '66', color: cat.color } : {}}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        )}

        <AdSlotComponent position="faq" index={0} className="mb-6" />

        {/* FAQ Items */}
        <div className="space-y-2">
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-white/40">
              <HelpCircle size={32} className="mx-auto mb-3 opacity-40" />
              <p>No results for "{search}". Try different keywords.</p>
            </div>
          )}
          {filteredItems.map((item, i) => {
            const key = `${i}-${item.q}`;
            const isOpen = openItem === key;
            return (
              <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <button
                  onClick={() => setOpenItem(isOpen ? null : key)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3">
                    {search && (
                      <div className="p-1.5 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: item.category.color + '22', color: item.category.color }}>
                        {item.category.icon}
                      </div>
                    )}
                    <span className="text-white font-medium text-sm">{item.q}</span>
                  </div>
                  <ChevronDown size={16} className="text-white/40 flex-shrink-0 transition-transform"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div key="ans" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-5 pb-5 pt-0 text-white/65 text-sm leading-relaxed border-t border-white/10">
                        <div className="pt-4">{item.a}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <AdSlotComponent position="faq" index={1} className="mt-8" />

        {/* CTA */}
        <div className="text-center mt-10 p-6 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="text-2xl mb-2">🤔</div>
          <p className="text-white font-medium mb-1">Still have questions?</p>
          <p className="text-white/50 text-sm mb-4">We're here to help. Shoot us an email and we'll respond within 48 hours.</p>
          <a href="mailto:privacy@worldclock.live"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
