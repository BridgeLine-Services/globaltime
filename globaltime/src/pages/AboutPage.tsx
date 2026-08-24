import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Clock, ArrowLeftRight, Users, BookOpen, Zap, Shield, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';

export const AboutPage: React.FC = () => {
  useSEO({
    title: 'About GlobalTime — How Our World Clocks Work & Why We Built This',
    description: 'Learn about GlobalTime — our mission to be the most complete time information resource on the web. Discover how our clocks work, what data we use, and who we serve.',
    canonical: 'https://globaltime-pi.vercel.app/about',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      'name': 'About GlobalTime',
      'description': 'Learn about GlobalTime — our mission, how our clocks work, and who we serve.',
      'url': 'https://globaltime-pi.vercel.app/about',
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://globaltime-pi.vercel.app/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'About', 'item': 'https://globaltime-pi.vercel.app/about' },
        ],
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-8" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">About GlobalTime</h1>
          <p className="text-white/50 text-lg">
            Your complete time information resource — built for travelers, remote teams, and anyone who needs to know what time it is, anywhere on Earth.
          </p>
        </motion.div>

        {/* What is GlobalTime */}
        <section className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-4">What is GlobalTime?</h2>
          <div className="space-y-4 text-white/60 text-sm leading-relaxed">
            <p>
              GlobalTime is a comprehensive time information platform that goes beyond simply showing you the current time. We combine live world clocks for 140+ countries with practical tools like a time zone converter and meeting planner, alongside in-depth educational guides about how time zones work.
            </p>
            <p>
              Most world clock websites show you a clock and nothing else. GlobalTime was built to answer the questions that come <em>after</em> "what time is it?" — questions like "why does this country use this time zone?", "does this location observe daylight saving time?", "what's the best time to schedule a call between Tokyo and New York?", and "how do I convert EST to UTC?"
            </p>
            <p>
              Whether you're coordinating an international team, planning travel across continents, or simply curious about how time works around the world, GlobalTime is designed to be your go-to resource.
            </p>
          </div>
        </section>

        {/* Why we built it */}
        <section className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-4">Why We Built GlobalTime</h2>
          <div className="space-y-4 text-white/60 text-sm leading-relaxed">
            <p>
              Time zones are one of those things everyone uses but few truly understand. The world is divided into 24 standard time zones, but the reality is far more complex — some countries use half-hour offsets, others don't observe daylight saving time, and a few (like China) use a single time zone despite spanning what should be five.
            </p>
            <p>
              We noticed that existing world clock sites fell into two categories: minimalist clock widgets that showed the time but offered no context, or dense reference sites that were hard to navigate. We wanted to build something in between — a site that's both a practical tool and an educational resource.
            </p>
            <p>
              GlobalTime is that resource. Our clocks are the engine; the guides, country pages, and tools are the value we add on top.
            </p>
          </div>
        </section>

        {/* How our clocks work */}
        <section className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-4">How GlobalTime Calculates Time</h2>
          <div className="space-y-4 text-white/60 text-sm leading-relaxed">
            <p>
              Our clocks use a combination of your device's high-resolution timer and the IANA Time Zone Database — the same database used by operating systems and programming languages worldwide.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={16} className="text-cyan-400" />
                  <span className="text-white font-medium text-sm">IANA Time Zones</span>
                </div>
                <p className="text-white/50 text-xs">We use IANA timezone identifiers (like "America/New_York" or "Asia/Tokyo") for accurate, standards-compliant timekeeping. These identifiers encode not just the UTC offset but also the full history of DST rules and timezone changes for each region.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-cyan-400" />
                  <span className="text-white font-medium text-sm">UTC Offsets</span>
                </div>
                <p className="text-white/50 text-xs">UTC offsets are calculated live using JavaScript's Intl API. This means our offsets automatically update when daylight saving time transitions occur — no manual updates needed.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-cyan-400" />
                  <span className="text-white font-medium text-sm">DST Transitions</span>
                </div>
                <p className="text-white/50 text-xs">Daylight saving time is handled automatically. When a region springs forward or falls back, our clocks reflect the change instantly because the IANA database encodes the exact transition rules for every timezone.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-cyan-400" />
                  <span className="text-white font-medium text-sm">Accuracy</span>
                </div>
                <p className="text-white/50 text-xs">Our clocks update 60 times per second using your browser's requestAnimationFrame API, synchronized to your device's system clock. This provides continuous updates synchronized to your device system clock.</p>
              </div>
            </div>
            <p className="mt-4">
              When a government changes a time-zone rule — as countries occasionally do — the IANA Time Zone Database is updated, and our clocks reflect that change automatically. This is why we rely on IANA identifiers rather than hardcoded UTC offsets: the database encodes not just <em>what</em> the offset is today, but <em>when</em> it has changed throughout history.
            </p>
          </div>
        </section>

        {/* Who it's for */}
        <section className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-4">Who GlobalTime Is For</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '✈️', title: 'Travelers', desc: 'Check the time at your destination, understand time zone differences, and plan your itinerary across multiple time zones.' },
              { icon: '💼', title: 'Remote Workers', desc: 'Coordinate with colleagues in different time zones using our meeting planner and converter tools.' },
              { icon: '🌍', title: 'International Teams', desc: 'Schedule meetings that work for everyone, understand DST changes that affect your team, and find the best overlap hours.' },
              { icon: '📚', title: 'Students', desc: 'Learn how time zones work, understand UTC and GMT, and explore the history and politics of time standardization.' },
              { icon: '💻', title: 'Developers', desc: 'Reference IANA timezone identifiers, understand UTC offsets, and verify DST behavior for different regions.' },
              { icon: '🏢', title: 'Businesses', desc: 'Plan international calls, understand working hours in different markets, and communicate time clearly across borders.' },
            ].map((group, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="text-2xl mb-2">{group.icon}</div>
                <div className="text-white font-medium text-sm mb-1">{group.title}</div>
                <div className="text-white/50 text-xs">{group.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <AdSlotComponent position="mid-page" index={0} className="mb-8" />

        {/* Features */}
        <section className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-4">What You Can Do on GlobalTime</h2>
          <div className="space-y-3">
            {[
              { icon: <Clock size={18} className="text-cyan-400" />, label: 'World Clock', desc: 'Live, live clocks for 140+ countries and territories', to: '/world' },
              { icon: <ArrowLeftRight size={18} className="text-cyan-400" />, label: 'Time Zone Converter', desc: 'Convert any time from one time zone to another, with DST handling', to: '/converter' },
              { icon: <Users size={18} className="text-cyan-400" />, label: 'Meeting Planner', desc: 'Find the best meeting time across multiple cities and time zones', to: '/meeting-planner' },
              { icon: <Globe size={18} className="text-cyan-400" />, label: 'Country Time Guides', desc: 'Detailed time information for 140+ countries — DST, major cities, comparisons', to: '/world' },
              { icon: <BookOpen size={18} className="text-cyan-400" />, label: 'Time Zone Guides', desc: 'Educational articles explaining how time zones, UTC, and DST work', to: '/guides' },
            ].map((feature, i) => (
              <Link key={i} to={feature.to} className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all">
                <div className="mt-0.5">{feature.icon}</div>
                <div>
                  <div className="text-white font-medium text-sm">{feature.label}</div>
                  <div className="text-white/50 text-xs">{feature.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-bold text-xl mb-4">Data Sources & Accuracy</h2>
          <div className="space-y-3 text-white/60 text-sm leading-relaxed">
            <p>
              GlobalTime derives all time data from the <strong className="text-white">IANA Time Zone Database</strong> (also known as the tz database or zoneinfo database), which is maintained by the Internet Assigned Numbers Authority and widely considered the authoritative source for time zone information.
            </p>
            <p>
              Country data (capitals, coordinates, flags) comes from standard geographic databases. Weather data, where displayed, is provided by the Open-Meteo API.
            </p>
            <p>
              We do not maintain a server-side database of personal user data. All time calculations happen in your browser, and all game scores and preferences are stored locally on your device.
            </p>
          </div>
        </section>

        <AdSlotComponent position="mid-page" index={1} className="mb-8" />
      </div>
    </div>
  );
};
