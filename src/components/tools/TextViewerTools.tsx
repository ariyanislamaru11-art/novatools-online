import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  Volume2, 
  Play, 
  Square, 
  Search, 
  Code, 
  Eye, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ToolDef } from '../../types';
import { 
  analyzeText, 
  analyzeCharacterTypes, 
  convertCase, 
  cleanWhitespace, 
  sortLines, 
  removeDuplicateLines, 
  findAndReplace, 
  computeLineDiff, 
  generateSlug, 
  encodeHTMLEntities, 
  decodeHTMLEntities, 
  utf8ToBase64, 
  base64ToUtf8, 
  formatJSON, 
  minifyJSON, 
  formatXML, 
  parseCSV, 
  generateLoremIpsum 
} from '../../utils/textProcessing';

interface TextViewerToolsProps {
  tool: ToolDef;
  lang: 'en' | 'bn';
}

export const TextViewerTools: React.FC<TextViewerToolsProps> = ({ tool, lang }) => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Tool-specific states
  // Word counter
  const [stats, setStats] = useState(analyzeText(''));
  const [charTypes, setCharTypes] = useState(analyzeCharacterTypes(''));

  // Case converter
  const [caseType, setCaseType] = useState<string>('upper');

  // Space remover
  const [removeMultiSpaces, setRemoveMultiSpaces] = useState(true);
  const [removeBlankLines, setRemoveBlankLines] = useState(true);
  const [trimLines, setTrimLines] = useState(true);

  // Sort lines
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [sortNumeric, setSortNumeric] = useState(false);
  const [sortCaseSensitive, setSortCaseSensitive] = useState(false);

  // Find & Replace
  const [findWord, setFindWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [replaceCount, setReplaceCount] = useState<number | null>(null);

  // Text diff
  const [originalDiffText, setOriginalDiffText] = useState('Line 1: NovaTools is fast.\nLine 2: Free and open workspace.\nLine 3: 80+ tools.');
  const [modifiedDiffText, setModifiedDiffText] = useState('Line 1: NovaTools is blazing fast.\nLine 2: Free and open workspace.\nLine 3: 82+ powerful tools.');

  // Lorem Ipsum
  const [loremType, setLoremType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [loremCount, setLoremCount] = useState<number>(3);

  // CSV
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: string[][] }>({ headers: [], rows: [] });
  const [csvSearch, setCsvSearch] = useState('');

  // Regex
  const [regexPattern, setRegexPattern] = useState('[0-9]+');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexMatches, setRegexMatches] = useState<string[]>([]);

  // Text to speech
  const [ttsRate, setTtsRate] = useState(1);
  const [ttsPitch, setTtsPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize samples on tool change
  useEffect(() => {
    setErrorNotice(null);
    setCopied(false);

    if (tool.slug === 'word-counter' || tool.slug === 'character-counter') {
      setInputText('NovaTools provides 80+ powerful online utilities. সম্পূর্ণ নিরাপদ ও ফ্রি অনলাইন টুলস প্ল্যাটফর্ম।');
    } else if (tool.slug === 'json-formatter') {
      setInputText('{"brand":"NovaTools","version":2.0,"tools":82,"features":["privacy","no-login","fast"]}');
    } else if (tool.slug === 'xml-formatter') {
      setInputText('<catalog><tool id="1"><name>PDF Reader</name><category>PDF</category></tool></catalog>');
    } else if (tool.slug === 'csv-viewer-converter') {
      setInputText('Tool Name,Category,Status\nPDF Reader,PDF,Ready\nPNG to JPG,Image,Ready\nWord Counter,Text,Ready');
    } else if (tool.slug === 'regex-tester') {
      setInputText('Contact us at support@novatools.app or visit order #12345 in 2026.');
    } else if (tool.slug === 'text-to-speech') {
      setInputText('Welcome to NovaTools. Eighty powerful tools in one limitless workspace.');
    } else if (tool.slug === 'markdown-preview') {
      setInputText('# NovaTools Workspace\n\n- **Client-Side Privacy**\n- **80+ Real Tools**\n- *No software installation needed*\n\n```js\nconsole.log("Ready to build!");\n```');
    }
  }, [tool.slug]);

  // Live calculation for counters and converters
  useEffect(() => {
    if (tool.slug === 'word-counter') {
      setStats(analyzeText(inputText));
    } else if (tool.slug === 'character-counter') {
      setCharTypes(analyzeCharacterTypes(inputText));
    } else if (tool.slug === 'case-converter') {
      setOutputText(convertCase(inputText, caseType as any));
    } else if (tool.slug === 'url-slug-generator') {
      setOutputText(generateSlug(inputText));
    } else if (tool.slug === 'csv-viewer-converter') {
      const parsed = parseCSV(inputText);
      setCsvData(parsed);
      setOutputText(JSON.stringify(parsed.rows.map(r => {
        const obj: Record<string, string> = {};
        parsed.headers.forEach((h, i) => { obj[h || `col_${i}`] = r[i] || ''; });
        return obj;
      }), null, 2));
    } else if (tool.slug === 'regex-tester') {
      try {
        if (!regexPattern) {
          setRegexMatches([]);
          return;
        }
        const re = new RegExp(regexPattern, regexFlags);
        const m = inputText.match(re);
        setRegexMatches(m ? Array.from(m) : []);
        setErrorNotice(null);
      } catch (err: unknown) {
        setErrorNotice(err instanceof Error ? err.message : 'Invalid RegExp');
      }
    }
  }, [inputText, caseType, tool.slug, regexPattern, regexFlags]);

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Specific Action Handlers
  const handleSpaceRemoval = () => {
    const cleaned = cleanWhitespace(inputText, {
      removeMultipleSpaces: removeMultiSpaces,
      removeBlankLines: removeBlankLines,
      trimLines: trimLines,
    });
    setOutputText(cleaned);
  };

  const handleSortLines = () => {
    const sorted = sortLines(inputText, {
      direction: sortDir,
      numeric: sortNumeric,
      caseSensitive: sortCaseSensitive,
    });
    setOutputText(sorted);
  };

  const handleRemoveDuplicates = () => {
    const res = removeDuplicateLines(inputText, sortCaseSensitive);
    setOutputText(res.result);
    setReplaceCount(res.removedCount);
  };

  const handleFindReplace = () => {
    try {
      const res = findAndReplace(inputText, findWord, replaceWord, {
        isRegex,
        matchCase,
        replaceAll: true,
      });
      setOutputText(res.result);
      setReplaceCount(res.count);
      setErrorNotice(null);
    } catch (err: unknown) {
      setErrorNotice(err instanceof Error ? err.message : 'Search failed');
    }
  };

  const handleJsonFormat = (spaces: number = 2) => {
    const res = formatJSON(inputText, spaces);
    if (res.isValid) {
      setOutputText(res.formatted);
      setErrorNotice(null);
    } else {
      setErrorNotice(res.error || 'Invalid JSON');
    }
  };

  const handleJsonMinify = () => {
    const res = minifyJSON(inputText);
    if (res.isValid) {
      setOutputText(res.minified);
      setErrorNotice(null);
    } else {
      setErrorNotice(res.error || 'Invalid JSON');
    }
  };

  const handleXmlFormat = () => {
    const res = formatXML(inputText);
    setOutputText(res.formatted);
  };

  const handleHtmlEntity = (action: 'encode' | 'decode') => {
    setOutputText(action === 'encode' ? encodeHTMLEntities(inputText) : decodeHTMLEntities(inputText));
  };

  const handleUrlEncode = (action: 'encode' | 'decode') => {
    try {
      setOutputText(action === 'encode' ? encodeURIComponent(inputText) : decodeURIComponent(inputText));
      setErrorNotice(null);
    } catch {
      setErrorNotice('Malformed URL string cannot be decoded.');
    }
  };

  const handleBase64 = (action: 'encode' | 'decode') => {
    try {
      setOutputText(action === 'encode' ? utf8ToBase64(inputText) : base64ToUtf8(inputText));
      setErrorNotice(null);
    } catch {
      setErrorNotice('Invalid Base64 sequence.');
    }
  };

  const handleLoremGenerate = () => {
    setOutputText(generateLoremIpsum(loremType, loremCount));
  };

  // Text-To-Speech execution
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      setErrorNotice('Speech Synthesis is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    if (!inputText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(inputText);
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. WORD COUNTER SPECIALIZED DASHBOARD */}
      {tool.slug === 'word-counter' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-3xl font-extrabold text-cyan-400 font-mono">{stats.words}</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Words</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">{stats.characters}</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Characters (All)</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-3xl font-extrabold text-violet-400 font-mono">{stats.charactersNoSpaces}</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Without Spaces</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-3xl font-extrabold text-amber-400 font-mono">{stats.sentences}</div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Sentences</div>
          </div>

          <div className="col-span-2 sm:col-span-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 px-6 font-mono">
            <span>Paragraphs: <strong className="text-white">{stats.paragraphs}</strong></span>
            <span>Lines: <strong className="text-white">{stats.lines}</strong></span>
            <span>Est. Reading Time: <strong className="text-white">~{stats.readingTimeMinutes} min</strong></span>
            <span>Est. Speaking Time: <strong className="text-white">~{stats.speakingTimeMinutes} min</strong></span>
          </div>
        </div>
      )}

      {/* 2. CHARACTER COUNTER BREAKDOWN */}
      {tool.slug === 'character-counter' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-2xl font-bold text-white font-mono">{charTypes.letters}</div>
            <div className="text-xs text-slate-400 font-semibold">Letters</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-2xl font-bold text-cyan-400 font-mono">{charTypes.digits}</div>
            <div className="text-xs text-slate-400 font-semibold">Digits</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-2xl font-bold text-slate-300 font-mono">{charTypes.whitespace}</div>
            <div className="text-xs text-slate-400 font-semibold">Spaces / Tabs</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-2xl font-bold text-amber-400 font-mono">{charTypes.punctuation}</div>
            <div className="text-xs text-slate-400 font-semibold">Punctuation</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-2xl font-bold text-rose-400 font-mono">{charTypes.symbols}</div>
            <div className="text-xs text-slate-400 font-semibold">Symbols</div>
          </div>
        </div>
      )}

      {/* 3. CASE CONVERTER BUTTONS */}
      {tool.slug === 'case-converter' && (
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'upper', label: 'UPPERCASE' },
            { id: 'lower', label: 'lowercase' },
            { id: 'title', label: 'Title Case' },
            { id: 'sentence', label: 'Sentence case' },
            { id: 'camel', label: 'camelCase' },
            { id: 'snake', label: 'snake_case' },
            { id: 'kebab', label: 'kebab-case' },
            { id: 'constant', label: 'CONSTANT_CASE' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setCaseType(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                caseType === c.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* 4. SPACE REMOVER CONTROLS */}
      {tool.slug === 'space-remover' && (
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={removeMultiSpaces}
              onChange={e => setRemoveMultiSpaces(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500"
            />
            Collapse Multiple Spaces
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={removeBlankLines}
              onChange={e => setRemoveBlankLines(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500"
            />
            Remove Empty Blank Lines
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={trimLines}
              onChange={e => setTrimLines(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500"
            />
            Trim Leading / Trailing Spaces
          </label>
          <button
            onClick={handleSpaceRemoval}
            className="ml-auto px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Clean Text
          </button>
        </div>
      )}

      {/* 5. SORT LINES CONTROLS */}
      {tool.slug === 'sort-text-lines' && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <select
            value={sortDir}
            onChange={e => setSortDir(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-semibold"
          >
            <option value="asc">A to Z (Ascending)</option>
            <option value="desc">Z to A (Descending)</option>
          </select>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={sortNumeric}
              onChange={e => setSortNumeric(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500"
            />
            Sort Numbers Numerically
          </label>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={sortCaseSensitive}
              onChange={e => setSortCaseSensitive(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500"
            />
            Case Sensitive
          </label>
          <button
            onClick={handleSortLines}
            className="ml-auto px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
          >
            Sort Lines
          </button>
        </div>
      )}

      {/* 6. REMOVE DUPLICATE LINES */}
      {tool.slug === 'remove-duplicate-lines' && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={sortCaseSensitive}
              onChange={e => setSortCaseSensitive(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500"
            />
            Case Sensitive Deduplication
          </label>
          <div className="flex items-center gap-3">
            {replaceCount !== null && (
              <span className="text-emerald-400 font-mono font-semibold">{replaceCount} duplicates removed</span>
            )}
            <button
              onClick={handleRemoveDuplicates}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
            >
              Remove Duplicates
            </button>
          </div>
        </div>
      )}

      {/* 7. FIND & REPLACE CONTROLS */}
      {tool.slug === 'find-and-replace' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Find Text</label>
              <input
                type="text"
                value={findWord}
                onChange={e => setFindWord(e.target.value)}
                placeholder="Search word or pattern..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Replace With</label>
              <input
                type="text"
                value={replaceWord}
                onChange={e => setReplaceWord(e.target.value)}
                placeholder="Replacement string..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={matchCase}
                  onChange={e => setMatchCase(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
                Match Case
              </label>
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRegex}
                  onChange={e => setIsRegex(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500"
                />
                Regular Expression
              </label>
            </div>
            <div className="flex items-center gap-3">
              {replaceCount !== null && (
                <span className="text-emerald-400 font-mono font-semibold">{replaceCount} matches replaced</span>
              )}
              <button
                onClick={handleFindReplace}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                Replace All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. TEXT DIFF CHECKER DUAL VIEW */}
      {tool.slug === 'text-diff-checker' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Original Text</label>
              <textarea
                rows={6}
                value={originalDiffText}
                onChange={e => setOriginalDiffText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Modified Text</label>
              <textarea
                rows={6}
                value={modifiedDiffText}
                onChange={e => setModifiedDiffText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Visual Line-by-Line Diff:</div>
            {computeLineDiff(originalDiffText, modifiedDiffText).map((d, i) => (
              <div
                key={i}
                className={`p-1.5 rounded flex items-start gap-2 ${
                  d.type === 'added'
                    ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-500'
                    : d.type === 'removed'
                    ? 'bg-rose-500/15 text-rose-300 border-l-2 border-rose-500'
                    : 'text-slate-400'
                }`}
              >
                <span className="w-5 text-right font-bold opacity-60">
                  {d.type === 'added' ? '+' : d.type === 'removed' ? '-' : ' '}
                </span>
                <span className="break-all">{d.text || <em className="opacity-40">&lt;empty line&gt;</em>}</span>
              </div>
            ))}
          </div>
        </div>
      ) : tool.slug === 'markdown-preview' ? (
        /* 9. MARKDOWN SPLIT EDITOR & LIVE PREVIEW */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">Markdown Editor</label>
              <button onClick={() => setInputText('')} className="text-xs text-slate-400 hover:text-rose-400">Clear</button>
            </div>
            <textarea
              rows={14}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">Sanitized HTML Preview</label>
              <button onClick={() => handleCopy(inputText)} className="text-xs text-cyan-400 hover:underline">
                Copy MD
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 min-h-[300px] overflow-auto prose prose-invert max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: inputText
                    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-white mb-2">$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mb-2 mt-4">$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-white mb-1 mt-3">$1</h3>')
                    .replace(/\*\*(.*)\*\*/gim, '<strong class="text-white">$1</strong>')
                    .replace(/\*(.*)\*/gim, '<em>$1</em>')
                    .replace(/`([^`]+)`/gim, '<code class="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">$1</code>')
                    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
                    .replace(/\n$/gim, '<br />')
                }} 
              />
            </div>
          </div>
        </div>
      ) : tool.slug === 'lorem-ipsum-generator' ? (
        /* 10. LOREM IPSUM GENERATOR */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Type</label>
              <select
                value={loremType}
                onChange={e => setLoremType(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Count</label>
              <input
                type="number"
                min={1}
                max={50}
                value={loremCount}
                onChange={e => setLoremCount(parseInt(e.target.value, 10) || 1)}
                className="w-20 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <button
              onClick={handleLoremGenerate}
              className="mt-4 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
            >
              Generate Lorem Text
            </button>
          </div>

          {outputText && (
            <div className="relative p-4 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => handleCopy(outputText)}
                className="absolute top-3 right-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold text-slate-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed pr-16">{outputText}</div>
            </div>
          )}
        </div>
      ) : tool.slug === 'text-to-speech' ? (
        /* 11. TEXT-TO-SPEECH CONTROLS */
        <div className="space-y-4">
          <textarea
            rows={5}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type or paste text to listen..."
            className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-6">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Speed / Rate: {ttsRate}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={ttsRate}
                  onChange={e => setTtsRate(parseFloat(e.target.value))}
                  className="accent-cyan-400 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Pitch: {ttsPitch}</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={ttsPitch}
                  onChange={e => setTtsPitch(parseFloat(e.target.value))}
                  className="accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeak}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Speak Now</span>
              </button>
              {isSpeaking && (
                <button
                  onClick={handleStopSpeak}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold flex items-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-400" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : tool.slug === 'csv-viewer-converter' ? (
        /* 12. CSV VIEWER & TABLE */
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">CSV Source Input</label>
            <textarea
              rows={4}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          {csvData.headers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Parsed Table ({csvData.rows.length} rows, {csvData.headers.length} columns)
                </span>
                <button
                  onClick={() => handleCopy(outputText)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold text-cyan-400"
                >
                  {copied ? 'Copied JSON' : 'Export / Copy as JSON'}
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-200 font-bold border-b border-slate-800">
                    <tr>
                      {csvData.headers.map((h, i) => (
                        <th key={i} className="p-3 whitespace-nowrap">{h || `Column ${i + 1}`}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {csvData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 whitespace-nowrap">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : tool.slug === 'regex-tester' ? (
        /* 13. REGEX TESTER */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Regular Expression Pattern</label>
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2">
                <span className="text-slate-500 font-mono">/</span>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={e => setRegexPattern(e.target.value)}
                  className="w-full px-2 py-1.5 bg-transparent text-white font-mono focus:outline-none"
                />
                <span className="text-slate-500 font-mono">/</span>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Flags (e.g. g, i, m)</label>
              <input
                type="text"
                value={regexFlags}
                onChange={e => setRegexFlags(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Test Text String</label>
            <textarea
              rows={4}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Matching Results ({regexMatches.length} matches found):</span>
            </div>
            {regexMatches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {regexMatches.map((m, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                    "{m}"
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono">No matches found for current regex and text.</p>
            )}
          </div>
        </div>
      ) : (
        /* STANDARD DUAL INPUT/OUTPUT CONVERTER (JSON, XML, HTML, URL, BASE64, ETC.) */
        <div className="space-y-4">
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {tool.slug === 'json-formatter' && (
              <>
                <button onClick={() => handleJsonFormat(2)} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white">
                  Beautify (2 Spaces)
                </button>
                <button onClick={() => handleJsonFormat(4)} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white">
                  Beautify (4 Spaces)
                </button>
                <button onClick={handleJsonMinify} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white">
                  Minify / Compact
                </button>
              </>
            )}

            {tool.slug === 'xml-formatter' && (
              <button onClick={handleXmlFormat} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-xs font-bold text-slate-950">
                Format XML
              </button>
            )}

            {tool.slug === 'html-entity-converter' && (
              <>
                <button onClick={() => handleHtmlEntity('encode')} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-xs font-bold text-slate-950">
                  Encode HTML Entities
                </button>
                <button onClick={() => handleHtmlEntity('decode')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-white">
                  Decode Entities
                </button>
              </>
            )}

            {tool.slug === 'url-encoder-decoder' && (
              <>
                <button onClick={() => handleUrlEncode('encode')} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-xs font-bold text-slate-950">
                  Encode URL
                </button>
                <button onClick={() => handleUrlEncode('decode')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-white">
                  Decode URL
                </button>
              </>
            )}

            {tool.slug === 'base64-encoder-decoder' && (
              <>
                <button onClick={() => handleBase64('encode')} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-xs font-bold text-slate-950">
                  Encode to Base64
                </button>
                <button onClick={() => handleBase64('decode')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-white">
                  Decode Base64
                </button>
              </>
            )}
          </div>

          {/* Dual Textareas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">Input Text / Payload</label>
                <button onClick={() => setInputText('')} className="text-xs text-slate-400 hover:text-rose-400">Clear</button>
              </div>
              <textarea
                rows={10}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Paste or write your text here..."
                className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">Output Result</label>
                <button
                  onClick={() => handleCopy(outputText)}
                  disabled={!outputText}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 disabled:opacity-40"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Result'}</span>
                </button>
              </div>
              <textarea
                rows={10}
                value={outputText}
                readOnly
                placeholder="Formatted output will appear here..."
                className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>
          </div>

        </div>
      )}

      {/* Error Notice */}
      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

    </div>
  );
};
