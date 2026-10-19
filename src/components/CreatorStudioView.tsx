import React from 'react';
import {
  Film,
  Sparkles,
  Scissors,
  Music,
  FileText,
  Image as ImageIcon,
  Info,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  Sliders,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { ToolDef } from '../types';

interface CreatorStudioViewProps {
  onSelectTool: (slug: string) => void;
  lang: 'en' | 'bn';
}

export const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({ onSelectTool, lang }) => {
  const creatorTools = [
    {
      slug: 'video-noise-remover',
      title: lang === 'en' ? 'Video Noise Remover & Vocal Isolator' : 'ভিডিও নয়েজ রিমুভার ও ভোকাল আইসোলেটর',
      desc: lang === 'en'
        ? 'Real-time Web Audio DSP filter pipeline. Cancels background hiss, AC hum, and wind while isolating crisp vocals.'
        : 'ভিডিও থেকে ব্যাকগ্রাউন্ড নয়েজ দূর করুন এবং স্পষ্ট ও পরিষ্কার ভোকাল আলাদা করুন।',
      icon: SlidersHorizontal,
      badge: 'DSP Studio',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    },
    {
      slug: 'video-trimmer',
      title: lang === 'en' ? 'Video Trimmer & Cutter' : 'ভিডিও ট্রিমার ও কাটার',
      desc: lang === 'en'
        ? 'Precise millisecond start/end cut points with interactive video preview loop and instant export.'
        : 'শুরু ও শেষের সময় সিলেক্ট করে নিখুঁতভাবে ভিডিও কেটে ডাউনলোড করুন।',
      icon: Scissors,
      badge: 'Fast Cut',
      color: 'from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-400',
    },
    {
      slug: 'audio-extractor',
      title: lang === 'en' ? 'Video Audio Extractor' : 'ভিডিও অডিও এক্সট্রাক্টর',
      desc: lang === 'en'
        ? 'Rip 16-bit PCM lossless WAV or WebM audio from any MP4, MOV, or WebM video file.'
        : 'যেকোনো ভিডিও থেকে স্টুডিও কোয়ালিটি অডিও আলাদা করুন।',
      icon: Music,
      badge: 'Lossless WAV',
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
    },
    {
      slug: 'subtitle-editor',
      title: lang === 'en' ? 'SRT & WebVTT Subtitle Editor' : 'সাবটাইটেল এডিটর (SRT / VTT)',
      desc: lang === 'en'
        ? 'Import, edit, search & replace, sync timecodes, and export valid SRT/VTT caption files.'
        : 'সাবটাইটেল ফাইল আপলোড করুন, সময় মেলান, এডিট ও এক্সপোর্ট করুন।',
      icon: FileText,
      badge: 'Captions',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      slug: 'thumbnail-designer',
      title: lang === 'en' ? 'Thumbnail & Cover Designer' : 'থাম্বনেল ও কভার ডিজাইনার',
      desc: lang === 'en'
        ? 'Design eye-catching YouTube (16:9), Shorts/Reel (9:16), and Square thumbnails with custom fonts and badges.'
        : 'ইউটিউব থাম্বনেল ও রিল কভার তৈরি করুন কাস্টম টেক্সট ও ব্যাকগ্রাউন্ড সহ।',
      icon: ImageIcon,
      badge: 'Canvas Studio',
      color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400',
    },
    {
      slug: 'video-inspector',
      title: lang === 'en' ? 'Technical Video Inspector' : 'ভিডিও মেটাডাটা ইন্সপেক্টর',
      desc: lang === 'en'
        ? 'Inspect exact dimensions, aspect ratio, estimated bitrate, codecs, and hardware acceleration status.'
        : 'ভিডিওর রেজোলিউশন, অ্যাসপেক্ট রেশিও, বিটরেট ও কোডেক পরীক্ষা করুন।',
      icon: Info,
      badge: 'Metadata',
      color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400',
    },
    {
      slug: 'creator-export-checker',
      title: lang === 'en' ? 'Social Export Pre-Flight Checker' : 'সোশ্যাল এক্সপোর্ট ভ্যালিডেটর',
      desc: lang === 'en'
        ? 'Validate videos against YouTube, TikTok, Instagram Reels, and Twitter limits before uploading.'
        : 'ইউটিউব, টিকটক ও ইনস্টাগ্রামের সাইজ ও টাইম লিমিট চেক করুন।',
      icon: CheckCircle2,
      badge: 'Pre-Flight',
      color: 'from-fuchsia-500/20 to-pink-500/10 border-fuchsia-500/30 text-fuchsia-400',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Studio Hero */}
      <div className="relative overflow-hidden p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Film className="w-4 h-4" />
            <span>{lang === 'en' ? 'Video & Audio Creator Studio' : 'ভিডিও ও অডিও ক্রিয়েটর স্টুডিও'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {lang === 'en' ? (
              <>
                Lightweight Editing Tools <br />
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                  For Modern Creators.
                </span>
              </>
            ) : (
              <>
                আধুনিক কন্টেন্ট নির্মাতাদের জন্য <br />
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                  সম্পূর্ণ ব্রাউজার-নেটিভ টুলবক্স।
                </span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            {lang === 'en'
              ? 'Cancel background noise, trim footage, extract lossless audio, craft subtitles, and generate high-impact thumbnails without heavy desktop software or paid subscriptions.'
              : 'ভারী সফটওয়্যার ছাড়াই ভিডিওর নয়েজ দূর করুন, কাটছাঁট করুন, অডিও আলাদা করুন, সাবটাইটেল তৈরি করুন এবং থাম্বনেল ডিজাইন করুন। সম্পূর্ণ বিনামূল্যে ও ব্রাউজারে সুরক্ষিত।'}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Client-Side Privacy
            </span>
            <span>• No Watermarks</span>
            <span>• Zero Server Uploads</span>
            <span>• Free &amp; Open Workspace</span>
          </div>
        </div>
      </div>

      {/* Grid of Creator Studio Tools */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {lang === 'en' ? 'Studio Tool Suite' : 'স্টুডিও টুলস সংগ্রহ'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'en'
              ? 'Choose a specialized utility to prepare and polish your media.'
              : 'আপনার প্রয়োজন অনুযায়ী যেকোনো টুল সিলেক্ট করে কাজ শুরু করুন।'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creatorTools.map(t => {
            const Icon = t.icon;
            return (
              <div
                key={t.slug}
                onClick={() => onSelectTool(t.slug)}
                className="group p-6 rounded-3xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border bg-gradient-to-br ${t.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                      {t.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {t.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors">
                  <span>{lang === 'en' ? 'Open Tool' : 'টুল চালু করুন'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
