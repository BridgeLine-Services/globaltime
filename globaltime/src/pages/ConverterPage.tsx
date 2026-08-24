import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Copy, Check, Clock, Calendar } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';
import { getUTCOffset, getNumericOffsetMinutes } from '../utils/time';
import { COUNTRIES } from '../data/countries';

// Build a curated list of common timezones for the dropdowns (module-level, no hooks needed)
const POPULAR_TIMEZONES: { label: string; tz: string; flag: string }[] = (() => {
  const popular = COUNTRIES.map(c => ({ label: `${c.name} (${c.capital})`, tz: c.timezone, flag: c.flag }));
  const seen = new Set<string>();
  return popular.filter(p => {
    if (seen.has(p.tz)) return false;
    seen.add(p.tz);
    return true;
  });
})();

export const ConverterPage: React.FC = () => {
  const [fromTz, setFromTz] = useState('America/New_York');
  const [toTz, setToTz] = useState('Asia/Tokyo');
  const [inputTime, setInputTime] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [copied, setCopied] = useState(false);

  useSEO({
    title: 'Time Zone Converter — Convert Time Between Any Two Cities | GlobalTime',
    description: 'Free time zone converter. Convert any time from one timezone to another with automatic DST handling. Supports 140+ cities worldwide. No sign-up required.',
    canonical: 'https://globaltime-pi.vercel.app/converter',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'GlobalTime Time Zone Converter',
        'description': 'Convert time between any two time zones with automatic DST handling.',
        'url': 'https://globaltime-pi.vercel.app/converter',
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'Web',
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://globaltime-pi.vercel.app/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Converter', 'item': 'https://globaltime-pi.vercel.app/converter' },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          { '@type': 'Question', 'name': 'How does the time zone converter handle daylight saving time?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Our converter uses the IANA Time Zone Database, which automatically accounts for daylight saving time transitions. When you enter a date, the converter calculates the correct UTC offset for that specific date, including any DST adjustments.' }},
          { '@type': 'Question', 'name': 'Is the time zone converter free to use?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, GlobalTime\'s time zone converter is completely free. No sign-up or registration is required.' }},
        ],
      },
    ],
  });

  // Calculate the converted time
  const conversion = useMemo(() => {
    try {
      const now = new Date();
      const timeStr = inputTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dateStr = inputDate || now.toISOString().split('T')[0];

      const [hours, minutes] = timeStr.split(':').map(Number);
      const dateObj = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);

      const fromOffset = getNumericOffsetMinutes(fromTz);
      const toOffset = getNumericOffsetMinutes(toTz);
      const offsetDiff = toOffset - fromOffset;

      const browserOffset = -now.getTimezoneOffset();
      const utcMs = dateObj.getTime() - (browserOffset - fromOffset) * 60 * 1000;
      const toTzMs = utcMs + toOffset * 60 * 1000;

      const result = new Date(toTzMs);
      const toTime = result.toLocaleTimeString('en-US', {
        timeZone: toTz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const toDate = result.toLocaleDateString('en-US', {
        timeZone: toTz,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const diffHours = offsetDiff / 60;
      const toTzLabel = toTz.split('/').pop()?.replace(/_/g, ' ') ?? toTz;
      const diffStr = diffHours > 0
        ? `${toTzLabel} is ${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ahead`
        : diffHours < 0
        ? `${toTzLabel} is ${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} behind`
        : 'Same time zone';

      return { toTime, toDate, diffStr, fromOffset: getUTCOffset(fromTz), toOffset: getUTCOffset(toTz), offsetDiff };
    } catch {
      return { toTime: '--:--', toDate: 'Invalid date', diffStr: 'Unable to convert', fromOffset: '', toOffset: '', offsetDiff: 0 };
    }
  }, [fromTz, toTz, inputTime, inputDate]);

  const swap = () => {
    setFromTz(toTz);
    setToTz(fromTz);
  };

  const copyResult = () => {
    const text = `${inputTime || 'Now'} (${fromTz}) = ${conversion.toTime} (${toTz})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-8" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Time Zone <span className="text-cyan-400">Converter</span>
          </h1>
          <p className="text-white/50">
            Convert any time from one timezone to another. Automatic DST handling. 140+ cities supported.
          </p>
        </motion.div>

        {/* Converter */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-white/40 text-xs mb-1.5 flex items-center gap-1">
                <Clock size={12} /> FROM
              </label>
              <select
                value={fromTz}
                onChange={e => setFromTz(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-400/50 focus:outline-none transition-colors"
              >
                {POPULAR_TIMEZONES.map(tz => (
                  <option key={tz.tz} value={tz.tz} className="bg-[#0a0a1a]">
                    {tz.flag} {tz.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-cyan-400 font-mono text-xs">{conversion.fromOffset}</div>
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 flex items-center gap-1">
                <Clock size={12} /> TO
              </label>
              <select
                value={toTz}
                onChange={e => setToTz(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-400/50 focus:outline-none transition-colors"
              >
                {POPULAR_TIMEZONES.map(tz => (
                  <option key={tz.tz} value={tz.tz} className="bg-[#0a0a1a]">
                    {tz.flag} {tz.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-cyan-400 font-mono text-xs">{conversion.toOffset}</div>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <button
              onClick={swap}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-sm hover:bg-cyan-400/20 transition-all"
            >
              <ArrowLeftRight size={16} /> Swap
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-white/40 text-xs mb-1.5 flex items-center gap-1">
                <Clock size={12} /> TIME (leave empty for now)
              </label>
              <input
                type="time"
                value={inputTime}
                onChange={e => setInputTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-400/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 flex items-center gap-1">
                <Calendar size={12} /> DATE (leave empty for today)
              </label>
              <input
                type="date"
                value={inputDate}
                onChange={e => setInputDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-400/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-400/10 to-purple-400/10 border border-cyan-400/20">
            <div className="text-white/40 text-xs mb-2">RESULT</div>
            <div className="flex items-baseline gap-4 flex-wrap">
              <div className="text-4xl font-black text-white">{conversion.toTime}</div>
              <button onClick={copyResult} className="text-white/40 hover:text-cyan-400 transition-colors">
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <div className="text-white/50 text-sm mt-2">{conversion.toDate}</div>
            <div className="text-cyan-400 text-sm mt-3 font-medium">{conversion.diffStr}</div>
          </div>
        </div>

        <AdSlotComponent position="mid-page" index={0} className="mb-8" />

        <section className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-8">
          <h2 className="text-white font-bold text-xl mb-4">How Time Zone Conversion Works</h2>
          <div className="space-y-3 text-white/60 text-sm leading-relaxed">
            <p>
              Every location on Earth has a UTC offset — the number of hours and minutes it differs from Coordinated Universal Time. When you convert time from one zone to another, you're essentially calculating the difference between their UTC offsets.
            </p>
            <p>
              For example, New York (UTC-5 during standard time, UTC-4 during daylight saving time) and Tokyo (UTC+9, no DST) have an offset difference of 14 hours in winter and 13 hours in summer. Our converter automatically accounts for these seasonal changes.
            </p>
            <p>
              The key to accurate conversion is using the <strong className="text-white">IANA Time Zone Database</strong>, which encodes not just the current offset but the full history of when DST transitions happen for every timezone. This is why the date you enter matters — the same time conversion can give different results in March versus July.
            </p>
          </div>
        </section>

        <section className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Does the converter handle daylight saving time?', a: 'Yes. Our converter uses the IANA Time Zone Database, which automatically accounts for DST transitions. When you specify a date, the converter calculates the correct UTC offset for that specific date.' },
              { q: 'Why do I need to enter a date?', a: 'Because daylight saving time changes the UTC offset of many timezones, the date matters. The same clock time can convert differently in January versus July for timezones that observe DST.' },
              { q: 'What timezones are supported?', a: 'We support all IANA timezone identifiers, which covers every officially recognized timezone in the world — over 400 in total. The dropdown shows the most popular ones, but any valid IANA timezone will work.' },
              { q: 'Is this converter accurate for scheduling?', a: 'Yes, for general scheduling purposes. The underlying IANA database is the same one used by major operating systems and programming languages. However, for mission-critical applications, always verify with official sources.' },
            ].map((faq, i) => (
              <div key={i} className="border-b border-white/10 pb-3 last:border-0">
                <div className="text-white font-medium text-sm mb-1">{faq.q}</div>
                <div className="text-white/50 text-sm leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
