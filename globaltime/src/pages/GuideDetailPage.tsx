import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';
import { TIME_GUIDES } from '../data/guides';

const CATEGORY_LABELS: Record<string, string> = {
  basics: 'Time Zone Basics',
  practical: 'Practical Guides',
  history: 'History & Context',
  advanced: 'Advanced Topics',
};

export const GuideDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const guideIndex = TIME_GUIDES.findIndex(g => g.slug === slug);
  const guide = guideIndex >= 0 ? TIME_GUIDES[guideIndex] : null;

  useSEO(guide ? {
    title: `${guide.title} | GlobalTime Guides`,
    description: guide.excerpt,
    canonical: `https://globaltime-pi.vercel.app/guides/${guide.slug}`,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': guide.title,
        'description': guide.excerpt,
        'url': `https://globaltime-pi.vercel.app/guides/${guide.slug}`,
        'inLanguage': 'en-US',
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://globaltime-pi.vercel.app/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Guides', 'item': 'https://globaltime-pi.vercel.app/guides' },
            { '@type': 'ListItem', 'position': 3, 'name': guide.title, 'item': `https://globaltime-pi.vercel.app/guides/${guide.slug}` },
          ],
        },
      },
    ],
  } : {
    title: 'Guide Not Found | GlobalTime',
    description: 'This guide was not found.',
    canonical: 'https://globaltime-pi.vercel.app/guides',
    noindex: true,
  });

  if (!guide) return <Navigate to="/guides" replace />;

  const prevGuide = guideIndex > 0 ? TIME_GUIDES[guideIndex - 1] : null;
  const nextGuide = guideIndex < TIME_GUIDES.length - 1 ? TIME_GUIDES[guideIndex + 1] : null;

  // Parse content: headings start with "## ", paragraphs are everything else
  const renderContent = (content: string[]) => {
    return content.map((block, i) => {
      if (block.startsWith('## ')) {
        return <h2 key={i} className="text-white font-bold text-xl mt-8 mb-3">{block.slice(3)}</h2>;
      }
      if (block.startsWith('- ')) {
        return <li key={i} className="text-white/60 text-sm leading-relaxed ml-4 list-disc">{block.slice(2)}</li>;
      }
      return <p key={i} className="text-white/60 text-sm leading-relaxed mb-4">{block}</p>;
    });
  };

  // Find related guides (same category, excluding current)
  const relatedGuides = TIME_GUIDES.filter(g => g.category === guide.category && g.slug !== guide.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4 pb-20">
      <div className="max-w-3xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-8" />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-white/40">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li className="text-white/20">/</li>
            <li><Link to="/guides" className="hover:text-white transition-colors">Guides</Link></li>
            <li className="text-white/20">/</li>
            <li className="text-white/70 truncate max-w-[200px]">{guide.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{guide.emoji}</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
              {CATEGORY_LABELS[guide.category] || guide.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">{guide.title}</h1>
          <p className="text-white/50 text-lg leading-relaxed">{guide.excerpt}</p>
          <div className="flex items-center gap-3 mt-4 text-xs text-white/30">
            <span className="flex items-center gap-1"><Clock size={12} /> {guide.readTime} min read</span>
            <span className="flex items-center gap-1"><BookOpen size={12} /> GlobalTime Guides</span>
          </div>
        </motion.div>

        {/* Content */}
        <article className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/5 mb-8">
          <div className="space-y-0">
            {renderContent(guide.content)}
          </div>
        </article>

        <AdSlotComponent position="mid-page" index={0} className="mb-8" />

        {/* Prev/Next navigation */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {prevGuide ? (
            <Link to={`/guides/${prevGuide.slug}`} className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all">
              <div className="flex items-center gap-1 text-white/30 text-xs mb-1"><ArrowLeft size={12} /> Previous</div>
              <div className="text-white text-sm font-medium">{prevGuide.emoji} {prevGuide.title}</div>
            </Link>
          ) : <div />}
          {nextGuide ? (
            <Link to={`/guides/${nextGuide.slug}`} className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all text-right">
              <div className="flex items-center gap-1 justify-end text-white/30 text-xs mb-1">Next <ArrowRight size={12} /></div>
              <div className="text-white text-sm font-medium">{nextGuide.emoji} {nextGuide.title}</div>
            </Link>
          ) : <div />}
        </div>

        {/* Related guides */}
        {relatedGuides.length > 0 && (
          <section className="mb-8">
            <h2 className="text-white font-bold text-lg mb-4">Related Guides</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {relatedGuides.map(rg => (
                <Link key={rg.slug} to={`/guides/${rg.slug}`} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-400/30 transition-all">
                  <div className="text-2xl mb-2">{rg.emoji}</div>
                  <div className="text-white text-sm font-medium leading-tight mb-1">{rg.title}</div>
                  <div className="text-white/40 text-xs">{rg.readTime} min read</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="p-6 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 text-center">
          <h2 className="text-white font-bold text-lg mb-2">Use What You've Learned</h2>
          <p className="text-white/50 text-sm mb-4">Try our tools to put your time zone knowledge into practice.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/converter" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 font-medium hover:bg-cyan-400/30 transition-all text-sm">
              Time Zone Converter <ArrowRight size={14} />
            </Link>
            <Link to="/meeting-planner" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-400/20 border border-purple-400/40 text-purple-400 font-medium hover:bg-purple-400/30 transition-all text-sm">
              Meeting Planner <ArrowRight size={14} />
            </Link>
            <Link to="/world" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all text-sm">
              World Clock <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
