import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Square,
  Image as ImageIcon,
  X,
  Copy,
  Check,
  Plus,
  Trash2,
  Globe,
  Bot,
  User,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  Paperclip,
  ArrowDown
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: {
    data: string; // base64 data url
    mimeType: string;
    name?: string;
  };
  sources?: Array<{ title: string; url: string }>;
  webSearchQueries?: string[];
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

interface AriyanBotProps {
  lang: 'en' | 'bn';
  onNavigateHome?: () => void;
}

const STORAGE_KEY = 'novatools_ariyanbot_sessions_v1';
const ACTIVE_SESSION_KEY = 'novatools_ariyanbot_active_id';

const STARTER_PROMPTS_EN = [
  { label: 'Video Noise Remover & Vocal', prompt: 'Tell me how NovaTools Video Noise Remover cancels background hiss, hum, and wind while isolating human vocals.' },
  { label: 'Explain Quantum Computing', prompt: 'Explain quantum computing in simple terms with a real-world analogy.' },
  { label: 'Bengali Poem & Translation', prompt: 'বাংলায় একটি সুন্দর প্রেরণাদায়ী কবিতা লেখো এবং ইংরেজিতে অনুবাদ করো।' },
  { label: 'Optimize React Code', prompt: 'How do I optimize React 19 state updates and prevent unnecessary re-renders?' },
];

const STARTER_PROMPTS_BN = [
  { label: 'ভিডিও নয়েজ রিমুভার ও ভোকাল', prompt: 'নোভাটুলসের ভিডিও নয়েজ রিমুভার ও ভোকাল আইসোলেটর টুলটি কীভাবে ভিডিওর ব্যাকগ্রাউন্ড নয়েজ দূর করে ভোকাল স্পষ্ট রাখে?' },
  { label: 'কোয়ান্টাম কম্পিউটিং ব্যাখ্যা', prompt: 'কোয়ান্টাম কম্পিউটিং সহজ ভাষায় বাস্তব জীবনের উদাহরণ সহ ব্যাখ্যা করো।' },
  { label: 'বাংলা কবিতা ও অর্থ', prompt: 'জীবন ও অধ্যবসায় নিয়ে একটি চমৎকার বাংলা কবিতা লেখো এবং এর অন্তর্নিহিত ভাবার্থ বুঝিয়ে দাও।' },
  { label: 'প্রোগ্রামিং সাহায্য', prompt: 'ওয়েব ডেভেলপমেন্ট শেখার জন্য একটি ধাপে ধাপে রোডম্যাপ তৈরি করে দাও।' },
];

export const AriyanBot: React.FC<AriyanBotProps> = ({ lang, onNavigateHome }) => {
  // Session management
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load conversations', e);
    }
    return [];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_SESSION_KEY) || '';
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync active conversation
  useEffect(() => {
    if (activeId) {
      const found = conversations.find(c => c.id === activeId);
      if (found) {
        setMessages(found.messages);
        return;
      }
    }
    // If no active session, start empty
    setMessages([]);
  }, [activeId, conversations]);

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to persist conversations', e);
    }
  }, [conversations]);

  useEffect(() => {
    if (activeId) {
      localStorage.setItem(ACTIVE_SESSION_KEY, activeId);
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }, [activeId]);

  // Auto scroll inner container only
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle textarea resize
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Start a new conversation
  const handleNewChat = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveId('');
    setMessages([]);
    setInput('');
    setSelectedImage(null);
    setErrorMessage(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Image upload handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(lang === 'en' ? 'Please select a valid image file (JPEG, PNG, WebP, GIF).' : 'অনুগ্রহ করে একটি সঠিক ছবির ফাইল নির্বাচন করুন (JPEG, PNG, WebP, GIF)।');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(lang === 'en' ? 'Image file size exceeds 15MB limit.' : 'ছবির সাইজ ১৫ মেগাবাইটের বেশি হতে পারবে না।');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({
        data: reader.result as string,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    // Reset file input value
    e.target.value = '';
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  // Clear current conversation
  const handleClearCurrentChat = () => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    setConversations(prev => prev.filter(c => c.id !== activeId));
    handleNewChat();
  };

  // Copy message text with headless/iframe fallback
  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const fallbackCopyText = (text: string) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {
      console.warn('Clipboard write fallback error', e);
    }
  };

  // Send message
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = (customPrompt ?? input).trim();
    if ((!promptToSend && !selectedImage) || isLoading) return;

    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: promptToSend,
      image: selectedImage || undefined,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    const sentImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Prepare abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
            image: m.image ? { data: m.image.data, mimeType: m.image.mimeType } : undefined,
          })),
          enableSearch,
        }),
      });

      let data: any;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const rawText = await response.text();
        throw new Error(
          lang === 'en'
            ? `Server returned an unexpected response (status ${response.status}). Please try again in a moment.`
            : `সার্ভার থেকে অপ্রত্যাশিত প্রতিক্রিয়া পাওয়া গেছে (স্ট্যাটাস ${response.status})। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন।`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: data.reply || 'No text output returned.',
        sources: data.sources || [],
        webSearchQueries: data.webSearchQueries || [],
        timestamp: Date.now(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Save/update conversation
      let targetId = activeId;
      if (!targetId) {
        targetId = `conv_${Date.now()}`;
        setActiveId(targetId);
        const title = promptToSend ? promptToSend.slice(0, 36) : sentImage ? `Image: ${sentImage.name}` : 'New Conversation';
        setConversations(prev => [
          {
            id: targetId,
            title,
            updatedAt: Date.now(),
            messages: finalMessages,
          },
          ...prev,
        ]);
      } else {
        setConversations(prev =>
          prev.map(c =>
            c.id === targetId
              ? { ...c, messages: finalMessages, updatedAt: Date.now() }
              : c
          )
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User manually stopped generation
        return;
      }
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Failed to communicate with Ariyan Bot.');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to render markdown text with formatting
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockContent: string[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLang = line.replace('```', '').trim();
          codeBlockContent = [];
        } else {
          inCodeBlock = false;
          const fullCode = codeBlockContent.join('\n');
          elements.push(
            <div key={`code_${idx}`} className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 font-mono text-xs">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
                <span className="text-[11px] font-semibold uppercase">{codeBlockLang || 'code'}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(fullCode)}
                  className="hover:text-cyan-400 flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-3 text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
                <code>{fullCode}</code>
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={idx} className="text-base font-bold text-white mt-4 mb-2">
            {formatInline(line.replace('### ', ''))}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h3 key={idx} className="text-lg font-bold text-white mt-4 mb-2">
            {formatInline(line.replace('## ', ''))}
          </h3>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h2 key={idx} className="text-xl font-extrabold text-white mt-5 mb-2">
            {formatInline(line.replace('# ', ''))}
          </h2>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={idx} className="ml-4 list-disc text-slate-200 text-sm my-0.5 leading-relaxed">
            {formatInline(line.replace(/^[-*]\s+/, ''))}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={idx} className="ml-4 list-decimal text-slate-200 text-sm my-0.5 leading-relaxed">
            {formatInline(line.replace(/^\d+\.\s+/, ''))}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-2" />);
      } else {
        elements.push(
          <p key={idx} className="text-sm text-slate-200 leading-relaxed my-1">
            {formatInline(line)}
          </p>
        );
      }
    });

    return elements;
  };

  // Helper for inline bold, italic, code
  const formatInline = (str: string) => {
    // Process inline code `code`
    const parts = str.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700/60">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const starterPrompts = lang === 'en' ? STARTER_PROMPTS_EN : STARTER_PROMPTS_BN;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Top Banner & Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* Custom Futuristic Ariyan Bot Glyph */}
          <div className="relative group cursor-pointer" onClick={handleNewChat}>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-600 opacity-60 group-hover:opacity-100 blur transition" />
            <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>Ariyan Bot</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/30">
                  AI
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'en'
                ? 'Intelligent Assistant & Vision Analysis • Created by Ariyan'
                : 'বুদ্ধিমান এআই অ্যাসিস্ট্যান্ট ও ইমেজ অ্যানালাইসিস • নির্মাতা: আরিয়ান'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Web Search Grounding Toggle */}
          <button
            onClick={() => setEnableSearch(s => !s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
              enableSearch
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={lang === 'en' ? 'Toggle Google Web Search Grounding' : 'লাইভ গুগল ওয়েব সার্চ চালু/বন্ধ'}
          >
            <Globe className={`w-3.5 h-3.5 ${enableSearch ? 'text-cyan-400 animate-spin-slow' : ''}`} />
            <span className="hidden sm:inline">Web Search:</span>
            <span className="font-bold">{enableSearch ? 'ON' : 'OFF'}</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{lang === 'en' ? 'New Chat' : 'নতুন চ্যাট'}</span>
          </button>

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              onClick={handleClearCurrentChat}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 transition cursor-pointer"
              title={lang === 'en' ? 'Clear Conversation' : 'কথোপকথন মুছে ফেলুন'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 min-h-0 flex gap-4">
        
        {/* Chat Messages Container */}
        <div className="flex-1 flex flex-col bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-md">
          
          {/* Scrollable messages scroll area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Empty State / Welcome Screen */}
            {messages.length === 0 && (
              <div className="max-w-2xl mx-auto py-4 sm:py-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/10 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
                  <Bot className="w-8 h-8 text-cyan-400" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {lang === 'en' ? "Hi! I'm Ariyan Bot 👋" : "হ্যালো! আমি আরিয়ান বট 👋"}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
                    {lang === 'en'
                      ? "I'm here to help you with questions, writing, learning, coding, and image analysis. What would you like to explore today?"
                      : "প্রশ্নোত্তর, লেখালেখি, প্রোগ্রামিং, শিক্ষা এবং ছবি বিশ্লেষণের কাজে আপনাকে সহায়তা করতে আমি প্রস্তুত। আজ কী নিয়ে শুরু করতে চান?"}
                  </p>
                </div>

                {/* Features Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-400 font-mono">
                    Multimodal Vision (Gemini 3.8 Flash)
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-400 font-mono">
                    English &amp; বাংলা
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-400 font-mono">
                    Google Search Grounding
                  </span>
                </div>

                {/* Starter Prompts */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
                  {starterPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 transition-all text-left flex items-start justify-between group shadow-sm"
                    >
                      <div>
                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.prompt}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Bot Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-[1px] shrink-0 mt-1">
                    <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 space-y-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/10'
                      : 'bg-slate-950/90 border border-slate-800/90 text-slate-200 shadow-xl'
                  }`}
                >
                  {/* Attached Image Preview if present */}
                  {msg.image && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700/60 max-w-sm">
                      <img
                        src={msg.image.data}
                        alt="User upload"
                        className="max-h-60 w-auto object-cover rounded-xl"
                      />
                      {msg.image.name && (
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-2 py-1 text-[10px] font-mono text-slate-300 truncate">
                          {msg.image.name}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Text Content */}
                  <div className="text-sm">
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <div>{renderMarkdown(msg.content)}</div>
                    )}
                  </div>

                  {/* Grounding Web Sources if available */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Sources &amp; Grounding Citations:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-[11px] text-slate-300 hover:text-cyan-300 transition-colors"
                          >
                            <span className="truncate max-w-[200px]">{src.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Action Footer (for Assistant) */}
                  {msg.role === 'assistant' && (
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-900">
                      <span className="font-mono text-[10px]">Ariyan Bot</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-cyan-400 flex items-center gap-1 text-[11px] cursor-pointer transition-colors"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy response</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 items-center text-slate-400 text-xs py-2">
                <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center animate-pulse">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-400 ml-1">
                    {lang === 'en' ? 'Ariyan Bot is thinking...' : 'আরিয়ান বট চিন্তা করছে...'}
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">{lang === 'en' ? 'Processing Notice' : 'বিজ্ঞপ্তি'}</div>
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Upload Bar */}
          <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
            {/* Uploaded image preview chip */}
            {selectedImage && (
              <div className="mb-3 inline-flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-700 text-xs">
                <img
                  src={selectedImage.data}
                  alt="Upload preview"
                  className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                />
                <div className="max-w-[180px] truncate text-slate-200 font-mono text-[11px]">
                  {selectedImage.name}
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="relative flex items-end gap-2 rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-cyan-500/60 p-2 transition">
              {/* Image Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition cursor-pointer shrink-0"
                title={lang === 'en' ? 'Upload Image for Vision Analysis' : 'ছবি আপলোড করুন'}
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedImage
                    ? lang === 'en'
                      ? 'Ask a question about this image...'
                      : 'এই ছবিটি সম্পর্কে কিছু জানতে চান?'
                    : lang === 'en'
                    ? 'Message Ariyan Bot... (Press Enter to send, Shift+Enter for new line)'
                    : 'আরিয়ান বটকে বার্তা পাঠান... (পাঠাতে Enter চাপুন)'
                }
                className="flex-1 max-h-44 bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none py-1.5 px-1 leading-relaxed"
              />

              {/* Send or Stop Button */}
              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition shadow-md shadow-red-500/20 cursor-pointer shrink-0"
                  title="Stop generation"
                >
                  <Square className="w-4 h-4 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() && !selectedImage}
                  className={`p-2.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                    input.trim() || selectedImage
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Input Footer Disclaimer */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>
                {lang === 'en'
                  ? 'Ariyan Bot can make mistakes. Verify important factual and coding details.'
                  : 'আরিয়ান বট ভুল করতে পারে। গুরুত্বপূর্ণ তথ্য যাচাই করে নিন।'}
              </span>
              <span className="font-mono text-[10px] hidden sm:inline">
                Owner: Ariyan
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
