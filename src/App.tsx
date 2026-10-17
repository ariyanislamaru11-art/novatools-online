/**
 * NovaTools - 80+ Powerful Tools. One Limitless Workspace.
 * 100% Functional, SEO-Ready, Client-Side Privacy Architecture
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Cpu, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Star,
  Bot
} from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { ToolCard } from './components/ToolCard';
import { ToolDirectory } from './components/ToolDirectory';
import { ToolContainer } from './components/tools/ToolContainer';
import { CategoriesView } from './components/CategoriesView';
import { GuidesView } from './components/GuidesView';
import { LegalPages } from './components/LegalPages';
import { SearchModal } from './components/SearchModal';
import { AdSlot } from './components/AdSlot';
import { OwnersSection } from './components/OwnersSection';
import { AriyanBot } from './components/AriyanBot';
import { TOOLS } from './data/tools';
import { CATEGORIES } from './data/categories';
import { ToolCategory } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentToolSlug, setCurrentToolSlug] = useState<string>('pdf-reader');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // User Preferences
  const [lang, setLang] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('novatools_lang') as 'en' | 'bn') || 'en';
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('novatools_theme') !== 'light';
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('novatools_favorites') || '["pdf-reader","png-to-jpg","qr-code-generator"]');
    } catch {
      return ['pdf-reader', 'png-to-jpg', 'qr-code-generator'];
    }
  });
  const [recentSlugs, setRecentSlugs] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('novatools_recent') || '[]');
    } catch {
      return [];
    }
  });

  // Sync theme with DOM root
  useEffect(() => {
    localStorage.setItem('novatools_theme', isDark ? 'dark' : 'light');
    if (!isDark) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [isDark]);

  // Sync language with localStorage
  useEffect(() => {
    localStorage.setItem('novatools_lang', lang);
  }, [lang]);

  // Sync favorites with localStorage
  useEffect(() => {
    localStorage.setItem('novatools_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sync recents with localStorage
  useEffect(() => {
    localStorage.setItem('novatools_recent', JSON.stringify(recentSlugs));
  }, [recentSlugs]);

  // Hash-based URL Routing (#tool/png-to-jpg or #category/pdf)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        setCurrentView('home');
        return;
      }

      if (hash.startsWith('tools/') || hash.startsWith('tool/')) {
        const slug = hash.replace(/^(tools|tool)\//, '');
        const found = TOOLS.find(t => t.slug === slug);
        if (found) {
          setCurrentToolSlug(found.slug);
          setCurrentView('tool');
          addToRecent(found.slug);
        }
      } else if (hash.startsWith('categories/') || hash.startsWith('category/')) {
        const cat = hash.replace(/^(categories|category)\//, '') as ToolCategory;
        setSelectedCategory(cat);
        setCurrentView('directory');
      } else if (['bot', 'chat', 'ariyan-bot'].includes(hash)) {
        setCurrentView('bot');
      } else if (['directory', 'categories', 'popular', 'guides', 'about', 'privacy', 'terms', 'cookies', 'disclaimer', 'contact'].includes(hash)) {
        setCurrentView(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const addToRecent = (slug: string) => {
    setRecentSlugs(prev => {
      const filtered = prev.filter(s => s !== slug);
      return [slug, ...filtered].slice(0, 10);
    });
  };

  const handleSelectTool = (slug: string) => {
    const tool = TOOLS.find(t => t.slug === slug);
    if (!tool) return;
    setCurrentToolSlug(slug);
    setCurrentView('tool');
    addToRecent(slug);
    window.location.hash = `tools/${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string, slugOrCat?: string) => {
    if (view === 'tool' && slugOrCat) {
      handleSelectTool(slugOrCat);
      return;
    }
    if (view === 'categories' && slugOrCat) {
      setSelectedCategory(slugOrCat as ToolCategory);
      setCurrentView('directory');
      window.location.hash = `categories/${slugOrCat}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(view);
    window.location.hash = view === 'home' ? '' : view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const activeTool = TOOLS.find(t => t.slug === currentToolSlug) || TOOLS[0];
  const relatedTools = TOOLS.filter(t => t.category === activeTool.category && t.id !== activeTool.id);

  // Popular tools for homepage grid (12 tools as specified)
  const popularTools = TOOLS.filter(t => t.isPopular).slice(0, 12);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans`}>
      
      {/* Header Navigation */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        lang={lang}
        onToggleLang={() => setLang(l => (l === 'en' ? 'bn' : 'en'))}
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
        favoritesCount={favorites.length}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Sections */}
      <div className="flex-1">
        
        {/* VIEW: TOOL PAGE */}
        {currentView === 'tool' && (
          <ToolContainer
            tool={activeTool}
            onNavigate={handleNavigate}
            isFavorite={favorites.includes(activeTool.id)}
            onToggleFavorite={handleToggleFavorite}
            lang={lang}
            relatedTools={relatedTools}
          />
        )}

        {/* VIEW: DIRECTORY OR POPULAR OR FAVORITES */}
        {(currentView === 'directory' || currentView === 'popular' || currentView === 'favorites') && (
          <ToolDirectory
            tools={TOOLS}
            onSelectTool={handleSelectTool}
            favorites={favorites}
            recentSlugs={recentSlugs}
            onToggleFavorite={handleToggleFavorite}
            lang={lang}
            initialCategory={selectedCategory}
            initialFilter={currentView === 'popular' ? 'popular' : currentView === 'favorites' ? 'favorites' : 'all'}
          />
        )}

        {/* VIEW: CATEGORIES */}
        {currentView === 'categories' && (
          <CategoriesView
            tools={TOOLS}
            onSelectCategory={cat => {
              setSelectedCategory(cat);
              setCurrentView('directory');
              window.location.hash = `categories/${cat}`;
            }}
            onSelectTool={handleSelectTool}
            lang={lang}
          />
        )}

        {/* VIEW: GUIDES */}
        {currentView === 'guides' && (
          <GuidesView
            onSelectTool={handleSelectTool}
            lang={lang}
          />
        )}

        {/* VIEW: LEGAL & INFO PAGES */}
        {['about', 'privacy', 'terms', 'cookies', 'disclaimer', 'contact'].includes(currentView) && (
          <LegalPages
            page={currentView as any}
            lang={lang}
          />
        )}

        {/* VIEW: ARIYAN BOT AI CHATBOT */}
        {currentView === 'bot' && (
          <AriyanBot
            lang={lang}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {/* VIEW: HOMEPAGE */}
        {currentView === 'home' && (
          <div className="space-y-16 lg:space-y-24">
            
            {/* B. Hero section */}
            <Hero
              onNavigate={handleNavigate}
              lang={lang}
              tools={TOOLS}
              onSelectTool={handleSelectTool}
            />

            {/* C. Popular tools section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Frequently Used Tools</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {lang === 'en' ? 'Popular Digital Tools' : 'জনপ্রিয় ডিজিটাল টুলস'}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {lang === 'en'
                      ? 'The most essential converters, PDF tools, utilities, and calculators.'
                      : 'প্রতিদিনের প্রয়োজনীয় কনভার্টার, পিডিএফ ও টেক্সট টুলস।'}
                  </p>
                </div>

                <button
                  onClick={() => handleNavigate('directory')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
                >
                  <span>View All 82 Tools</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {popularTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onSelect={handleSelectTool}
                    isFavorite={favorites.includes(tool.id)}
                    onToggleFavorite={handleToggleFavorite}
                    lang={lang}
                  />
                ))}
              </div>
            </section>

            {/* Ariyan Bot AI Feature Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-4 max-w-2xl relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase">
                    <Bot className="w-4 h-4" />
                    <span>Next-Gen AI Assistant</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {lang === 'en' ? 'Meet Ariyan Bot — Intelligence Reimagined' : 'আরিয়ান বট — স্মার্ট এআই সহায়ক'}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {lang === 'en'
                      ? 'Experience real ChatGPT-style intelligence with multimodal image analysis, code troubleshooting, Bengali and English fluency, and live Google web search citations.'
                      : 'চ্যাটজিপিটি ধাঁচের রিয়েল এআই সহায়ক: ছবির উপাদান বিশ্লেষণ, প্রোগ্রামিং কোড ডিবাগিং, বাংলা ও ইংরেজি উভয় ভাষায় পারদর্শী এবং লাইভ গুগল সার্চ সংযোগ।'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => handleNavigate('bot')}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Bot className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Launch Ariyan Bot' : 'আরিয়ান বট চালু করুন'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      {lang === 'en' ? 'Vision Capable • Powered by Gemini' : 'ইমেজ অ্যানালাইসিস সমর্থিত'}
                    </span>
                  </div>
                </div>

                <div className="relative shrink-0 flex items-center justify-center">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-950 border border-slate-700/80 p-6 flex items-center justify-center shadow-2xl shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                    <Bot className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </section>

            {/* Optional AdSlot Placement on Homepage */}
            <AdSlot placement="content-inline" />

            {/* E. Category Cards Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {lang === 'en' ? 'Productivity Suites by Category' : 'ক্যাটাগরি অনুযায়ী টুলস'}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {lang === 'en' ? 'Explore specialized toolkits built for specific workflows.' : 'নির্দিষ্ট কাজের জন্য প্রস্তুত টুলবক্স।'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {CATEGORIES.map(cat => {
                  const count = TOOLS.filter(t => t.category === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleNavigate('categories', cat.id)}
                      className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex flex-col justify-between group shadow-lg"
                    >
                      <div className="space-y-3">
                        <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700 group-hover:scale-105 transition-transform">
                          <Layers className="w-5 h-5" />
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {lang === 'en' ? cat.title : cat.titleBn}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {lang === 'en' ? cat.description : cat.descriptionBn}
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono">{count} Tools</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* F. How NovaTools Works */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 space-y-10">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {lang === 'en' ? 'How NovaTools Works' : 'নোভাটুলস কীভাবে কাজ করে'}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {lang === 'en' ? 'Three straightforward steps with zero software downloads or logins.' : 'কোনো ইনস্টলেশন বা রেজিস্ট্রেশন ছাড়াই মাত্র তিনটি ধাপে কাজ করুন।'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto text-lg font-bold font-mono">
                      1
                    </div>
                    <h3 className="text-base font-bold text-white">Find the Right Tool</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Search by keyword or drag and drop your file into the home dropzone to instantly get matched with compatible tools.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mx-auto text-lg font-bold font-mono">
                      2
                    </div>
                    <h3 className="text-base font-bold text-white">Adjust Settings & Input</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Configure compression quality, image dimensions, PDF page order, or numbers. Validations run continuously.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto text-lg font-bold font-mono">
                      3
                    </div>
                    <h3 className="text-base font-bold text-white">Instant Output & Download</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Download genuine high-quality JPEG, PNG, or PDF files or copy calculated results directly to your clipboard.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* G. Privacy & Reliability Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Client-Side Security Standard</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {lang === 'en' ? 'Private by Design. Zero Server Storage.' : 'আপনার ডেটা সম্পূর্ণ ব্যক্তিগত ও সুরক্ষিত'}
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Most web converters quietly upload your private PDF contracts, family pictures, and financial data to external third-party servers.
                  </p>

                  <ul className="space-y-2 text-xs text-slate-300 pt-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>In-Browser Execution:</strong> Conversions run via HTML5 Canvas and client-side pdf-lib.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>No Account Required:</strong> Immediate usage without email registration or logins.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Zero Tracking of Content:</strong> We never log or record document text or file contents.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Operation Type</span>
                    <span className="text-slate-500">Execution Environment</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PDF Reading & Merging</span>
                    <strong className="text-emerald-400">Local Browser Memory</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Image Compression & Resize</span>
                    <strong className="text-emerald-400">HTML5 Canvas</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Password & Hashing</span>
                    <strong className="text-cyan-400">Web Crypto API</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Calculators & Text</span>
                    <strong className="text-cyan-400">Native JavaScript</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* H. Practical Guides Preview */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {lang === 'en' ? 'Practical Guides & How-To Articles' : 'ব্যবহারিক নির্দেশিকা ও টিউটোরিয়াল'}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {lang === 'en' ? 'Step-by-step technical guides for everyday file operations.' : 'ছবি ও পিডিএফ পরিচালনার প্রয়োজনীয় নির্দেশিকা।'}
                  </p>
                </div>

                <button
                  onClick={() => handleNavigate('guides')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
                >
                  <span>Explore All Guides</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'How to Convert PNG to JPG Without Quality Loss',
                    slug: 'png-to-jpg',
                    desc: 'Understand compression algorithms and background color fills for transparent pixels.',
                  },
                  {
                    title: 'How to Combine Multiple PDF Files Into One',
                    slug: 'merge-pdf',
                    desc: 'Merge separate contracts, reports, or research papers in your exact order with zero uploads.',
                  },
                  {
                    title: 'How to Generate Scannable Wi-Fi & URL QR Codes',
                    slug: 'qr-code-generator',
                    desc: 'Best practices for high contrast, error correction levels, and vector SVG exports.',
                  },
                ].map((g, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleNavigate('guides')}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-3 group"
                  >
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {g.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{g.desc}</p>
                    <div className="pt-2 text-xs font-semibold text-cyan-400 flex items-center gap-1">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* I. Owners Section: The Minds Behind NovaTools */}
            <OwnersSection lang={lang} />

          </div>
        )}

      </div>

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tools={TOOLS}
        onSelectTool={handleSelectTool}
        lang={lang}
      />

      {/* Floating Ariyan Bot Quick Launcher */}
      {currentView !== 'bot' && (
        <button
          onClick={() => handleNavigate('bot')}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 text-slate-950 font-extrabold text-xs shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all group cursor-pointer border border-cyan-300/40"
          title={lang === 'en' ? 'Chat with Ariyan Bot AI' : 'আরিয়ান বটের সাথে কথা বলুন'}
          aria-label="Open Ariyan Bot AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="tracking-wide">Ariyan Bot</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950/20 text-slate-950 font-mono font-bold">
            AI
          </span>
        </button>
      )}

      {/* Footer (hidden in full-screen Ariyan Bot view) */}
      {currentView !== 'bot' && (
        <Footer onNavigate={handleNavigate} lang={lang} />
      )}

    </div>
  );
}
