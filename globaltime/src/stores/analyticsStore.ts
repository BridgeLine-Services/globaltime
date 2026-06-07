import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PageView { page: string; timestamp: number; }
interface AdClick { adId: string; timestamp: number; }

interface AnalyticsStore {
  pageViews: PageView[];
  adClicks: AdClick[];
  recordPageView: (page: string) => void;
  recordAdClick: (adId: string) => void;
  getTotalViews: () => number;
  getTopPages: () => { page: string; count: number }[];
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      pageViews: [],
      adClicks: [],
      recordPageView: (page) =>
        set(state => ({ pageViews: [...state.pageViews.slice(-500), { page, timestamp: Date.now() }] })),
      recordAdClick: (adId) =>
        set(state => ({ adClicks: [...state.adClicks.slice(-200), { adId, timestamp: Date.now() }] })),
      getTotalViews: () => get().pageViews.length,
      getTopPages: () => {
        const counts: Record<string, number> = {};
        get().pageViews.forEach(v => { counts[v.page] = (counts[v.page] || 0) + 1; });
        return Object.entries(counts).map(([page, count]) => ({ page, count }))
          .sort((a, b) => b.count - a.count).slice(0, 10);
      },
    }),
    { name: 'worldclock-analytics' }
  )
);
