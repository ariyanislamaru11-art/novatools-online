import React, { useState, useRef } from 'react';
import { 
  Search, 
  Upload, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Code, 
  FileCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { ToolDef } from '../types';

interface HeroProps {
  onNavigate: (view: string, slug?: string) => void;
  lang: 'en' | 'bn';
  tools: ToolDef[];
  onSelectTool: (slug: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, lang, tools, onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [detectedFile, setDetectedFile] = useState<{ name: string; type: string; size: number } | null>(null);
  const [recommendedTools, setRecommendedTools] = useState<ToolDef[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter tools for autocomplete search
  const searchResults = searchQuery.trim()
    ? tools.filter(t => {
        const q = searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.nameBn.includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some(k => k.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : [];

  const handleFileDetection = (file: File) => {
    const fileInfo = { name: file.name, type: file.type, size: file.size };
    setDetectedFile(fileInfo);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    let matched: ToolDef[] = [];
    if (file.type.includes('pdf') || ext === 'pdf') {
      matched = tools.filter(t => ['pdf-reader', 'merge-pdf', 'split-pdf', 'compress-pdf', 'rotate-pdf', 'pdf-to-jpg', 'extract-pdf-text'].includes(t.slug));
    } else if (file.type.includes('png') || ext === 'png') {
      matched = tools.filter(t => ['png-to-jpg', 'png-to-webp', 'image-compressor', 'image-resizer', 'image-cropper', 'image-to-pdf'].includes(t.slug));
    } else if (file.type.includes('jpeg') || file.type.includes('jpg') || ext === 'jpg' || ext === 'jpeg') {
      matched = tools.filter(t => ['jpg-to-png', 'jpg-to-webp', 'image-compressor', 'image-resizer', 'image-cropper', 'image-to-pdf'].includes(t.slug));
    } else if (file.type.includes('webp') || ext === 'webp') {
      matched = tools.filter(t => ['webp-to-png', 'image-compressor', 'image-resizer', 'image-to-pdf'].includes(t.slug));
    } else if (ext === 'json') {
      matched = tools.filter(t => ['json-formatter'].includes(t.slug));
    } else if (ext === 'csv') {
      matched = tools.filter(t => ['csv-viewer-converter'].includes(t.slug));
    } else {
      matched = tools.filter(t => ['word-counter', 'sha256-hash-calculator', 'base64-encoder-decoder'].includes(t.slug));
    }

    setRecommendedTools(matched);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileDetection(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileDetection(e.target.files[0]);
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 grid-pattern">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-violet-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>80+ Powerful Tools. One Limitless Workspace.</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          {lang === 'en' ? (
            <>
              Your Digital Toolbox, <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                Reimagined.
              </span>
            </>
          ) : (
            <>
              আপনার ডিজিটাল টুলবক্স, <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                এক নতুন অভিজ্ঞতায়।
              </span>
            </>
          )}
        </h1>

        {/* Supporting description */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Convert images, manage PDFs, format documents, generate QR codes, and simplify everyday tasks with powerful free online tools.'
            : 'ছবি কনভার্ট, পিডিএফ ব্যবস্থাপনা, কোড ফরম্যাটিং, কিউআর জেনারেশন সহ সব কাজ করুন দ্রুত ও সম্পূর্ণ নিরাপদে।'}
        </p>

        {/* Search Input Box */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <div className="relative flex items-center shadow-2xl rounded-2xl bg-slate-900/90 border border-slate-700/80 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search all 82 tools (e.g. PDF Reader, PNG to JPG, Word Counter, QR)...' : 'টুল খুঁজুন (যেমন: পিডিএফ রিডার, ছবি কনভার্টার, কিউআর কোড)...'}
              className="w-full py-4 pl-3 pr-10 text-sm sm:text-base text-white placeholder-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mr-3 p-1 rounded-md text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-30 text-left space-y-1 backdrop-blur-xl">
              <div className="text-[11px] font-mono uppercase text-slate-400 px-3 py-1 font-semibold">
                Matching Tools ({searchResults.length})
              </div>
              {searchResults.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.slug);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-cyan-400">
                        {lang === 'en' ? tool.name : tool.nameBn}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1">
                        {lang === 'en' ? tool.description : tool.descriptionBn}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs">
          <span className="text-slate-400 font-medium">Quick Access:</span>
          {[
            { label: 'PDF Reader', slug: 'pdf-reader' },
            { label: 'PNG to JPG', slug: 'png-to-jpg' },
            { label: 'Image Compressor', slug: 'image-compressor' },
            { label: 'Merge PDF', slug: 'merge-pdf' },
            { label: 'QR Code', slug: 'qr-code-generator' },
            { label: 'JSON Formatter', slug: 'json-formatter' },
          ].map(chip => (
            <button
              key={chip.slug}
              onClick={() => onSelectTool(chip.slug)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Drag-and-Drop File Recognition Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`max-w-2xl mx-auto rounded-2xl border-2 border-dashed p-6 transition-all ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
              : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInput}
            className="hidden"
            id="hero-file-upload"
          />

          {!detectedFile ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-200">
                    {lang === 'en' ? 'Drop any file to find the right tool' : 'যেকোনো ফাইল এখানে ড্রপ করুন'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {lang === 'en' ? 'PDFs, PNG, JPG, WebP, JSON, CSV...' : 'পিডিএফ, ছবি, জেএসওন বা টেক্সট ফাইল...'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0 cursor-pointer transition-colors border border-slate-700"
              >
                {lang === 'en' ? 'Browse File' : 'ফাইল নির্বাচন করুন'}
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-sm font-bold text-white truncate">{detectedFile.name}</div>
                    <div className="text-xs text-slate-400 font-mono">
                      {(detectedFile.size / 1024).toFixed(1)} KB • {detectedFile.type || 'Standard file'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setDetectedFile(null); setRecommendedTools([]); }}
                  className="text-xs text-slate-400 hover:text-rose-400 font-semibold p-1"
                >
                  Clear
                </button>
              </div>

              {recommendedTools.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-cyan-400 mb-2">
                    Recommended tools for this file type:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {recommendedTools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => onSelectTool(tool.slug)}
                        className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 text-left text-xs text-slate-200 transition-all flex items-center justify-between"
                      >
                        <span className="font-semibold truncate">{tool.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('directory')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{lang === 'en' ? 'Explore All 82 Tools' : 'সবগুলো ৮২টি টুল দেখুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('categories')}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
          >
            {lang === 'en' ? 'Browse Categories' : 'ক্যাটাগরি ব্রাউজ করুন'}
          </button>
        </div>

        {/* Privacy badge */}
        <div className="mt-8 inline-flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            {lang === 'en' 
              ? 'Zero Server Storage: All conversions & computations execute strictly in your local browser.' 
              : '১০০% নিরাপদ: কোনো ফাইল সার্ভারে যায় না, সব কাজ ব্রাউজারের ভেতর সম্পন্ন হয়।'}
          </span>
        </div>

      </div>
    </section>
  );
};
