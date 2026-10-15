import React from 'react';
import { 
  Image as ImageIcon, 
  FileText, 
  Type, 
  Code, 
  Calculator, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { ToolDef, ToolCategory } from '../types';

interface CategoriesViewProps {
  tools: ToolDef[];
  onSelectCategory: (cat: ToolCategory) => void;
  onSelectTool: (slug: string) => void;
  lang: 'en' | 'bn';
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  tools,
  onSelectCategory,
  onSelectTool,
  lang,
}) => {
  const getCategoryTools = (catId: ToolCategory) => tools.filter(t => t.category === catId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Tool Ecosystem</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          {lang === 'en' ? 'Browse by Category' : 'ক্যাটাগরি অনুযায়ী ব্রাউজ করুন'}
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          {lang === 'en'
            ? 'Each category is designed as a focused workspace with specialized utilities.'
            : 'প্রতিটি ক্যাটাগরির অধীনে নির্দিষ্ট কাজের জন্য প্রস্তুত শক্তিশালী অনলাইন টুলস।'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map(cat => {
          const catTools = getCategoryTools(cat.id);
          return (
            <div
              key={cat.id}
              className={`p-7 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between space-y-6 transition-all hover:scale-[1.01]`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                    {cat.id === 'image' && <ImageIcon className="w-6 h-6" />}
                    {cat.id === 'pdf' && <FileText className="w-6 h-6 text-rose-400" />}
                    {cat.id === 'text' && <Type className="w-6 h-6 text-emerald-400" />}
                    {cat.id === 'developer' && <Code className="w-6 h-6 text-violet-400" />}
                    {cat.id === 'calculator' && <Calculator className="w-6 h-6 text-amber-400" />}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-bold">
                    {catTools.length} Tools
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-1.5">
                    {lang === 'en' ? cat.title : cat.titleBn}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === 'en' ? cat.description : cat.descriptionBn}
                  </p>
                </div>

                {/* Popular tools preview in this category */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">
                    Featured in this suite:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {catTools.slice(0, 4).map(t => (
                      <button
                        key={t.id}
                        onClick={() => onSelectTool(t.slug)}
                        className="px-2 py-1 rounded-md bg-slate-950 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[11px] border border-slate-800 transition-colors"
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectCategory(cat.id)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
              >
                <span>View All {catTools.length} {cat.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
