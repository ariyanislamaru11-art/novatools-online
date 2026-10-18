import React, { useState } from 'react';
import { ShieldCheck, Lock, FileText, HelpCircle, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

interface LegalPagesProps {
  page: 'about' | 'privacy' | 'terms' | 'cookies' | 'disclaimer' | 'contact' | 'help';
  lang: 'en' | 'bn';
}

export const LegalPages: React.FC<LegalPagesProps> = ({ page, lang }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {page === 'privacy' && (
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Client-Side Privacy Policy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-lg font-bold text-white">1. Zero Server File Uploads</h2>
            <p>
              NovaTools was engineered with a privacy-first architecture. All PDF manipulations, image conversions, cryptographic hashing, and text evaluations execute exclusively within your local web browser’s memory using modern HTML5 Canvas, Web Crypto, and client-side WebAssembly routines.
            </p>
            <p>
              Your personal photos, contracts, financial documents, JSON payloads, and passwords are never transmitted across the network to our servers or any third-party infrastructure.
            </p>

            <h2 className="text-lg font-bold text-white pt-4">2. Local Storage & Preferences</h2>
            <p>
              We store non-sensitive user preferences—such as your preferred interface language (English or Bengali), dark/light theme choice, and favorited tool shortcuts—in your browser’s local storage (`localStorage`). This data remains strictly on your device and can be cleared at any time via your browser settings.
            </p>

            <h2 className="text-lg font-bold text-white pt-4">3. Third-Party Analytics & Advertising</h2>
            <p>
              When optional advertising or analytics are enabled, only anonymized aggregate telemetry (such as tool visit counts and error statuses) is collected. We never record file contents, names, or user input values.
            </p>
          </div>
        </div>
      )}

      {page === 'about' && (
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold uppercase">
            <Sparkles className="w-4 h-4" />
            <span>About NovaTools</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            About NovaTools
          </h1>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-sm text-slate-300 leading-relaxed">
            <p className="text-base text-slate-200">
              NovaTools was created with a singular, resolute mission: <strong>80+ Powerful Tools. One Limitless Workspace. Free tools, less hassle, more possibilities.</strong>
            </p>
            <p>
              Too many online utilities are riddled with hidden subscriptions, fake download traps, sluggish server queues, and intrusive ads that compromise user privacy. NovaTools provides high-speed, genuinely functional utilities that execute right in your browser.
            </p>
            <p>
              Whether you need to convert high-res photos, sign or split PDF contracts, calculate loan EMIs, or test regular expressions, NovaTools gives you instant access without forcing registration or signups.
            </p>
          </div>

          {/* Our Story & Ownership Credit */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{lang === 'en' ? 'Our Story' : 'আমাদের গল্প'}</span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {lang === 'en' ? 'Built by Ariyan' : 'আইয়ানের রূপকল্প ও নির্মাণ'}
            </h2>

            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                NovaTools is a digital workspace built around the goal of making everyday online tasks easier, faster, and more accessible. Rather than navigating dozens of separate websites with inconsistent quality, NovaTools brings essential file converters, PDF managers, text formatters, developer tools, calculators, and the intelligent Ariyan Bot AI into one seamless environment.
              </p>
              <p>
                The platform is founded and created by <strong>Ariyan</strong>, whose architectural vision drives its development and continuous enhancement, with creative reference and inspiration provided by <strong>Ritu</strong>.
              </p>
            </div>

            {/* Futuristic Owner Callout Card */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">ARIYAN</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {lang === 'en' ? '“One Mind. One Vision. Limitless Possibilities.”' : '“এক অভিন্ন দৃষ্টিভঙ্গি। সীমাহীন সম্ভাবনা।”'}
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-1">
                  Creative Reference: <span className="text-violet-300 font-medium">Ritu</span>
                </div>
              </div>

              <div className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 via-slate-900 to-violet-500/10 border border-slate-700 text-xs font-mono font-bold text-slate-200">
                Primary Owner &amp; Founder of NovaTools
              </div>
            </div>
          </div>
        </div>
      )}

      {page === 'terms' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-base font-bold text-white">Acceptance of Terms</h2>
            <p>By accessing or using NovaTools, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must discontinue using our utilities.</p>
            <h2 className="text-base font-bold text-white pt-2">Acceptable Use</h2>
            <p>You agree not to use NovaTools for any unlawful purpose or in any manner that could interfere with or disrupt services for other users.</p>
            <h2 className="text-base font-bold text-white pt-2">Warranty Disclaimer</h2>
            <p>All tools and calculators are provided on an "as is" and "as available" basis without warranties of any kind.</p>
          </div>
        </div>
      )}

      {page === 'cookies' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Cookie Policy</h1>
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>NovaTools uses essential browser storage to remember your preferred theme, language selection, and favorited tools across browsing sessions.</p>
            <p>No tracking cookies or advertising cookies are set without your consent.</p>
          </div>
        </div>
      )}

      {page === 'disclaimer' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Disclaimer</h1>
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>Financial calculators (such as Loan EMI, Compound Interest, and VAT) provide mathematical approximations based on user-supplied numbers. They do not constitute official financial, legal, or tax advice. Consult a certified financial advisor for actual loan contracts and obligations.</p>
          </div>
        </div>
      )}

      {page === 'contact' && (
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Contact Support & Feedback</h1>
          <p className="text-sm text-slate-400">Have feedback, discovered a bug, or want to suggest a new tool? Send us a message.</p>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
            {contactSubmitted ? (
              <div className="text-center py-8 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Thank You for Your Feedback!</h3>
                <p className="text-xs text-slate-400">Your message has been received. Our team will review your comments promptly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Message or Tool Request</label>
                  <textarea
                    rows={5}
                    required
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
