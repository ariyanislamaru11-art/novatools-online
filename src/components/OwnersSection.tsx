import React from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface OwnersSectionProps {
  lang: 'en' | 'bn';
}

export const OwnersSection: React.FC<OwnersSectionProps> = ({ lang }) => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800 p-8 sm:p-12 lg:p-14 shadow-2xl backdrop-blur-xl">
        
        {/* Subtle top pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-slate-800 to-violet-500/10 border border-slate-700/80 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wide">
              {lang === 'en' ? 'The Mind Behind NovaTools' : 'নোভাটুলসের রূপকার'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">
              WEBSITE OWNER &amp; CREATOR
            </span>
          </div>
        </div>

        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'en' ? 'Meet the Creator Behind NovaTools' : 'নোভাটুলসের নির্মাতার সাথে পরিচিত হন'}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-medium">
            {lang === 'en'
              ? 'One Mind. One Vision. Limitless Possibilities.'
              : 'এক অভিন্ন দৃষ্টিভঙ্গি। সীমাহীন সম্ভাবনা।'}
          </p>
        </div>

        {/* Centerpiece: Geometric Monogram + Owner Display */}
        <div className="max-w-xl mx-auto space-y-8">
          
          {/* Custom Geometric Monogram: 'A' */}
          <div className="flex justify-center">
            <div className="relative group cursor-default">
              {/* Outer decorative glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-violet-600 opacity-40 group-hover:opacity-80 blur transition duration-500" />
              
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950 border border-slate-700/80 p-2 flex items-center justify-center shadow-2xl">
                {/* SVG Geometric Monogram for Ariyan */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Ariyan Geometric Monogram"
                >
                  <defs>
                    <linearGradient id="ariyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                  </defs>

                  {/* Geometric Monogram Letter 'A' */}
                  <path
                    d="M 22 82 L 50 18 L 78 82"
                    stroke="url(#ariyanGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 32 58 L 68 58"
                    stroke="url(#ariyanGrad)"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  {/* Glowing core diamond */}
                  <polygon
                    points="50,38 54,43 50,48 46,43"
                    fill="#38bdf8"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Owner Profile Card */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-xl overflow-hidden text-center space-y-4">
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                Website Owner &amp; Creator
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                ARIYAN
              </h3>
            </div>

            {/* Vision Statement */}
            <div className="pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {lang === 'en'
                  ? '“Built with vision to make powerful digital tools and intelligent AI accessible to everyone.”'
                  : '“সবার জন্য শক্তিশালী ডিজিটাল টুলস ও কৃত্রিম বুদ্ধিমত্তা সহজলভ্য করার দৃষ্টিভঙ্গি নিয়ে নোভাটুলস নির্মিত।”'}
              </p>
              <div className="mt-3 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Created &amp; Developed by Ariyan
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
