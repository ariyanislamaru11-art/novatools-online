import React from 'react';

export interface AdConfig {
  enabled: boolean;
  publisherId?: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  testMode?: boolean;
}

// Global configurable ad settings
export const SITE_AD_CONFIG: AdConfig = {
  enabled: false, // Disabled by default until site owner enters approved AdSense ID
  publisherId: '',
  testMode: false,
};

interface AdSlotProps {
  placement: 'header-banner' | 'content-inline' | 'sidebar' | 'footer-banner';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
  if (!SITE_AD_CONFIG.enabled || !SITE_AD_CONFIG.publisherId) {
    // Graceful, policy-compliant, non-deceptive placeholder when ads are not configured
    return null;
  }

  return (
    <div className={`my-8 text-center overflow-hidden transition-all ${className}`} role="complementary" aria-label="Advertisement">
      <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">
        Sponsored / Advertisement
      </div>
      <div className="min-h-[90px] w-full rounded-xl border border-dashed border-slate-700/60 bg-slate-900/40 p-4 flex items-center justify-center text-xs text-slate-400">
        <span>Ad Placement ({placement}) — Configured for Google AdSense</span>
      </div>
    </div>
  );
};
