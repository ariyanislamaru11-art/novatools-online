import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Moon, 
  Sun, 
  Globe, 
  Star, 
  Menu, 
  X, 
  Layers, 
  BookOpen, 
  ShieldCheck,
  ChevronRight,
  Bot
} from 'lucide-react';
import { ToolDef } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, slug?: string) => void;
  lang: 'en' | 'bn';
  onToggleLang: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  favoritesCount: number;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  lang,
  onToggleLang,
  isDark,
  onToggleTheme,
  favoritesCount,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', labelBn: 'হোম' },
    { id: 'bot', label: 'Ariyan Bot', labelBn: 'আরিয়ান বট', isAi: true },
    { id: 'directory', label: 'All Tools', labelBn: 'সব টুলস' },
    { id: 'categories', label: 'Categories', labelBn: 'ক্যাটাগরি' },
    { id: 'popular', label: 'Popular', labelBn: 'জনপ্রিয়' },
    { id: 'guides', label: 'Guides', labelBn: 'গাইড' },
    { id: 'about', label: 'About', labelBn: 'আমাদের সম্পর্কে' },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-slate-800/80 bg-slate-950/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <button 
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
          aria-label="NovaTools Homepage"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-600 p-[1.5px] transition-transform duration-300 group-hover:scale-105 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                NovaTools
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                80+
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              {lang === 'en' ? 'One Limitless Workspace' : 'এক সীমাহীন ওয়ার্কস্পেস'}
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 shadow-sm'
                    : item.isAi
                    ? 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.isAi && <Bot className="w-4 h-4 text-cyan-400" />}
                <span>{lang === 'en' ? item.label : item.labelBn}</span>
                {item.isAi && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions (Search, Language, Theme, Favorites) */}
        <div className="flex items-center gap-2">
          
          {/* Quick Search trigger button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-inner group"
            aria-label="Open search dialog"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
            <span className="hidden sm:inline">
              {lang === 'en' ? 'Quick search...' : 'টুল খুঁজুন...'}
            </span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
              /
            </kbd>
          </button>

          {/* Favorites Filter Trigger */}
          <button
            onClick={() => handleNav('favorites')}
            className={`relative p-2 rounded-xl border transition-all ${
              currentView === 'favorites'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:text-amber-400 hover:border-slate-700'
            }`}
            title="Favorites"
            aria-label="View Favorites"
          >
            <Star className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 transition-all"
            aria-label="Toggle language"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{lang === 'en' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            aria-label="Toggle theme"
            title="Toggle Dark / Light Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-1 backdrop-blur-2xl">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm font-medium text-slate-200 hover:bg-slate-800/80"
            >
              <span className="flex items-center gap-2">
                {item.isAi && <Bot className="w-4 h-4 text-cyan-400" />}
                <span>{lang === 'en' ? item.label : item.labelBn}</span>
                {item.isAi && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    AI
                  </span>
                )}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 px-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% In-Browser Privacy
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
