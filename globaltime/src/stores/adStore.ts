import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdSlot {
  id: string;
  name: string;
  position: 'header' | 'sidebar' | 'footer' | 'mid-page' | 'floating' | 'game';
  type: 'image' | 'text' | 'embed';
  content: string;
  link?: string;
  isActive: boolean;
  backgroundColor?: string;
  textColor?: string;
}

const DEFAULT_ADS: AdSlot[] = [
  { id: 'ad1', name: 'Header Banner Top', position: 'header', type: 'text', content: '🚀 Advertise Here — Prime Header Placement', link: '#', isActive: true, backgroundColor: '#1a1a4e', textColor: '#00d4ff' },
  { id: 'ad2', name: 'Header Banner Bottom', position: 'header', type: 'text', content: '⚡ Your Brand Reaches Global Audiences', link: '#', isActive: true, backgroundColor: '#0d0d2b', textColor: '#b347ea' },
  { id: 'ad3', name: 'Sidebar Right Top', position: 'sidebar', type: 'text', content: '📊 Track Time. Track Performance.', link: '#', isActive: true, backgroundColor: '#111135', textColor: '#00ff88' },
  { id: 'ad4', name: 'Sidebar Right Bottom', position: 'sidebar', type: 'text', content: '🌍 Go Global with Your Ads', link: '#', isActive: true, backgroundColor: '#111135', textColor: '#ff006e' },
  { id: 'ad5', name: 'Mid-Page Banner 1', position: 'mid-page', type: 'text', content: '💡 Premium Mid-Page Ad Space — High Engagement Zone', link: '#', isActive: true, backgroundColor: '#1a1a4e', textColor: '#00d4ff' },
  { id: 'ad6', name: 'Mid-Page Banner 2', position: 'mid-page', type: 'text', content: '🎯 Targeted Global Traffic — Advertise Here', link: '#', isActive: true, backgroundColor: '#0d0d2b', textColor: '#b347ea' },
  { id: 'ad7', name: 'Footer Left', position: 'footer', type: 'text', content: '🌐 WorldClock.live Partner Spot', link: '#', isActive: true, backgroundColor: '#111135', textColor: '#00ff88' },
  { id: 'ad8', name: 'Footer Right', position: 'footer', type: 'text', content: '📈 Boost Your Global Reach Today', link: '#', isActive: true, backgroundColor: '#111135', textColor: '#00d4ff' },
  { id: 'ad9', name: 'Floating Sticky', position: 'floating', type: 'text', content: '📣 Special Offer — Click Here!', link: '#', isActive: false, backgroundColor: '#b347ea', textColor: '#ffffff' },
  { id: 'ad10', name: 'Game Page Ad', position: 'game', type: 'text', content: '🎮 Play More Games — Sponsor Slot', link: '#', isActive: true, backgroundColor: '#1a1a4e', textColor: '#00d4ff' },
];

interface AdStore {
  ads: AdSlot[];
  isAdmin: boolean;
  adminToken: string | null;
  updateAd: (id: string, updates: Partial<AdSlot>) => void;
  toggleAd: (id: string) => void;
  setAdmin: (token: string) => void;
  logout: () => void;
  getAdsByPosition: (position: AdSlot['position']) => AdSlot[];
}

export const useAdStore = create<AdStore>()(
  persist(
    (set, get) => ({
      ads: DEFAULT_ADS,
      isAdmin: false,
      adminToken: null,
      updateAd: (id, updates) =>
        set(state => ({ ads: state.ads.map(a => a.id === id ? { ...a, ...updates } : a) })),
      toggleAd: (id) =>
        set(state => ({ ads: state.ads.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a) })),
      setAdmin: (token) => set({ isAdmin: true, adminToken: token }),
      logout: () => set({ isAdmin: false, adminToken: null }),
      getAdsByPosition: (position) => get().ads.filter(a => a.position === position && a.isActive),
    }),
    { name: 'worldclock-ads' }
  )
);
