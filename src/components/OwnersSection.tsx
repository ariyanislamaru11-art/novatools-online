import React from 'react';
import { Sparkles, Compass, Lightbulb, HeartHandshake } from 'lucide-react';

interface OwnersSectionProps {
  lang: 'en' | 'bn';
}

export const OwnersSection: React.FC<OwnersSectionProps> = ({ lang }) => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800 p-8 sm:p-12 lg:p-14 shadow-2xl backdrop-blur-xl">
        
        {/* Subtle top pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-slate-800 to-violet-500/10 border border-slate-700/80 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wide">
              {lang === 'en' ? 'The Minds Behind NovaTools' : 'নোভাটুলসের রূপকার'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">
              OWNER &amp; CREATOR
            </span>
          </div>
        </div>

        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'en' ? 'Meet the Minds Behind NovaTools' : 'নোভাটুলসের রূপকারদের সাথে পরিচিত হন'}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-medium">
            {lang === 'en'
              ? 'Two Minds. One Vision. Limitless Possibilities.'
              : 'দুটি মন। এক অভিন্ন দৃষ্টিভঙ্গি। সীমাহীন সম্ভাবনা।'}
          </p>
        </div>

        {/* Centerpiece: Geometric Monogram + Connected Owners Display */}
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Custom Geometric Monogram: A × R */}
          <div className="flex justify-center">
            <div className="relative group cursor-default">
              {/* Outer decorative ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-violet-600 opacity-30 group-hover:opacity-75 blur transition duration-500" />
              
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950 border border-slate-700/80 p-2 flex items-center justify-center shadow-2xl">
                {/* SVG Monogram Combining A and R */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Aiyan and Ritu Monogram"
                >
                  <defs>
                    <linearGradient id="arGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                    <linearGradient id="arGradViolet" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>

                  {/* Left Side: Geometric Letter 'A' */}
                  <path
                    d="M 28 80 L 42 22 L 50 42 L 32 42"
                    stroke="url(#arGradCyan)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Right Side: Geometric Letter 'R' */}
                  <path
                    d="M 52 22 L 52 80 M 52 22 C 76 22 76 52 52 52 L 74 80"
                    stroke="url(#arGradViolet)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Center Glowing Intersection Diamond */}
                  <polygon
                    points="50,47 54,51 50,55 46,51"
                    fill="#38bdf8"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Unified Ownership Banner (Dual Pillars with Visual Laser Bridge) */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-slate-950/70 border border-slate-800/90 shadow-xl overflow-hidden">
            
            {/* Subtle connecting energy line behind the names */}
            <div className="absolute top-1/2 left-10 right-10 h-[1px] bg-gradient-to-r from-cyan-500/30 via-slate-700/50 to-violet-500/30 -translate-y-1/2 hidden sm:block pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6 text-center">
              
              {/* Creator 1: Aiyan */}
              <div className="space-y-1.5 flex-1 group">
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-semibold mb-1">
                  Co-Owner &amp; Creator
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  AIYAN
                </h3>
              </div>

              {/* The Multiplier / Shared Vision Connector */}
              <div className="relative flex items-center justify-center shrink-0 z-10 my-2 sm:my-0">
                <div className="w-11 h-11 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-lg shadow-cyan-500/5 group-hover:border-slate-600 transition-colors">
                  <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent text-lg font-black font-mono">
                    ×
                  </span>
                </div>
              </div>

              {/* Creator 2: Ritu */}
              <div className="space-y-1.5 flex-1 group">
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] font-mono uppercase tracking-wider text-violet-300 font-semibold mb-1">
                  Co-Owner &amp; Creator
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-100 to-violet-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  RITU
                </h3>
              </div>

            </div>

            {/* Shared Vision Statement */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                {lang === 'en'
                  ? '“Built with a shared vision to make powerful digital tools accessible to everyone.”'
                  : '“সবার জন্য শক্তিশালী ডিজিটাল টুলস সহজলভ্য করার এক অভিন্ন স্বপ্ন নিয়ে নোভাটুলসের সৃষ্টি।”'}
              </p>
              <div className="mt-2 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Co-Owners &amp; Creators of NovaTools
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
