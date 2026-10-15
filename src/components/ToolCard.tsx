import React from 'react';
import { 
  Star, 
  ArrowRight, 
  Sparkles,
  Image as ImageIcon,
  FileText,
  Type,
  Code,
  Calculator,
  Lock,
  Layers,
  Crop,
  Maximize,
  Minimize,
  Scissors,
  CheckCircle2
} from 'lucide-react';
import { ToolDef } from '../types';

interface ToolCardProps {
  tool: ToolDef;
  onSelect: (slug: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  lang: 'en' | 'bn';
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onSelect,
  isFavorite,
  onToggleFavorite,
  lang,
}) => {
  // Category visual color mappings
  const categoryStyles: Record<string, { badge: string; iconBg: string }> = {
    image: {
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    pdf: {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    text: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    developer: {
      badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    calculator: {
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
  };

  const style = categoryStyles[tool.category] || categoryStyles.image;

  return (
    <div
      onClick={() => onSelect(tool.slug)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm"
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(tool.slug);
        }
      }}
      aria-label={`${tool.name} - ${tool.description}`}
    >
      {/* Top row: Icon, Category & Favorite Button */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${style.iconBg} group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
            {tool.category === 'image' && <ImageIcon className="w-5 h-5" />}
            {tool.category === 'pdf' && <FileText className="w-5 h-5" />}
            {tool.category === 'text' && <Type className="w-5 h-5" />}
            {tool.category === 'developer' && <Code className="w-5 h-5" />}
            {tool.category === 'calculator' && <Calculator className="w-5 h-5" />}
          </div>

          <div className="flex items-center gap-1.5">
            {tool.isPopular && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Popular
              </span>
            )}
            <button
              onClick={e => onToggleFavorite(tool.id, e)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mb-1.5 line-clamp-1">
          {lang === 'en' ? tool.name : tool.nameBn}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {lang === 'en' ? tool.description : tool.descriptionBn}
        </p>
      </div>

      {/* Bottom row: Category badge & Launch arrow */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${style.badge}`}>
          {tool.category}
        </span>

        <span className="inline-flex items-center gap-1 text-slate-400 group-hover:text-cyan-400 font-semibold transition-colors">
          <span>Launch</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </div>
  );
};
