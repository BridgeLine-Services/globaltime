import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Globe2 } from 'lucide-react';
import { useBlogStore, slugifyPostTitle, type BlogPost } from '../stores/blogStore';
import { useSEO } from '../hooks/useSEO';
import { CATEGORY_COLORS, CATEGORY_LABELS } from './BlogPage';

const SITE_URL = 'https://globaltime-pi.vercel.app';

function ArticleMeta({ post }: { post: BlogPost }) {
  return <div className="flex flex-wrap items-center gap-3 text-xs text-white/45">
    <span className="flex items-center gap-1"><Clock size={12} />{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    <span>·</span><span className="flex items-center gap-1"><BookOpen size={12} />{post.readTime} min read</span>
    {post.country && <><span>·</span><span className="flex items-center gap-1"><Globe2 size={12} />{post.country}</span></>}
  </div>;
}

export const BlogArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { posts, initPosts } = useBlogStore();
  useEffect(() => { initPosts(); }, [initPosts]);
  const post = posts.find((candidate) => slugifyPostTitle(candidate.title) === slug);
  const related = posts.filter((candidate) => candidate.id !== post?.id && candidate.category === post?.category).slice(0, 3);

  useSEO({
    title: post ? `${post.title} | World Stories & Facts` : 'Story not found | World Stories & Facts',
    description: post?.excerpt ?? 'Explore fascinating stories about time, culture, science, travel, and history.',
    canonical: `${SITE_URL}/blog/${slug ?? ''}`,
    ogTitle: post?.title,
    ogDescription: post?.excerpt,
    structuredData: post ? {
      '@context': 'https://schema.org', '@type': 'Article', headline: post.title,
      description: post.excerpt, datePublished: new Date(post.publishedAt).toISOString(),
      mainEntityOfPage: `${SITE_URL}/blog/${slug}`, articleSection: post.category,
      inLanguage: 'en-US', publisher: { '@type': 'Organization', name: 'GlobalTime', url: SITE_URL },
    } : undefined,
  });

  if (!post) return <main className="min-h-screen bg-[#0a0a1a] pt-32 pb-20 px-4 text-center text-white"><h1 className="text-3xl font-bold mb-4">Story not found</h1><Link className="text-cyan-400 hover:text-cyan-300" to="/blog">Back to the blog</Link></main>;

  return <main className="min-h-screen bg-[#0a0a1a] pt-28 pb-20 px-4">
    <article className="max-w-3xl mx-auto">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-8"><ArrowLeft size={16} />Back to the blog</Link>
      <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${post.imageGradient} overflow-hidden`}>
        <div className="h-2 bg-gradient-to-r from-cyan-400 to-purple-500" />
        <div className="p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-5"><span className="text-4xl">{post.emoji}</span><span className="text-xs px-2 py-1 rounded-full font-medium" style={{ color: CATEGORY_COLORS[post.category], backgroundColor: `${CATEGORY_COLORS[post.category]}20` }}>{CATEGORY_LABELS[post.category]}</span></div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight text-balance mb-5">{post.title}</h1>
          <ArticleMeta post={post} />
          <p className="text-white/70 text-base sm:text-lg italic leading-relaxed border-l-2 pl-4 mt-8 mb-8" style={{ borderColor: CATEGORY_COLORS[post.category] }}>{post.excerpt}</p>
          <div className="text-white/80 text-base leading-relaxed space-y-6">{post.body.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        </div>
      </div>
      {related.length > 0 && <section className="mt-12"><h2 className="text-xl font-bold text-white mb-4">Related articles</h2><div className="grid sm:grid-cols-3 gap-4">{related.map((item) => <Link key={item.id} to={`/blog/${slugifyPostTitle(item.title)}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-cyan-400/40 transition-colors"><span className="text-2xl">{item.emoji}</span><h3 className="text-sm font-semibold text-white mt-3 leading-snug">{item.title}</h3><span className="text-xs text-white/40 mt-2 block">{item.readTime} min read</span></Link>)}</div></section>}
    </article>
  </main>;
};

export default BlogArticlePage;
