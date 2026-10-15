import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { ToolDef } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: ToolDef[];
  onSelectTool: (slug: string) => void;
  lang: 'en' | 'bn';
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  tools,
  onSelectTool,
  lang,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut '/' to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        // open search modal trigger
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? tools.filter(t => {
        const q = query.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.nameBn.includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some(k => k.toLowerCase().includes(q))
        );
      })
    : tools.filter(t => t.isPopular);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Global Tool Search"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center p-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-cyan-400 ml-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={lang === 'en' ? 'Search 80+ tools (e.g. PDF Reader, PNG to JPG, Resizer, QR)...' : 'টুল খুঁজুন...'}
            className="w-full py-2 px-3 text-sm text-white placeholder-slate-400 bg-transparent focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-800/40">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 px-3 py-1.5">
            {query.trim() ? `Search Results (${results.length})` : 'Popular Tools'}
          </div>

          {results.length > 0 ? (
            results.map(tool => (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.slug);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-xs font-bold font-mono">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-cyan-400">
                      {lang === 'en' ? tool.name : tool.nameBn}
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">
                      {lang === 'en' ? tool.description : tool.descriptionBn}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 -translate-x-1 group-hover:translate-x-0 transition-transform" />
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching tools found for "{query}".
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 font-mono text-[10px]">ESC</kbd> to exit</span>
          <span>82 Tools Available</span>
        </div>
      </div>
    </div>
  );
};
