/**
 * NovaTools - 80+ Powerful Tools. One Limitless Workspace.
 * 100% Functional, React Router Path-Based Architecture & Dynamic SEO
 * Created by Ariyan · Creative Reference: Ritu
 */

import React, { useState, useEffect } from 'react';
import { 
  Routes, 
  Route, 
  useNavigate, 
  useLocation, 
  useParams, 
  Navigate 
} from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  Bot, 
  Film, 
  Clock, 
  Layers,
  AlertCircle,
  Home as HomeIcon,
  Search
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
import { CreatorStudioView } from './components/CreatorStudioView';
import { SEO } from './components/SEO';
import { TOOLS } from './data/tools';
import { CATEGORIES } from './data/categories';
import { ToolCategory, ToolDef } from './types';

// Backward compatibility listener for legacy hash links (#tools/slug -> /tools/slug)
function HashMigrationListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) return;

      if (hash.startsWith('tools/') || hash.startsWith('tool/')) {
        const slug = hash.replace(/^(tools|tool)\//, '');
        navigate(`/tools/${slug}`, { replace: true });
      } else if (hash.startsWith('categories/') || hash.startsWith('category/')) {
        const cat = hash.replace(/^(categories|category)\//, '');
        navigate(`/categories/${cat}`, { replace: true });
      } else if (['bot', 'chat', 'ariyan-bot'].includes(hash)) {
        navigate('/bot', { replace: true });
      } else if (['studio', 'creator-studio', 'video-studio'].includes(hash)) {
        navigate('/studio', { replace: true });
      } else if (['directory', 'categories', 'popular', 'favorites', 'guides', 'about', 'privacy', 'terms', 'cookies', 'disclaimer', 'contact'].includes(hash)) {
        navigate(`/${hash}`, { replace: true });
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [navigate]);

  return null;
}

// Automatically scroll window to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

// Route Component for /tools/:slug
interface ToolRouteWrapperProps {
  lang: 'en' | 'bn';
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNavigate: (view: string, slugOrCat?: string) => void;
  onSelectTool: (slug: string) => void;
  addToRecent: (slug: string) => void;
}

function ToolRouteWrapper({
  lang,
  favorites,
  onToggleFavorite,
  onNavigate,
  onSelectTool,
  addToRecent,
}: ToolRouteWrapperProps) {
  const { slug } = useParams<{ slug: string }>();
  const tool = TOOLS.find(t => t.slug === slug);

  useEffect(() => {
    if (tool) {
      addToRecent(tool.slug);
    }
  }, [tool, addToRecent]);

  if (!tool) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <SEO 
          title="Tool Not Found | NovaTools"
          description="The requested online tool could not be found. Explore our 80+ other free utilities."
          canonicalPath={`/tools/${slug || ''}`}
        />
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          {lang === 'en' ? 'Tool Not Found' : 'টুলটি পাওয়া যায়নি'}
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          {lang === 'en'
            ? `We couldn't find a tool matching "${slug}". It may have moved or been updated.`
            : `"${slug}" নামের কোনো টুল খুঁজে পাওয়া যায়নি। অনুগ্রহ করে টুলস ডিরেক্টরি দেখুন।`}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate('directory')}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
          >
            {lang === 'en' ? 'Browse All 80+ Tools' : 'সব ৮০+ টুলস দেখুন'}
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-800 transition"
          >
            {lang === 'en' ? 'Return to Home' : 'হোমে ফিরে যান'}
          </button>
        </div>
      </div>
    );
  }

  const relatedTools = TOOLS.filter(t => t.category === tool.category && t.id !== tool.id);

  // Dynamic Schema.org structured data for the tool
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    alternateName: tool.nameBn,
    description: tool.description,
    applicationCategory: tool.category,
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    url: `https://novatools.app/tools/${tool.slug}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Ariyan',
      jobTitle: 'Founder & Primary Owner',
    },
  };

  const pageTitle = `${lang === 'en' ? tool.name : tool.nameBn} – Free Online Tool | NovaTools`;
  const pageDescription = `${lang === 'en' ? tool.description : tool.descriptionBn} 100% free, private, client-side online utility.`;

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalPath={`/tools/${tool.slug}`}
        keywords={tool.keywords}
        structuredData={structuredData}
      />
      <ToolContainer
        tool={tool}
        onNavigate={onNavigate}
        isFavorite={favorites.includes(tool.id)}
        onToggleFavorite={onToggleFavorite}
        lang={lang}
        relatedTools={relatedTools}
      />
    </>
  );
}

// Route Component for /categories/:slug
interface CategoryRouteWrapperProps {
  lang: 'en' | 'bn';
  favorites: string[];
  recentSlugs: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectTool: (slug: string) => void;
}

function CategoryRouteWrapper({
  lang,
  favorites,
  recentSlugs,
  onToggleFavorite,
  onSelectTool,
}: CategoryRouteWrapperProps) {
  const { slug } = useParams<{ slug: string }>();
  const category = CATEGORIES.find(c => c.id === slug);

  const title = category 
    ? `${lang === 'en' ? category.title : category.titleBn} – Free Online Tools | NovaTools`
    : 'Category Tools | NovaTools';
  const desc = category 
    ? `${lang === 'en' ? category.description : category.descriptionBn} Free, private browser utilities.`
    : 'Explore tools organized by category.';

  return (
    <>
      <SEO
        title={title}
        description={desc}
        canonicalPath={`/categories/${slug || ''}`}
      />
      <ToolDirectory
        tools={TOOLS}
        onSelectTool={onSelectTool}
        favorites={favorites}
        recentSlugs={recentSlugs}
        onToggleFavorite={onToggleFavorite}
        lang={lang}
        initialCategory={(slug as ToolCategory) || 'all'}
        initialFilter="all"
      />
    </>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
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
      return JSON.parse(localStorage.getItem('novatools_favorites') || '["video-noise-remover","pdf-reader","png-to-jpg","qr-code-generator"]');
    } catch {
      return ['video-noise-remover', 'pdf-reader', 'png-to-jpg', 'qr-code-generator'];
    }
  });
  const [recentSlugs, setRecentSlugs] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('novatools_recent') || '[]');
    } catch {
      return [];
    }
  });

  const [isEcoMode, setIsEcoMode] = useState<boolean>(() => {
    return localStorage.getItem('novatools_eco') === 'true';
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

  // Sync Eco Mode with DOM root
  useEffect(() => {
    localStorage.setItem('novatools_eco', isEcoMode ? 'true' : 'false');
    if (isEcoMode) {
      document.documentElement.classList.add('eco-mode');
    } else {
      document.documentElement.classList.remove('eco-mode');
    }
  }, [isEcoMode]);

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

  const addToRecent = (slug: string) => {
    setRecentSlugs(prev => {
      const filtered = prev.filter(s => s !== slug);
      return [slug, ...filtered].slice(0, 10);
    });
  };

  const handleSelectTool = (slug: string) => {
    navigate(`/tools/${slug}`);
  };

  const handleNavigate = (view: string, slugOrCat?: string) => {
    if (view === 'tool' && slugOrCat) {
      navigate(`/tools/${slugOrCat}`);
      return;
    }
    if (view === 'categories' && slugOrCat) {
      navigate(`/categories/${slugOrCat}`);
      return;
    }
    if (view === 'categories') {
      navigate('/categories');
      return;
    }
    if (view === 'home') {
      navigate('/');
      return;
    }
    navigate(`/${view}`);
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Derive current view for Header nav highlighting
  const pathname = location.pathname;
  let currentNavView = 'home';
  if (pathname === '/') currentNavView = 'home';
  else if (pathname.startsWith('/tools/')) currentNavView = 'tool';
  else if (pathname.startsWith('/categories/')) currentNavView = 'categories';
  else if (pathname === '/categories') currentNavView = 'categories';
  else if (pathname === '/bot') currentNavView = 'bot';
  else if (pathname === '/studio') currentNavView = 'studio';
  else if (pathname === '/directory') currentNavView = 'directory';
  else if (pathname === '/popular') currentNavView = 'popular';
  else if (pathname === '/favorites') currentNavView = 'favorites';
  else if (pathname === '/guides') currentNavView = 'guides';
  else if (['/about', '/privacy', '/terms', '/cookies', '/disclaimer', '/contact'].includes(pathname)) {
    currentNavView = pathname.replace('/', '');
  }

  // Popular tools for homepage grid (12 tools)
  const popularTools = TOOLS.filter(t => t.isPopular).slice(0, 12);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans`}>
      {/* Scroll to Top on pathname change */}
      <ScrollToTop />

      {/* Legacy Hash Migration Listener */}
      <HashMigrationListener />

      {/* Header Navigation */}
      <Header
        currentView={currentNavView}
        onNavigate={handleNavigate}
        lang={lang}
        onToggleLang={() => setLang(l => (l === 'en' ? 'bn' : 'en'))}
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
        favoritesCount={favorites.length}
        onOpenSearch={() => setIsSearchOpen(true)}
        isEcoMode={isEcoMode}
        onToggleEcoMode={() => setIsEcoMode(e => !e)}
      />

      {/* Main Content Router */}
      <div className="flex-1">
        <Routes>
          {/* HOME ROUTE */}
          <Route
            path="/"
            element={
              <>
                <SEO
                  title="NovaTools - 80+ Powerful Tools. One Limitless Workspace."
                  description="Convert images, manage PDFs, clean video noise, and chat with Ariyan Bot AI with 80+ powerful, free, privacy-first online tools. Founded by Ariyan · Creative Reference: Ritu."
                  canonicalPath="/"
                />
                <div className="space-y-16 lg:space-y-24">
                  {/* Hero Section */}
                  <Hero
                    onNavigate={handleNavigate}
                    lang={lang}
                    tools={TOOLS}
                    onSelectTool={handleSelectTool}
                  />

                  {/* Recently Used Tools */}
                  {recentSlugs.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{lang === 'en' ? 'Recently Used Tools' : 'সম্প্রতি ব্যবহৃত টুলস'}</span>
                        </div>
                        <button
                          onClick={() => setRecentSlugs([])}
                          className="text-[11px] text-slate-500 hover:text-slate-300 transition cursor-pointer"
                        >
                          {lang === 'en' ? 'Clear History' : 'হিস্ট্রি মুছুন'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSlugs.slice(0, 8).map(slug => {
                          const tool = TOOLS.find(t => t.slug === slug);
                          if (!tool) return null;
                          return (
                            <button
                              key={slug}
                              onClick={() => handleSelectTool(slug)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 hover:text-cyan-400 flex items-center gap-2 transition cursor-pointer"
                            >
                              <span className="w-2 h-2 rounded-full bg-cyan-400" />
                              <span>{lang === 'en' ? tool.name : tool.nameBn}</span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Popular Tools Section */}
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
                        <span>{lang === 'en' ? `View All ${TOOLS.length} Tools` : `সব ${TOOLS.length}টি টুল দেখুন`}</span>
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

                  {/* Creator Studio Showcase Banner */}
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-fuchsia-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group">
                      <div className="space-y-4 max-w-2xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-mono font-bold uppercase">
                          <Film className="w-4 h-4" />
                          <span>{lang === 'en' ? 'Creator Studio Suite' : 'ক্রিয়েটর স্টুডিও'}</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {lang === 'en' ? 'Audio & Video Creator Studio' : 'ভিডিও ও অডিও ক্রিয়েটর ওয়ার্কস্পেস'}
                        </h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {lang === 'en'
                            ? 'Denoise video audio, trim clips with millisecond precision, rip lossless 16-bit WAV tracks, craft SRT/VTT subtitles, design YouTube thumbnails, and pre-flight check social export limits.'
                            : 'ভিডিওর ব্যাকগ্রাউন্ড নয়েজ দূর করুন, নিখুঁতভাবে ট্রিম করুন, লসলেস অডিও বের করুন, সাবটাইটেল তৈরি করুন এবং থাম্বনেল ডিজাইন করুন। সম্পূর্ণ ব্রাউজার-নেটিভ ও ১০০% নিরাপদ।'}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          <button
                            onClick={() => handleNavigate('studio')}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:from-fuchsia-400 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-fuchsia-500/25 flex items-center gap-2 cursor-pointer transition-all"
                          >
                            <Film className="w-4 h-4" />
                            <span>{lang === 'en' ? 'Enter Creator Studio' : 'ক্রিয়েটর স্টুডিওতে যান'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-slate-400 font-mono">
                            7 Specialized Utilities • 100% In-Browser Privacy
                          </span>
                        </div>
                      </div>

                      <div className="relative shrink-0 flex items-center justify-center">
                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-950 border border-fuchsia-500/40 p-6 flex items-center justify-center shadow-2xl shadow-fuchsia-500/20 group-hover:scale-105 transition-transform duration-300">
                          <Film className="w-16 h-16 sm:w-20 sm:h-20 text-fuchsia-400 animate-pulse" />
                        </div>
                      </div>
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

                  {/* Category Cards Section */}
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {lang === 'en' ? 'Productivity Suites by Category' : 'ক্যাটাগরি অনুযায়ী টুলস'}
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        {lang === 'en' ? 'Explore specialized toolkits built for specific workflows.' : 'নির্দিষ্ট কাজের জন্য প্রস্তুত টুলবক্স।'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

                  {/* How NovaTools Works */}
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
                            Download genuine high-quality JPEG, PNG, MP4, or PDF files or copy calculated results directly to your clipboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Privacy & Reliability Section */}
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
                            <span><strong>In-Browser Execution:</strong> Conversions run via HTML5 Canvas, Web Audio DSP, and client-side pdf-lib.</span>
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
                          <span>Video Noise Removal & Audio</span>
                          <strong className="text-emerald-400">Web Audio API (Client)</strong>
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

                  {/* Practical Guides Preview */}
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
                          title: 'How to Denoise Video Audio and Isolate Crisp Vocals',
                          slug: 'video-noise-remover',
                          desc: 'Cancel background fan hiss, wind, and rumble while isolating clean speech directly in browser.',
                        },
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

                  {/* Owners Section: Primary Owner Ariyan + Secondary Reference Ritu */}
                  <OwnersSection lang={lang} />
                </div>
              </>
            }
          />

          {/* DEDICATED TOOL ROUTE: /tools/:slug */}
          <Route
            path="/tools/:slug"
            element={
              <ToolRouteWrapper
                lang={lang}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onNavigate={handleNavigate}
                onSelectTool={handleSelectTool}
                addToRecent={addToRecent}
              />
            }
          />

          {/* TOOL ALIAS REDIRECT: /tool/:slug -> /tools/:slug */}
          <Route
            path="/tool/:slug"
            element={<ToolRedirect />}
          />

          {/* DEDICATED CATEGORY ROUTE: /categories/:slug */}
          <Route
            path="/categories/:slug"
            element={
              <CategoryRouteWrapper
                lang={lang}
                favorites={favorites}
                recentSlugs={recentSlugs}
                onToggleFavorite={handleToggleFavorite}
                onSelectTool={handleSelectTool}
              />
            }
          />

          {/* CATEGORY ALIAS REDIRECT: /category/:slug -> /categories/:slug */}
          <Route
            path="/category/:slug"
            element={<CategoryRedirect />}
          />

          {/* CATEGORIES OVERVIEW ROUTE: /categories */}
          <Route
            path="/categories"
            element={
              <>
                <SEO
                  title="Browse Categories – Image, PDF, Video, Developer & Math Tools | NovaTools"
                  description="Explore NovaTools by category: Image Tools, PDF Utilities, Audio & Video Tools, Developer & SEO, Text Tools, and Calculators."
                  canonicalPath="/categories"
                />
                <CategoriesView
                  tools={TOOLS}
                  onSelectCategory={cat => navigate(`/categories/${cat}`)}
                  onSelectTool={handleSelectTool}
                  lang={lang}
                />
              </>
            }
          />

          {/* CREATOR STUDIO SUITE: /studio */}
          <Route
            path="/studio"
            element={
              <>
                <SEO
                  title="Video & Audio Creator Studio – Noise Remover & Vocal Isolator | NovaTools"
                  description="Client-side video editing and audio workspace. Remove background noise, cancel fan/wind sound, isolate clean vocals, trim video clips, and edit subtitles."
                  canonicalPath="/studio"
                />
                <CreatorStudioView
                  onSelectTool={handleSelectTool}
                  lang={lang}
                />
              </>
            }
          />
          <Route path="/creator-studio" element={<Navigate to="/studio" replace />} />
          <Route path="/video-studio" element={<Navigate to="/studio" replace />} />

          {/* ARIYAN BOT AI CHATBOT: /bot */}
          <Route
            path="/bot"
            element={
              <>
                <SEO
                  title="Ariyan Bot – Intelligent AI Chatbot & Assistant | NovaTools"
                  description="Chat with Ariyan Bot, the smart AI assistant created by Ariyan for NovaTools. Ask coding questions, analyze images, brainstorm, and get instant answers."
                  canonicalPath="/bot"
                />
                <AriyanBot
                  lang={lang}
                  onNavigateHome={() => navigate('/')}
                />
              </>
            }
          />
          <Route path="/chat" element={<Navigate to="/bot" replace />} />
          <Route path="/ariyan-bot" element={<Navigate to="/bot" replace />} />

          {/* ALL TOOLS DIRECTORY: /directory */}
          <Route
            path="/directory"
            element={
              <>
                <SEO
                  title="All 80+ Online Tools Directory | NovaTools"
                  description="Explore all 80+ free, private online tools for image editing, PDF management, video denoising, document formatting, developer utilities, and calculations."
                  canonicalPath="/directory"
                />
                <ToolDirectory
                  tools={TOOLS}
                  onSelectTool={handleSelectTool}
                  favorites={favorites}
                  recentSlugs={recentSlugs}
                  onToggleFavorite={handleToggleFavorite}
                  lang={lang}
                  initialCategory="all"
                  initialFilter="all"
                />
              </>
            }
          />

          {/* POPULAR TOOLS: /popular */}
          <Route
            path="/popular"
            element={
              <>
                <SEO
                  title="Popular Free Online Tools | NovaTools"
                  description="Discover our most popular browser-based tools: PDF reader, PNG to JPG converter, Video Noise Remover, and QR Code Generator."
                  canonicalPath="/popular"
                />
                <ToolDirectory
                  tools={TOOLS}
                  onSelectTool={handleSelectTool}
                  favorites={favorites}
                  recentSlugs={recentSlugs}
                  onToggleFavorite={handleToggleFavorite}
                  lang={lang}
                  initialCategory="all"
                  initialFilter="popular"
                />
              </>
            }
          />

          {/* FAVORITE TOOLS: /favorites */}
          <Route
            path="/favorites"
            element={
              <>
                <SEO
                  title="My Favorite Tools | NovaTools"
                  description="Access your saved and bookmarked tools for fast everyday productivity."
                  canonicalPath="/favorites"
                />
                <ToolDirectory
                  tools={TOOLS}
                  onSelectTool={handleSelectTool}
                  favorites={favorites}
                  recentSlugs={recentSlugs}
                  onToggleFavorite={handleToggleFavorite}
                  lang={lang}
                  initialCategory="all"
                  initialFilter="favorites"
                />
              </>
            }
          />

          {/* HOW-TO GUIDES: /guides */}
          <Route
            path="/guides"
            element={
              <>
                <SEO
                  title="How-To Guides & Tool Tutorials | NovaTools"
                  description="Step-by-step guides, tips, and tutorials for using NovaTools' privacy-first image, PDF, and video editing utilities."
                  canonicalPath="/guides"
                />
                <GuidesView
                  onSelectTool={handleSelectTool}
                  lang={lang}
                />
              </>
            }
          />

          {/* LEGAL & INFO PAGES */}
          <Route
            path="/about"
            element={
              <>
                <SEO
                  title="About NovaTools – Created by Ariyan · Creative Reference: Ritu"
                  description="Learn about NovaTools, our privacy-first philosophy, local browser computing architecture, and founders Ariyan and Ritu."
                  canonicalPath="/about"
                />
                <LegalPages page="about" lang={lang} />
              </>
            }
          />
          <Route
            path="/privacy"
            element={
              <>
                <SEO
                  title="Privacy Policy – Zero Data Collection | NovaTools"
                  description="NovaTools operates with a 100% client-side privacy model. Your files, documents, and videos never touch external servers."
                  canonicalPath="/privacy"
                />
                <LegalPages page="privacy" lang={lang} />
              </>
            }
          />
          <Route
            path="/terms"
            element={
              <>
                <SEO
                  title="Terms of Service | NovaTools"
                  description="Review the terms and conditions for using the NovaTools online workspace and utilities."
                  canonicalPath="/terms"
                />
                <LegalPages page="terms" lang={lang} />
              </>
            }
          />
          <Route
            path="/cookies"
            element={
              <>
                <SEO
                  title="Cookie Policy | NovaTools"
                  description="Learn how NovaTools uses strictly essential local browser storage to save your theme and language preferences."
                  canonicalPath="/cookies"
                />
                <LegalPages page="cookies" lang={lang} />
              </>
            }
          />
          <Route
            path="/disclaimer"
            element={
              <>
                <SEO
                  title="Disclaimer | NovaTools"
                  description="Legal disclaimer regarding calculations, conversion outputs, and AI responses on NovaTools."
                  canonicalPath="/disclaimer"
                />
                <LegalPages page="disclaimer" lang={lang} />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <SEO
                  title="Contact Us – Feedback & Support | NovaTools"
                  description="Get in touch with the NovaTools team for feature requests, bug reports, and feedback."
                  canonicalPath="/contact"
                />
                <LegalPages page="contact" lang={lang} />
              </>
            }
          />

          {/* 404 NOT FOUND CATCH-ALL */}
          <Route
            path="*"
            element={
              <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
                <SEO
                  title="404 - Page Not Found | NovaTools"
                  description="The page you are looking for does not exist on NovaTools."
                />
                <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-xl">
                  <span className="text-3xl font-extrabold font-mono">404</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {lang === 'en' ? 'Page Not Found' : 'পৃষ্ঠাটি পাওয়া যায়নি'}
                </h1>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  {lang === 'en'
                    ? "The link you followed may be broken, or the page may have been moved."
                    : "আপনি যে লিঙ্কটি অনুসরণ করেছেন তা হয়তো পরিবর্তিত হয়েছে বা আর বিদ্যমান নেই।"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => navigate('/')}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 flex items-center gap-2 transition cursor-pointer"
                  >
                    <HomeIcon className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Back to Home' : 'হোমে ফিরে যান'}</span>
                  </button>
                  <button
                    onClick={() => navigate('/directory')}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-800 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span>{lang === 'en' ? 'Explore 80+ Tools' : 'সব ৮০+ টুলস দেখুন'}</span>
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
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
      {!pathname.startsWith('/bot') && (
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

      {/* Footer (hidden on full-screen Ariyan Bot view) */}
      {!pathname.startsWith('/bot') && (
        <Footer onNavigate={handleNavigate} lang={lang} />
      )}
    </div>
  );
}

// Redirect helpers for /tool/:slug -> /tools/:slug and /category/:slug -> /categories/:slug
function ToolRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/tools/${slug || ''}`} replace />;
}

function CategoryRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/categories/${slug || ''}`} replace />;
}
