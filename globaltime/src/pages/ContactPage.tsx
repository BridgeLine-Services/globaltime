import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, Globe } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { AdSlotComponent } from '../components/AdSlot';
import { Link } from 'react-router-dom';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  useSEO({
    title: 'Contact GlobalTime — Get in Touch',
    description: 'Contact the GlobalTime team with questions, feedback, or suggestions about our world clock, time zone converter, or any of our time information tools.',
    canonical: 'https://globaltime-pi.vercel.app/contact',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': 'Contact GlobalTime',
      'description': 'Get in touch with the GlobalTime team.',
      'url': 'https://globaltime-pi.vercel.app/contact',
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://globaltime-pi.vercel.app/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Contact', 'item': 'https://globaltime-pi.vercel.app/contact' },
        ],
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation this would POST to a backend endpoint
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 px-4 pb-20">
      <div className="max-w-3xl mx-auto">
        <AdSlotComponent position="header" index={0} className="mb-8" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black text-white mb-3">Contact Us</h1>
          <p className="text-white/50 text-lg">
            Have a question, suggestion, or found a bug? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
            <Mail size={20} className="text-cyan-400 mb-2" />
            <div className="text-white/40 text-xs mb-1">EMAIL</div>
            <a href="mailto:contact@globaltime-pi.vercel.app" className="text-white text-sm hover:text-cyan-400 transition-colors">
              contact@globaltime-pi.vercel.app
            </a>
          </div>
          <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
            <MessageSquare size={20} className="text-cyan-400 mb-2" />
            <div className="text-white/40 text-xs mb-1">RESPONSE TIME</div>
            <div className="text-white text-sm">Usually within 48 hours</div>
          </div>
          <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
            <Globe size={20} className="text-cyan-400 mb-2" />
            <div className="text-white/40 text-xs mb-1">PRIVACY</div>
            <Link to="/legal#privacy" className="text-white text-sm hover:text-cyan-400 transition-colors">
              Read our Privacy Policy
            </Link>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-white font-bold text-xl mb-2">Thank You!</h2>
            <p className="text-white/60 text-sm">
              Your message has been recorded. We'll get back to you as soon as possible.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 text-sm font-medium hover:bg-cyan-400/30 transition-all"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-cyan-400/50 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">Your Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-cyan-400/50 focus:outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-cyan-400/50 focus:outline-none transition-colors"
                placeholder="How can we help?"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-cyan-400/50 focus:outline-none transition-colors resize-none"
                placeholder="Tell us more..."
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 font-medium hover:bg-cyan-400/30 transition-all text-sm"
            >
              <Send size={16} /> Send Message
            </button>
          </form>
        )}

        <AdSlotComponent position="mid-page" index={0} className="mt-8" />
      </div>
    </div>
  );
};
