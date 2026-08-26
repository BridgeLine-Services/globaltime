import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';
import { TIME_GUIDES } from '../data/guides';

const CATEGORY_LABELS: Record<string, string> = {
  basics: 'Time Zone Basics',
  practical: 'Practical Guides',
  history: 'History & Context',
  advanced: 'Advanced Topics',
};

const CATEGORY_COLORS: Record<string, string> = {
  basics: '#00d4ff',
  practical: '#10b981',
  history: '#f97316',
  advanced: '#a855f7',
};

export const GuidesPage: React.FC = () => {
  useSEO({
    title: 'Time Zone Guides — Learn How Time Zones, UTC & DST Work | GlobalTime',
    description: 'In-depth guides explaining time zones, UTC, GMT, daylight saving time, the international date line, and more. Learn how time works around the world.',
    canonical: 'https://globaltime-pi.vercel.app/guides',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'Time Zone Guides',
        'description': 'In-depth educational guides about time zones, UTC, GMT, daylight saving time, and more.',
        'url': 'https://globaltime-pi.vercel.app/guides',
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://globaltime-pi.vercel.app/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Guides', 'item': 'https://globaltime-pi.vercel.app/guides' },
          ],
        },
      },
    ],
  });

  const categories = ['basics', 'practical', 'history', 'advanced'];

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4 pb-20">
      <div className="max-w-5xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-8" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">
            Time Zone <span className="text-cyan-400">Guides</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl">
            Everything you need to understand how time zones work — from the basics of UTC and GMT to the complexities of daylight saving time, the international date line, and the world's strangest time zones.
          </p>
        </motion.div>

        {/* Guides by category */}
        {categories.map(cat => {
          const guides = TIME_GUIDES.filter(g => g.category === cat);
          if (guides.length === 0) return null;
          return (
            <section key={cat} className="mb-10">
              <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">{CATEGORY_LABELS[cat] || cat}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {guides.map((guide, i) => (
                  <motion.div
                    key={guide.slug}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  >
                    <Link
                      to={`/guides/${guide.slug}`}
                      className="block p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all duration-200 h-full"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{guide.emoji}</div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-sm mb-1 leading-tight">{guide.title}</h3>
                          <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{guide.excerpt}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-white/30">
                            <span className="flex items-center gap-1">
                              <Clock size={11} /> {guide.readTime} min read
                            </span>
                            <span className="flex items-center gap-1" style={{ color: CATEGORY_COLORS[cat] }}>
                              <BookOpen size={11} /> {CATEGORY_LABELS[cat]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-cyan-400 text-xs">
                        Read guide <ArrowRight size={12} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}

        <AdSlotComponent position="mid-page" index={0} className="mb-8" />

        {/* CTA */}
        <div className="p-6 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 text-center">
          <h2 className="text-white font-bold text-xl mb-2">Ready to put it into practice?</h2>
          <p className="text-white/50 text-sm mb-4">Use our time zone tools to convert times and plan meetings across the globe.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/converter" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 font-medium hover:bg-cyan-400/30 transition-all text-sm">
              Time Zone Converter <ArrowRight size={14} />
            </Link>
            <Link to="/meeting-planner" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-400/20 border border-purple-400/40 text-purple-400 font-medium hover:bg-purple-400/30 transition-all text-sm">
              Meeting Planner <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
