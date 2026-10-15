import React, { useState } from 'react';
import { BookOpen, Clock, ArrowRight, Sparkles, ChevronRight, Share2 } from 'lucide-react';
import { PRACTICAL_GUIDES, GuideArticle } from '../data/guides';

interface GuidesViewProps {
  onSelectTool: (slug: string) => void;
  lang: 'en' | 'bn';
}

export const GuidesView: React.FC<GuidesViewProps> = ({ onSelectTool, lang }) => {
  const [activeGuide, setActiveGuide] = useState<GuideArticle | null>(null);

  if (activeGuide) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <button
          onClick={() => setActiveGuide(null)}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-semibold"
        >
          ← Back to All Guides
        </button>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{activeGuide.category}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lang === 'en' ? activeGuide.title : activeGuide.titleBn}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {activeGuide.readTime}
            </span>
            <span>• Verified Practical Tutorial</span>
          </div>
        </div>

        {/* Article Body */}
        <article className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed">
          {(lang === 'en' ? activeGuide.content : activeGuide.contentBn).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {/* Launch Related Tool CTA */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Ready to try this in practice?</h3>
            <p className="text-xs text-slate-300">Launch the free, browser-based tool right now.</p>
          </div>
          <button
            onClick={() => onSelectTool(activeGuide.relatedToolSlug)}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <span>Launch Tool</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Educational Library</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          {lang === 'en' ? 'Practical Guides & Tutorials' : 'ব্যবহারিক নির্দেশিকা ও গাইড'}
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          {lang === 'en'
            ? 'Original, in-depth instructional articles on image optimization, PDF manipulation, QR codes, and safe JSON formatting.'
            : 'ছবি অপ্টিমাইজ, পিডিএফ এডিটিং এবং কিউআর কোড ব্যবহারের বিস্তারিত টিউটোরিয়াল।'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRACTICAL_GUIDES.map(guide => (
          <div
            key={guide.id}
            onClick={() => setActiveGuide(guide)}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex flex-col justify-between group shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono font-semibold uppercase text-[10px]">
                  {guide.category}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3 h-3" />
                  {guide.readTime}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                {lang === 'en' ? guide.title : guide.titleBn}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {lang === 'en' ? guide.summary : guide.summaryBn}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">
              <span>Read Full Guide</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
