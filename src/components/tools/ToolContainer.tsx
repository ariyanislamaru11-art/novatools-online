import React from 'react';
import { 
  ChevronRight, 
  Star, 
  Share2, 
  ShieldCheck, 
  HelpCircle, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { ToolDef } from '../../types';
import { ImageViewerTools } from './ImageViewerTools';
import { PdfViewerTools } from './PdfViewerTools';
import { TextViewerTools } from './TextViewerTools';
import { DevViewerTools } from './DevViewerTools';
import { CalcViewerTools } from './CalcViewerTools';
import { VideoNoiseRemover } from './VideoNoiseRemover';
import { AdSlot } from '../AdSlot';

interface ToolContainerProps {
  tool: ToolDef;
  onNavigate: (view: string, slug?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  lang: 'en' | 'bn';
  relatedTools: ToolDef[];
}

export const ToolContainer: React.FC<ToolContainerProps> = ({
  tool,
  onNavigate,
  isFavorite,
  onToggleFavorite,
  lang,
  relatedTools,
}) => {
  const [copiedShare, setCopiedShare] = React.useState(false);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <nav className="flex items-center gap-1.5" aria-label="Breadcrumb">
          <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors">
            {lang === 'en' ? 'Home' : 'হোম'}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <button onClick={() => onNavigate('categories', tool.category)} className="hover:text-cyan-400 transition-colors uppercase font-mono">
            {tool.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-none">
            {lang === 'en' ? tool.name : tool.nameBn}
          </span>
        </nav>

        <div className="flex items-center gap-2">
          {/* Favorite Toggle */}
          <button
            onClick={e => onToggleFavorite(tool.id, e)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
              isFavorite
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-amber-400'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
            <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>

          {/* Share Link */}
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-all"
            title="Copy shareable link"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Tool Header Box */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Free & Private Online Utility</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>{tool.privacyNote}</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {lang === 'en' ? tool.name : tool.nameBn}
        </h1>

        <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
          {lang === 'en' ? tool.description : tool.descriptionBn}
        </p>
      </div>

      {/* Main Tool Working Workbench */}
      <main className="min-h-[400px]">
        {tool.category === 'image' && <ImageViewerTools tool={tool} lang={lang} />}
        {tool.category === 'pdf' && <PdfViewerTools tool={tool} lang={lang} />}
        {tool.category === 'text' && <TextViewerTools tool={tool} lang={lang} />}
        {tool.category === 'developer' && <DevViewerTools tool={tool} lang={lang} />}
        {tool.category === 'calculator' && <CalcViewerTools tool={tool} lang={lang} />}
        {(tool.category === 'video' || tool.slug === 'video-noise-remover') && (
          <VideoNoiseRemover tool={tool} lang={lang} />
        )}
      </main>

      {/* Optional AdSlot Placement on Eligible Tool Page */}
      <AdSlot placement="content-inline" />

      {/* How to Use Step-by-Step Guide */}
      <section className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2>How to Use {tool.name}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tool.steps.map(step => (
            <div key={step.step} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold font-mono text-xs flex items-center justify-center">
                {step.step}
              </span>
              <h3 className="text-sm font-bold text-white">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      {tool.faqs.length > 0 && (
        <section className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-slate-800/80 space-y-4">
            {tool.faqs.map((faq, i) => (
              <div key={i} className={i > 0 ? 'pt-4' : ''}>
                <h3 className="text-sm font-bold text-slate-200 mb-1">{faq.question}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools Recommendation Grid */}
      {relatedTools.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Related Productivity Tools</h2>
            <button
              onClick={() => onNavigate('categories', tool.category)}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View all in {tool.category}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedTools.slice(0, 3).map(r => (
              <div
                key={r.id}
                onClick={() => onNavigate('tool', r.slug)}
                className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="text-xs font-mono uppercase text-slate-500">{r.category}</div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? r.name : r.nameBn}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">{lang === 'en' ? r.description : r.descriptionBn}</p>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
