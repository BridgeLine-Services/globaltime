import React from 'react';
import { useAdStore, DEFAULT_ADS, type AdSlot as AdSlotType } from '../stores/adStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { ExternalLink } from 'lucide-react';

interface AdSlotProps {
  position: AdSlotType['position'];
  className?: string;
  index?: number;
}

export const AdSlotComponent: React.FC<AdSlotProps> = ({ position, className = '', index = 0 }) => {
  let ads: AdSlotType[] = [];

  // Completely isolated try/catch — if the store explodes, fall back to defaults
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { getAdsByPosition } = useAdStore();
    ads = getAdsByPosition(position);
  } catch {
    ads = DEFAULT_ADS.filter(a => a.position === position && a.isActive);
  }

  let recordAdClick: ((id: string) => void) | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const analytics = useAnalyticsStore();
    recordAdClick = analytics.recordAdClick;
  } catch { /* analytics failure is non-fatal */ }

  if (!Array.isArray(ads) || ads.length === 0) return null;
  const ad = ads[index % ads.length];
  if (!ad) return null;

  const handleClick = () => {
    try { recordAdClick?.(ad.id); } catch { /* non-fatal */ }
    if (ad.link && ad.link !== '#') window.open(ad.link, '_blank');
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:border-white/30 ${className}`}
      style={{ backgroundColor: ad.backgroundColor || '#111135' }}
      onClick={handleClick}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${ad.textColor ?? '#00d4ff'}15, transparent)` }} />
      <div className="relative p-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium" style={{ color: ad.textColor || '#00d4ff' }}>
          {ad.content}
        </span>
        {ad.link && ad.link !== '#' && (
          <ExternalLink size={14} style={{ color: ad.textColor }} className="flex-shrink-0 opacity-60" />
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px opacity-30"
        style={{ background: `linear-gradient(90deg, transparent, ${ad.textColor ?? '#00d4ff'}, transparent)` }} />
    </div>
  );
};
