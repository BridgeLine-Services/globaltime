import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, RefreshCw, ArrowRight, X, Globe } from 'lucide-react';
import { useBlogStore, type BlogPost } from '../stores/blogStore';
import { AdSlotComponent } from '../components/AdSlot';
import { useSEO } from '../hooks/useSEO';

const CATEGORY_COLORS: Record<BlogPost['category'], string> = {
  culture: '#f59e0b',
  science: '#8b5cf6',
  travel:  '#10b981',
  history: '#f97316',
  weird:   '#ec4899',
  tech:    '#06b6d4',
};

const CATEGORY_LABELS: Record<BlogPost['category'], string> = {
  culture: '🌏 Culture',
  science: '🔬 Science',
  travel:  '✈️ Travel',
  history: '📜 History',
  weird:   '🤯 Weird Facts',
  tech:    '💻 Tech',
};

function TimeAgo({ ts }: { ts: number }) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = Date.now() - ts;
      const mins = Math.floor(diff / 60000);
      if (mins < 1)   return setLabel('Just now');
      if (mins < 60)  return setLabel(`${mins}m ago`);
      const hrs = Math.floor(mins / 60);
      if (hrs < 24)   return setLabel(`${hrs}h ago`);
      setLabel(`${Math.floor(hrs / 24)}d ago`);
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [ts]);
  return <span>{label}</span>;
}

function PostModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[#0e0e24] border border-white/10 shadow-2xl"
      >
        {/* Header gradient */}
        <div className={`h-2 w-full rounded-t-2xl bg-gradient-to-r ${post.imageGradient.replace('/20', '')}`} />

        <div className="p-6 sm:p-8">
          <button onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{post.emoji}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ color: CATEGORY_COLORS[post.category], backgroundColor: CATEGORY_COLORS[post.category] + '20' }}>
              {CATEGORY_LABELS[post.category]}
            </span>
            {post.country && (
              <span className="text-xs text-white/40 flex items-center gap-1"><Globe size={11} />{post.country}</span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-3">{post.title}</h1>

          <div className="flex items-center gap-3 text-xs text-white/40 mb-6">
            <span className="flex items-center gap-1"><Clock size={11} /><TimeAgo ts={post.publishedAt} /></span>
            <span>·</span>
            <span className="flex items-center gap-1"><BookOpen size={11} />{post.readTime} min read</span>
          </div>

          <p className="text-white/70 text-sm italic mb-5 border-l-2 pl-4"
            style={{ borderColor: CATEGORY_COLORS[post.category] }}>
            {post.excerpt}
          </p>

          <div className="text-white/80 text-sm leading-relaxed space-y-4">
            {post.body.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const BlogPage: React.FC = () => {
  useSEO({
    title: 'World Stories & Facts — Culture, Science, Travel & History | World Clock',
    description: 'Stranger than fiction, true everywhere. Dive into fascinating world stories — bizarre history, hidden science, wild travel facts, and cultural mysteries. Refreshed every 2 hours.',
    canonical: 'https://globaltime-pi.vercel.app/blog',
  });

  const { posts, lastRefreshed, initPosts, refreshPosts } = useBlogStore();
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [filter, setFilter] = useState<BlogPost['category'] | 'all'>('all');
  const [countdown, setCountdown] = useState('');

  useEffect(() => { initPosts(); }, [initPosts]);

  // Countdown to next refresh
  useEffect(() => {
    const update = () => {
      const TWO_HOURS = 2 * 60 * 60 * 1000;
      const next = lastRefreshed + TWO_HOURS;
      const diff = Math.max(0, next - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`);
      if (diff <= 0) initPosts();
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [lastRefreshed, initPosts]);

  const categories: (BlogPost['category'] | 'all')[] = ['all', 'culture', 'science', 'travel', 'history', 'weird', 'tech'];
  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter);
  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">

        <AdSlotComponent position="header" index={0} className="mb-6" />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="text-5xl mb-3">🌍</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            World <span className="text-cyan-400">Stories</span>
          </h1>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Fascinating facts from every corner of the Earth. Fresh stories every 2 hours.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/30">
            <RefreshCw size={11} className="animate-spin" style={{ animationDuration: '8s' }} />
            <span>Next refresh in <span className="text-cyan-400 font-mono">{countdown}</span></span>
            <button onClick={() => refreshPosts(true)}
              className="ml-2 px-2 py-0.5 rounded-full border border-white/10 hover:border-cyan-400/30 hover:text-white/60 transition-all">
              Refresh now
            </button>
          </div>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                filter === cat
                  ? 'text-white border-transparent'
                  : 'text-white/40 border-white/10 hover:text-white/70 hover:border-white/20'
              }`}
              style={filter === cat && cat !== 'all' ? {
                backgroundColor: CATEGORY_COLORS[cat] + '25',
                borderColor: CATEGORY_COLORS[cat] + '60',
                color: CATEGORY_COLORS[cat],
              } : filter === cat ? { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' } : {}}>
              {cat === 'all' ? '🌐 All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="text-center text-white/30 py-20">
            <RefreshCw size={24} className="mx-auto mb-3 animate-spin" />
            Loading stories…
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className={`mb-8 cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br ${featured.imageGradient} backdrop-blur-sm overflow-hidden group hover:border-white/20 transition-all`}
                onClick={() => setSelected(featured)}
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl">{featured.emoji}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ color: CATEGORY_COLORS[featured.category], backgroundColor: CATEGORY_COLORS[featured.category] + '25' }}>
                      {CATEGORY_LABELS[featured.category]}
                    </span>
                    <span className="ml-auto text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/60 font-semibold">Featured</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{featured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Clock size={11} /><TimeAgo ts={featured.publishedAt} /></span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><BookOpen size={11} />{featured.readTime} min read</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-cyan-400 group-hover:gap-2 transition-all">
                      Read story <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {rest.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setSelected(post)}
                  className={`cursor-pointer rounded-xl border border-white/10 bg-gradient-to-br ${post.imageGradient} p-5 group hover:border-white/25 transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{post.emoji}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ color: CATEGORY_COLORS[post.category], backgroundColor: CATEGORY_COLORS[post.category] + '20' }}>
                      {CATEGORY_LABELS[post.category]}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-tight mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-white/30">
                    <span className="flex items-center gap-1"><Clock size={10} /><TimeAgo ts={post.publishedAt} /></span>
                    <span className="flex items-center gap-1"><BookOpen size={10} />{post.readTime} min</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <AdSlotComponent position="sidebar" index={0} className="mb-8" />
          </>
        )}
      </div>

      {/* Post modal */}
      <AnimatePresence>
        {selected && <PostModal post={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
};
