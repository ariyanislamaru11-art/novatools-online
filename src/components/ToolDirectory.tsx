import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Star, 
  Clock, 
  Sparkles, 
  X,
  Layers
} from 'lucide-react';
import { ToolDef, ToolCategory } from '../types';
import { ToolCard } from './ToolCard';

interface ToolDirectoryProps {
  tools: ToolDef[];
  onSelectTool: (slug: string) => void;
  favorites: string[];
  recentSlugs: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  lang: 'en' | 'bn';
  initialCategory?: ToolCategory | 'all';
  initialFilter?: 'all' | 'popular' | 'favorites';
}

export const ToolDirectory: React.FC<ToolDirectoryProps> = ({
  tools,
  onSelectTool,
  favorites,
  recentSlugs,
  onToggleFavorite,
  lang,
  initialCategory = 'all',
  initialFilter = 'all',
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>(initialCategory);
  const [viewFilter, setViewFilter] = useState<'all' | 'popular' | 'favorites' | 'recent'>(initialFilter);
  const [sortBy, setSortBy] = useState<'popular' | 'name' | 'category'>('popular');

  const categories: Array<{ id: ToolCategory | 'all'; label: string; labelBn: string; count: number }> = [
    { id: 'all', label: 'All Tools', labelBn: 'সব টুলস', count: tools.length },
    { id: 'image', label: 'Image Tools', labelBn: 'ছবি রূপান্তর', count: tools.filter(t => t.category === 'image').length },
    { id: 'pdf', label: 'PDF Tools', labelBn: 'পিডিএফ টুলস', count: tools.filter(t => t.category === 'pdf').length },
    { id: 'text', label: 'Text & Document', labelBn: 'টেক্সট টুলস', count: tools.filter(t => t.category === 'text').length },
    { id: 'developer', label: 'Developer & SEO', labelBn: 'ডেভেলপার ও এসইও', count: tools.filter(t => t.category === 'developer').length },
    { id: 'calculator', label: 'Calculators', labelBn: 'ক্যালকুলেটর', count: tools.filter(t => t.category === 'calculator').length },
  ];

  const filteredTools = useMemo(() => {
    let list = [...tools];

    // Filter by category
    if (selectedCategory !== 'all') {
      list = list.filter(t => t.category === selectedCategory);
    }

    // Filter by view tab
    if (viewFilter === 'popular') {
      list = list.filter(t => t.isPopular);
    } else if (viewFilter === 'favorites') {
      list = list.filter(t => favorites.includes(t.id));
    } else if (viewFilter === 'recent') {
      list = list.filter(t => recentSlugs.includes(t.slug));
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.nameBn.includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.descriptionBn.includes(q) ||
        t.keywords.some(k => k.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      }
      // default: popular first
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [tools, selectedCategory, viewFilter, search, sortBy, favorites, recentSlugs]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setViewFilter('all');
    setSortBy('popular');
  };

  const hasActiveFilters = search || selectedCategory !== 'all' || viewFilter !== 'all' || sortBy !== 'popular';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Directory Title & Overview */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Complete Tool Directory ({tools.length} Tools)</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {lang === 'en' ? 'Explore NovaTools Catalog' : 'নোভাটুলসের সম্পূর্ণ ক্যাটালগ'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {lang === 'en'
              ? 'Filter by category, search by task or format, or sort alphabetically.'
              : 'ক্যাটাগরি অনুযায়ী ব্রাউজ করুন অথবা সরাসরি সার্চ করে টুল খুঁজুন।'}
          </p>
        </div>

        {/* Search bar inside directory */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'en' ? 'Filter by keyword or task...' : 'টুল বা ফাইল ফরম্যাট খুঁজুন...'}
            className="w-full py-2.5 pl-10 pr-9 text-xs sm:text-sm text-white placeholder-slate-400 bg-slate-900 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* View Tabs & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        
        {/* View Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Tools', icon: null },
            { id: 'popular', label: 'Popular', icon: Sparkles },
            { id: 'favorites', label: `Favorites (${favorites.length})`, icon: Star },
            { id: 'recent', label: `Recent (${recentSlugs.length})`, icon: Clock },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = viewFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Select & Clear */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none font-semibold cursor-pointer"
            >
              <option value="popular" className="bg-slate-900 text-slate-200">Featured</option>
              <option value="name" className="bg-slate-900 text-slate-200">Name (A-Z)</option>
              <option value="category" className="bg-slate-900 text-slate-200">Category</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 flex items-center gap-1 transition-all"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{lang === 'en' ? cat.label : cat.labelBn}</span>
              <span className="ml-1.5 text-[10px] opacity-75 font-mono">({cat.count})</span>
            </button>
          );
        })}
      </div>

      {/* Tool Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-6 font-mono">
        <span>Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}</span>
        {search && <span>Search query: "{search}"</span>}
      </div>

      {/* Tool Cards Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onSelect={onSelectTool}
              isFavorite={favorites.includes(tool.id)}
              onToggleFavorite={onToggleFavorite}
              lang={lang}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No matching tools found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search keywords, clearing category filters, or exploring all 82 tools.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
};
