import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Save, ToggleLeft, ToggleRight, BarChart2, LogOut } from 'lucide-react';
import { useAdStore, type AdSlot } from '../stores/adStore';
import { useSEO } from '../hooks/useSEO';
import { useAnalyticsStore } from '../stores/analyticsStore';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin2025';

export const AdminPanel: React.FC = () => {
  useSEO({ title: 'Admin', description: '', canonical: 'https://globaltime-pi.vercel.app/', noindex: true });
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { ads, isAdmin, setAdmin, logout, updateAd, toggleAd } = useAdStore();
  const { getTotalViews, getTopPages, adClicks } = useAnalyticsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<AdSlot>>({});
  const [activeTab, setActiveTab] = useState<'ads' | 'analytics'>('ads');

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setAdmin('session-' + Date.now());
      setError('');
    } else {
      setError('Invalid password.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] pt-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
        >
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center">
              <Shield size={28} className="text-cyan-400" />
            </div>
          </div>
          <h1 className="text-white font-bold text-xl text-center mb-2">Admin Access</h1>
          <p className="text-white/40 text-sm text-center mb-6">WorldClock.live Control Panel</p>
          <div className="relative mb-4">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Admin password"
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/30 outline-none focus:border-cyan-400/60 pr-12"
            />
            <button onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button onClick={login} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold hover:opacity-90 transition-opacity">
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white font-bold text-2xl flex items-center gap-2"><Shield size={22} className="text-cyan-400" /> Admin Panel</h1>
            <p className="text-white/40 text-sm mt-1">Manage ads, view analytics</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['ads', 'analytics'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl font-medium text-sm capitalize transition-all ${activeTab === tab ? 'bg-cyan-400 text-[#0a0a1a]' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
              {tab === 'analytics' ? <span className="flex items-center gap-1"><BarChart2 size={14} /> Analytics</span> : 'Ad Slots'}
            </button>
          ))}
        </div>

        {activeTab === 'ads' && (
          <div className="space-y-3">
            {ads.map(ad => (
              <div key={ad.id} className="p-5 rounded-2xl border border-white/10 bg-white/5">
                {editingId === ad.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={editDraft.content ?? ad.content} onChange={e => setEditDraft(d => ({ ...d, content: e.target.value }))}
                        placeholder="Ad content" className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm outline-none" />
                      <input value={editDraft.link ?? ad.link ?? ''} onChange={e => setEditDraft(d => ({ ...d, link: e.target.value }))}
                        placeholder="Link URL" className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm outline-none" />
                      <input value={editDraft.backgroundColor ?? ad.backgroundColor ?? ''} onChange={e => setEditDraft(d => ({ ...d, backgroundColor: e.target.value }))}
                        placeholder="Background color" className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm outline-none" />
                      <input value={editDraft.textColor ?? ad.textColor ?? ''} onChange={e => setEditDraft(d => ({ ...d, textColor: e.target.value }))}
                        placeholder="Text color" className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm outline-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { updateAd(ad.id, editDraft); setEditingId(null); setEditDraft({}); }}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-sm hover:bg-cyan-400/30">
                        <Save size={14} /> Save
                      </button>
                      <button onClick={() => { setEditingId(null); setEditDraft({}); }} className="px-4 py-2 rounded-lg bg-white/10 text-white/60 text-sm hover:bg-white/20">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${ad.isActive ? 'bg-green-400' : 'bg-white/20'}`} />
                        <span className="text-white font-medium text-sm">{ad.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-xs">{ad.position}</span>
                      </div>
                      <p className="text-white/40 text-xs truncate">{ad.content}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => { setEditingId(ad.id); setEditDraft({}); }} className="px-3 py-1.5 rounded-lg border border-white/20 text-white/60 text-xs hover:bg-white/10">Edit</button>
                      <button onClick={() => toggleAd(ad.id)} className={`p-1.5 rounded-lg transition-colors ${ad.isActive ? 'text-green-400 hover:text-green-300' : 'text-white/30 hover:text-white'}`}>
                        {ad.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[['Total Page Views', getTotalViews()], ['Ad Clicks', adClicks.length], ['Active Ads', ads.filter(a => a.isActive).length]].map(([l, v]) => (
                <div key={l as string} className="p-5 rounded-2xl border border-white/10 bg-white/5 text-center">
                  <div className="text-white font-bold text-3xl">{v}</div>
                  <div className="text-white/40 text-sm mt-1">{l}</div>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><BarChart2 size={16} className="text-cyan-400" /> Top Pages</h3>
              <div className="space-y-2">
                {getTopPages().map(({ page, count }) => (
                  <div key={page} className="flex items-center gap-3">
                    <div className="flex-1 text-white/60 text-sm font-mono truncate">{page}</div>
                    <div className="text-cyan-400 font-bold text-sm w-12 text-right">{count}</div>
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                        style={{ width: `${Math.min(100, (count / (getTopPages()[0]?.count || 1)) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                {getTopPages().length === 0 && <p className="text-white/30 text-sm">No data yet — navigate around the site to populate.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
