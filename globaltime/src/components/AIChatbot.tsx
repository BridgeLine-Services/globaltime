import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Globe, ChevronDown, RotateCcw, Bot, User, Loader2 } from 'lucide-react';
import { COUNTRIES } from '../data/countries';
import { useLangStore, injectGoogleTranslate } from '../stores/langStore';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Message { id: string; role: 'user' | 'assistant'; text: string; ts: number; lang?: string; }
type Lang = { code: string; label: string; flag: string; };

// ─── Supported languages ────────────────────────────────────────────────────
const LANGUAGES: Lang[] = [
  { code: 'en', label: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'pt', label: 'Português',  flag: '🇧🇷' },
  { code: 'zh', label: '中文',        flag: '🇨🇳' },
  { code: 'ja', label: '日本語',      flag: '🇯🇵' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी',     flag: '🇮🇳' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'ko', label: '한국어',      flag: '🇰🇷' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr', label: 'Türkçe',     flag: '🇹🇷' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'pl', label: 'Polski',     flag: '🇵🇱' },
];

// ─── Personality & Knowledge ─────────────────────────────────────────────────
const PERSONALITY = `You are Clocks, a friendly, funny, warm, human-like AI assistant built into WorldClock.live — a world clock and timezone platform. You're like a knowledgeable best friend: natural, conversational, occasionally witty, never robotic. You help with general questions, timezones, world facts, weather (when data is provided), and casual chat. Keep replies concise unless the user asks for detail. Use light humor naturally. Never say you are ChatGPT or any specific AI model — you're Clocks.`;

// ─── Timezone helpers ────────────────────────────────────────────────────────
function formatTimeInZone(tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true, weekday: 'short', month: 'short', day: 'numeric',
    }).format(new Date());
  } catch { return 'Unknown'; }
}

const TZ_MAP: Record<string, string> = {
  usa: 'America/New_York', 'united states': 'America/New_York', america: 'America/New_York',
  'new york': 'America/New_York', 'los angeles': 'America/Los_Angeles', california: 'America/Los_Angeles',
  chicago: 'America/Chicago', denver: 'America/Denver',
  venezuela: 'America/Caracas', colombia: 'America/Bogota', peru: 'America/Lima',
  argentina: 'America/Argentina/Buenos_Aires', brazil: 'America/Sao_Paulo',
  mexico: 'America/Mexico_City', canada: 'America/Toronto',
  uk: 'Europe/London', england: 'Europe/London', london: 'Europe/London',
  france: 'Europe/Paris', paris: 'Europe/Paris', germany: 'Europe/Berlin',
  berlin: 'Europe/Berlin', spain: 'Europe/Madrid', italy: 'Europe/Rome',
  russia: 'Europe/Moscow', moscow: 'Europe/Moscow',
  india: 'Asia/Kolkata', china: 'Asia/Shanghai', japan: 'Asia/Tokyo',
  tokyo: 'Asia/Tokyo', korea: 'Asia/Seoul', seoul: 'Asia/Seoul',
  dubai: 'Asia/Dubai', uae: 'Asia/Dubai', singapore: 'Asia/Singapore',
  australia: 'Australia/Sydney', sydney: 'Australia/Sydney',
  'new zealand': 'Pacific/Auckland', egypt: 'Africa/Cairo',
  nigeria: 'Africa/Lagos', 'south africa': 'Africa/Johannesburg',
  iceland: 'Atlantic/Reykjavik', norway: 'Europe/Oslo', sweden: 'Europe/Stockholm',
  denmark: 'Europe/Copenhagen', finland: 'Europe/Helsinki',
  greece: 'Europe/Athens', turkey: 'Europe/Istanbul',
  israel: 'Asia/Jerusalem', iran: 'Asia/Tehran', pakistan: 'Asia/Karachi',
  bangladesh: 'Asia/Dhaka', thailand: 'Asia/Bangkok', vietnam: 'Asia/Ho_Chi_Minh',
  indonesia: 'Asia/Jakarta', philippines: 'Asia/Manila',
};

function detectTimezoneConversion(text: string): string | null {
  const lower = text.toLowerCase();
  const isTimeQuery = /time|clock|what.?s the time|convert|timezone|zone/.test(lower);
  if (!isTimeQuery) return null;
  const found: string[] = [];
  for (const [key, tz] of Object.entries(TZ_MAP)) {
    if (lower.includes(key)) found.push(tz);
  }
  if (found.length === 0) return null;
  const results = [...new Set(found)].map(tz => {
    const name = Object.keys(TZ_MAP).find(k => TZ_MAP[k] === tz) ?? tz;
    return `📍 **${name.charAt(0).toUpperCase() + name.slice(1)}**: ${formatTimeInZone(tz)}`;
  });
  return results.join('\n');
}

// ─── Weather via wttr.in (no key needed) ─────────────────────────────────────
async function fetchWeather(location: string): Promise<string> {
  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
    if (!res.ok) throw new Error('no data');
    const data = await res.json();
    const cur = data.current_condition?.[0];
    if (!cur) throw new Error('no condition');
    const desc = cur.weatherDesc?.[0]?.value ?? 'Unknown';
    const temp_c = cur.temp_C;
    const temp_f = cur.temp_F;
    const humidity = cur.humidity;
    const feels_c = cur.FeelsLikeC;
    const wind = cur.windspeedKmph;
    const area = data.nearest_area?.[0];
    const city = area?.areaName?.[0]?.value ?? location;
    const country = area?.country?.[0]?.value ?? '';
    return `🌤️ **Weather in ${city}${country ? ', ' + country : ''}**\n` +
      `• Condition: ${desc}\n` +
      `• Temperature: ${temp_c}°C / ${temp_f}°F\n` +
      `• Feels like: ${feels_c}°C\n` +
      `• Humidity: ${humidity}%\n` +
      `• Wind: ${wind} km/h`;
  } catch {
    return `Sorry, I couldn't fetch weather for "${location}" right now. Try a city name like "London" or "Tokyo".`;
  }
}

function detectWeatherQuery(text: string): string | null {
  const lower = text.toLowerCase();
  if (!/weather|temperature|temp|forecast|raining|sunny|hot|cold|humid/.test(lower)) return null;
  // Extract location
  const patterns = [
    /weather (?:in|at|for|of) ([a-z\s]+?)(?:\?|$|today|now|like)/i,
    /(?:in|at) ([a-z\s]+?) weather/i,
    /(?:what'?s?|how'?s?) (?:the )?weather (?:like )?(?:in|at)? ?([a-z\s]+)/i,
    /temperature (?:in|at|for) ([a-z\s]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].trim();
  }
  // fallback: look for known countries/cities
  for (const key of Object.keys(TZ_MAP)) {
    if (lower.includes(key)) return key;
  }
  return null;
}

// ─── Free AI via Pollinations (no key, free tier) ────────────────────────────
async function callAI(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages,
        temperature: 0.85,
        max_tokens: 400,
      }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? "I'm having trouble thinking right now — try again in a second!";
  } catch {
    // Fallback: Ollama-style free endpoint
    try {
      const res2 = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer free' },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, max_tokens: 300 }),
      });
      const d2 = await res2.json();
      return d2.choices?.[0]?.message?.content?.trim() ?? builtInResponse(messages[messages.length-1]?.content ?? '');
    } catch {
      return builtInResponse(messages[messages.length-1]?.content ?? '');
    }
  }
}

// ─── Built-in smart fallback responses ───────────────────────────────────────
function builtInResponse(input: string): string {
  const low = input.toLowerCase();
  if (/how.*(you|your day)/.test(low))
    return "My day's been great, thanks for asking! I've been helping people figure out what time it is everywhere on Earth — which honestly never gets old. How about yours?";
  if (/hello|hi |hey|good morning|good evening/.test(low))
    return "Hey! 👋 Great to see you. I'm Clocks — your friendly world time assistant. Ask me about timezones, world facts, weather, or just chat. What's on your mind?";
  if (/who are you|what are you/.test(low))
    return "I'm Clocks! 🕐 Your AI companion on WorldClock.live. I know my timezones, world facts, and how to hold a decent conversation. Think of me as that friend who's weirdly obsessed with geography and never sleeps.";
  if (/thank/.test(low))
    return "Anytime! 😊 That's literally what I'm here for. Ask me anything else!";
  if (/joke/.test(low))
    return "Why did the clock get kicked out of school? Because it was always winding up the other kids! ⏰😄 Want another one?";
  if (/bye|goodbye|see you/.test(low))
    return "See ya! 👋 Come back any time — I'll be here, keeping track of every timezone on Earth. Stay curious!";
  if (/what time is it/.test(low))
    return "Right now? That depends where you are! Tell me a city or country and I'll show you the exact time there. 🌍";
  if (/capital/.test(low)) {
    const match = COUNTRIES.find((c: {name:string;capital:string}) => low.includes(c.name.toLowerCase()));
    if (match) return `The capital of ${match.name} is ${match.capital}! 🏛️`;
  }
  return "Hmm, that's interesting! I'm best at timezones, world facts, and weather — but I'm always happy to chat. What else can I help with? 🌍";
}

// ─── Google Translate link builder ───────────────────────────────────────────
async function translateText(text: string, targetLang: string): Promise<string> {
  if (targetLang === 'en') return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0]?.map((s: string[]) => s[0]).join('') ?? text;
  } catch {
    return text;
  }
}

async function detectLanguage(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[2] ?? 'en';
  } catch { return 'en'; }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const AIChatbot: React.FC = () => {
  const { setLang: setSiteLang } = useLangStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    text: "Hey! 👋 I'm **Clocks**, your AI assistant. I can help with timezones, world facts, weather, time conversions, and just about anything! What's on your mind?",
    ts: Date.now(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>(LANGUAGES[0]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  // Sync language change to site-wide translator
  const handleLangChange = (l: Lang) => {
    setLang(l);
    setShowLangMenu(false);
    setSiteLang(l);
    injectGoogleTranslate(l.code);
  };
  const [autoDetected, setAutoDetected] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    // Detect language
    const detectedLang = await detectLanguage(text);
    if (detectedLang !== 'en' && detectedLang !== lang.code) {
      const detected = LANGUAGES.find(l => l.code === detectedLang);
      if (detected) {
        setAutoDetected(detected.label);
        setLang(detected);
        setTimeout(() => setAutoDetected(''), 3000);
      }
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, ts: Date.now(), lang: detectedLang };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      let responseText = '';

      // 1. Check for timezone conversion
      const tzResult = detectTimezoneConversion(text);
      
      // 2. Check for weather query
      const weatherLocation = detectWeatherQuery(text);

      if (weatherLocation) {
        const weatherData = await fetchWeather(weatherLocation);
        // Build AI response incorporating weather
        const aiMessages = [
          { role: 'system', content: PERSONALITY },
          ...messages.slice(-6).map(m => ({ role: m.role, content: m.text })),
          { role: 'user', content: `The user asked: "${text}". Here is the live weather data: ${weatherData}. Give a friendly, conversational response incorporating this data. Be concise.` },
        ];
        const aiReply = await callAI(aiMessages);
        responseText = aiReply + '\n\n' + weatherData;
      } else if (tzResult) {
        // Build AI response incorporating timezone data
        const aiMessages = [
          { role: 'system', content: PERSONALITY },
          ...messages.slice(-6).map(m => ({ role: m.role, content: m.text })),
          { role: 'user', content: `The user asked: "${text}". Here are the current times: ${tzResult}. Give a friendly, conversational response incorporating these times.` },
        ];
        const aiReply = await callAI(aiMessages);
        responseText = aiReply + '\n\n' + tzResult;
      } else {
        // General AI response
        const aiMessages = [
          { role: 'system', content: PERSONALITY },
          ...messages.slice(-8).map(m => ({ role: m.role, content: m.text })),
          { role: 'user', content: text },
        ];
        responseText = await callAI(aiMessages);
      }

      // Translate response if needed
      if (lang.code !== 'en' || (detectedLang && detectedLang !== 'en')) {
        const targetLang = detectedLang !== 'en' ? detectedLang : lang.code;
        if (targetLang !== 'en') {
          responseText = await translateText(responseText, targetLang);
        }
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-r',
        role: 'assistant',
        text: responseText,
        ts: Date.now(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-e',
        role: 'assistant',
        text: builtInResponse(text),
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, lang]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => setMessages([{
    id: 'welcome-' + Date.now(),
    role: 'assistant',
    text: "Fresh start! 🌍 I'm Clocks — ask me anything about timezones, weather, world facts, or just say hi!",
    ts: Date.now(),
  }]);

  // Render markdown-lite: bold **text**, line breaks
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <React.Fragment key={i}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="font-semibold text-white">{part.slice(2, -2)}</strong>
              : <span key={j}>{part}</span>
          )}
          {i < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_30px_rgba(0,212,255,0.4)] flex items-center justify-center hover:shadow-[0_0_40px_rgba(0,212,255,0.6)] transition-shadow group"
            aria-label="Open AI Chat"
          >
            <MessageCircle size={24} className="text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0a0a1a] animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[370px] max-w-[calc(100vw-24px)] h-[580px] max-h-[calc(100vh-100px)] flex flex-col rounded-2xl bg-[#0e0e24] border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm flex items-center gap-2">
                  Clocks AI
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                </div>
                <div className="text-white/40 text-xs">World time expert • Always online</div>
              </div>

              {/* Language selector */}
              <div className="relative">
                <button onClick={() => setShowLangMenu(v => !v)}
                  aria-label="Select language"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60 border border-white/10">
                  <Globe size={12} />
                  <span>{lang.flag}</span>
                  <ChevronDown size={10} />
                </button>
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full right-0 mt-1 w-44 bg-[#0e0e24] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-10 max-h-64 overflow-y-auto"
                    >
                      {LANGUAGES.map(l => (
                        <button key={l.code} onClick={() => handleLangChange(l)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/10 transition-colors ${lang.code === l.code ? 'text-cyan-400 bg-cyan-400/10' : 'text-white/70'}`}>
                          <span>{l.flag}</span><span>{l.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={clearChat} aria-label="Clear chat" className="text-white/30 hover:text-white/70 transition-colors p-1 rounded-lg hover:bg-white/10" title="Clear chat">
                <RotateCcw size={14} />
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-white/30 hover:text-white/70 transition-colors p-1 rounded-lg hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            {/* Auto-detected language notice */}
            <AnimatePresence>
              {autoDetected && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-1.5 text-xs text-center bg-cyan-400/10 text-cyan-300 border-b border-cyan-400/20">
                  🌐 Auto-detected: {autoDetected}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <div className="px-3 pt-2 pb-1 flex gap-2 flex-wrap flex-shrink-0">
                {[
                  "What time is it in Tokyo? 🇯🇵",
                  "Weather in London 🌧️",
                  "Tell me a world fact 🌍",
                  "Convert NY time to Dubai ✈️",
                ].map(s => (
                  <button key={s} onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10 hover:border-white/20 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-cyan-500 to-purple-600'
                      : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/15'
                  }`}>
                    {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white/70" />}
                  </div>
                  <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-white/5 border border-white/10 text-white/80 rounded-tl-sm'
                      : 'bg-gradient-to-br from-cyan-500/25 to-purple-600/25 border border-cyan-400/20 text-white rounded-tr-sm'
                  }`}>
                    {renderText(msg.text)}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-white/10 bg-[#0e0e24]">
              <div className="flex gap-2 items-end bg-white/5 rounded-xl border border-white/10 focus-within:border-cyan-400/40 transition-colors p-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={lang.code === 'es' ? 'Escribe algo...' : lang.code === 'fr' ? 'Écrivez quelque chose...' : 'Ask me anything…'}
                  className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder-white/25 max-h-28 min-h-[20px] leading-5"
                  style={{ height: 'auto' }}
                  onInput={e => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = 'auto';
                    t.style.height = Math.min(t.scrollHeight, 112) + 'px';
                  }}
                />
                <button onClick={sendMessage} disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(0,212,255,0.4)] transition-all flex-shrink-0">
                  {loading ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
                </button>
              </div>
              <div className="text-center text-xs text-white/20 mt-1.5">
                {lang.flag} {lang.label} • Powered by Clocks AI
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
