import React from 'react';
import { Sparkles, ShieldCheck, Heart, ExternalLink, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, slug?: string) => void;
  lang: 'en' | 'bn';
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, lang }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-600 to-violet-600 p-[1px]">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">NovaTools</span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {lang === 'en'
                ? '80+ Powerful Tools. One Limitless Workspace. Free tools, less hassle, more possibilities. All conversions and calculations execute entirely in your browser.'
                : '৮০টিরও বেশি শক্তিশালী ফ্রি অনলাইন টুলস। কোনো সফটওয়্যার ইন্সটল ছাড়াই ব্রাউজারেই দ্রুত ও নিরাপদে ছবি, পিডিএফ এবং টেক্সট প্রসেস করুন।'}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'en' ? 'Zero Server Uploads • Client-Side Privacy' : '১০০% ক্লায়েন্ট-সাইড প্রসেসিং • ফাইল সম্পূর্ণ নিরাপদ'}</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              {lang === 'en' ? 'Categories' : 'ক্যাটাগরি'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('categories', 'image')} className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'Image Converters & Editors' : 'ছবি রূপান্তর ও সম্পাদনা'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories', 'pdf')} className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'PDF Utilities & Reader' : 'পিডিএফ টুলস ও রিডার'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories', 'text')} className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'Text & Document Utilities' : 'টেক্সট ও ডকুমেন্ট টুলস'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories', 'developer')} className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'Developer, QR & SEO' : 'ডেভেলপার ও এসইও'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('categories', 'calculator')} className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'Calculators & Productivity' : 'ক্যালকুলেটর ও প্রোডাক্টিভিটি'}
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              {lang === 'en' ? 'Featured Tools' : 'জনপ্রিয় টুলস'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('tool', 'pdf-reader')} className="hover:text-cyan-400 transition-colors">
                  PDF Reader & Viewer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool', 'png-to-jpg')} className="hover:text-cyan-400 transition-colors">
                  PNG to JPG Converter
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool', 'merge-pdf')} className="hover:text-cyan-400 transition-colors">
                  Merge PDF Files
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool', 'qr-code-generator')} className="hover:text-cyan-400 transition-colors">
                  QR Code Generator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool', 'password-generator')} className="hover:text-cyan-400 transition-colors">
                  Secure Password Generator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool', 'percentage-calculator')} className="hover:text-cyan-400 transition-colors">
                  Percentage Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              {lang === 'en' ? 'Trust & Policies' : 'পলিসি ও সহায়তা'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'Privacy Policy' : 'গোপনীয়তা নীতি'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'Terms of Service' : 'ব্যবহারের শর্তাবলী'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cookies')} className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'Cookie Policy' : 'কুকি পলিসি'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('disclaimer')} className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'Disclaimer' : 'দায়মুক্তি বিজ্ঞপ্তি'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'About Us' : 'আমাদের পরিচিতি'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-cyan-400 transition-colors">
                  {lang === 'en' ? 'Contact Support' : 'যোগাযোগ'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {year} NovaTools. All rights reserved. Free, open, and private online tools workspace.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              <span>{lang === 'en' ? 'Created with vision by' : 'পরিকল্পনা ও রূপায়ণে'}</span>
              <span className="font-bold bg-gradient-to-r from-cyan-300 via-sky-300 to-cyan-400 bg-clip-text text-transparent">
                Ariyan
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
              • {lang === 'en' ? 'Website Owner & Creator' : 'মালিক ও নির্মাতা'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
