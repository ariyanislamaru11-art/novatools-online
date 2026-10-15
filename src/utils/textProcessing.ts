/**
 * Text & Document Processing Utilities for NovaTools
 * Supports Unicode, English, Bengali, and all UTF-8 characters
 */

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export function analyzeText(text: string): TextStats {
  if (!text) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      lines: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  
  // Unicode/Bengali-compatible word segmentation using regex matching non-whitespace sequences
  const wordsMatch = text.trim().match(/[\p{L}\p{N}\p{M}]+(?:[-'’][\p{L}\p{N}\p{M}]+)*/gu);
  const words = wordsMatch ? wordsMatch.length : 0;

  const lines = text.split(/\r\n|\r|\n/).length;
  
  // Sentences split by punctuation (. ! ? । Bengali daari)
  const sentencesMatch = text.split(/[.!?।]+/).filter(s => s.trim().length > 0);
  const sentences = sentencesMatch.length;

  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (text.trim() ? 1 : 0);

  // Standard reading speed ~ 200 wpm, speaking speed ~ 130 wpm
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  const speakingTimeMinutes = Math.max(1, Math.ceil(words / 130));

  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    sentences,
    paragraphs,
    readingTimeMinutes: words > 0 ? readingTimeMinutes : 0,
    speakingTimeMinutes: words > 0 ? speakingTimeMinutes : 0,
  };
}

export function analyzeCharacterTypes(text: string) {
  let letters = 0;
  let digits = 0;
  let whitespace = 0;
  let punctuation = 0;
  let symbols = 0;

  for (const char of text) {
    if (/\s/.test(char)) whitespace++;
    else if (/[\p{L}\p{M}]/u.test(char)) letters++;
    else if (/[\p{N}]/u.test(char)) digits++;
    else if (/[\p{P}]/u.test(char)) punctuation++;
    else symbols++;
  }

  return { letters, digits, whitespace, punctuation, symbols, total: text.length };
}

export type TextCaseType = 
  | 'upper' 
  | 'lower' 
  | 'title' 
  | 'sentence' 
  | 'camel' 
  | 'snake' 
  | 'kebab' 
  | 'constant';

export function convertCase(text: string, type: TextCaseType): string {
  if (!text) return '';

  switch (type) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.replace(/\b[\p{L}\p{M}]/gu, char => char.toUpperCase());
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*|[.!?।]\s*)([\p{L}\p{M}])/gu, (_, boundary, char) => boundary + char.toUpperCase());
    case 'camel': {
      const words = text.match(/[\p{L}\p{N}\p{M}]+/gu) || [];
      return words
        .map((w, i) => {
          const lower = w.toLowerCase();
          return i === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join('');
    }
    case 'snake': {
      const words = text.match(/[\p{L}\p{N}\p{M}]+/gu) || [];
      return words.map(w => w.toLowerCase()).join('_');
    }
    case 'kebab': {
      const words = text.match(/[\p{L}\p{N}\p{M}]+/gu) || [];
      return words.map(w => w.toLowerCase()).join('-');
    }
    case 'constant': {
      const words = text.match(/[\p{L}\p{N}\p{M}]+/gu) || [];
      return words.map(w => w.toUpperCase()).join('_');
    }
    default:
      return text;
  }
}

export function cleanWhitespace(
  text: string, 
  options: { removeMultipleSpaces?: boolean; removeBlankLines?: boolean; trimLines?: boolean }
): string {
  let lines = text.split(/\r?\n/);

  if (options.trimLines) {
    lines = lines.map(l => l.trim());
  }

  if (options.removeBlankLines) {
    lines = lines.filter(l => l.length > 0);
  }

  let result = lines.join('\n');

  if (options.removeMultipleSpaces) {
    result = result.replace(/[ \t]+/g, ' ');
  }

  return result;
}

export function sortLines(text: string, options: { direction: 'asc' | 'desc'; caseSensitive?: boolean; numeric?: boolean; length?: boolean }): string {
  const lines = text.split(/\r?\n/);
  
  lines.sort((a, b) => {
    if (options.length) {
      const diff = a.length - b.length;
      return options.direction === 'asc' ? diff : -diff;
    }

    if (options.numeric) {
      const numA = parseFloat(a.replace(/[^0-9.-]/g, '')) || 0;
      const numB = parseFloat(b.replace(/[^0-9.-]/g, '')) || 0;
      return options.direction === 'asc' ? numA - numB : numB - numA;
    }

    const valA = options.caseSensitive ? a : a.toLowerCase();
    const valB = options.caseSensitive ? b : b.toLowerCase();
    const cmp = valA.localeCompare(valB);
    return options.direction === 'asc' ? cmp : -cmp;
  });

  return lines.join('\n');
}

export function removeDuplicateLines(text: string, caseSensitive: boolean = true): { result: string; removedCount: number } {
  const lines = text.split(/\r?\n/);
  const seen = new Set<string>();
  const output: string[] = [];
  let removedCount = 0;

  for (const line of lines) {
    const key = caseSensitive ? line : line.toLowerCase();
    if (seen.has(key)) {
      removedCount++;
    } else {
      seen.add(key);
      output.push(line);
    }
  }

  return { result: output.join('\n'), removedCount };
}

export function findAndReplace(
  text: string,
  search: string,
  replaceWith: string,
  options: { isRegex?: boolean; matchCase?: boolean; replaceAll?: boolean }
): { result: string; count: number } {
  if (!search) return { result: text, count: 0 };

  let count = 0;
  try {
    let pattern: RegExp;
    const flags = (options.replaceAll !== false ? 'g' : '') + (options.matchCase ? '' : 'i');

    if (options.isRegex) {
      pattern = new RegExp(search, flags);
    } else {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      pattern = new RegExp(escaped, flags);
    }

    const matches = text.match(pattern);
    count = matches ? matches.length : 0;
    const result = text.replace(pattern, replaceWith);

    return { result, count };
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Invalid search pattern');
  }
}

export function computeLineDiff(original: string, modified: string) {
  const origLines = original.split(/\r?\n/);
  const modLines = modified.split(/\r?\n/);

  const diff: Array<{ type: 'same' | 'added' | 'removed'; text: string; lineNo?: number }> = [];
  const max = Math.max(origLines.length, modLines.length);

  for (let i = 0; i < max; i++) {
    const o = origLines[i];
    const m = modLines[i];

    if (o === undefined) {
      diff.push({ type: 'added', text: m, lineNo: i + 1 });
    } else if (m === undefined) {
      diff.push({ type: 'removed', text: o, lineNo: i + 1 });
    } else if (o === m) {
      diff.push({ type: 'same', text: o, lineNo: i + 1 });
    } else {
      diff.push({ type: 'removed', text: o, lineNo: i + 1 });
      diff.push({ type: 'added', text: m, lineNo: i + 1 });
    }
  }

  return diff;
}

export function generateSlug(text: string, separator: '-' | '_' = '-'): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/[\s_]+/g, separator)
    .replace(new RegExp(`\\${separator}+`, 'g'), separator)
    .replace(new RegExp(`^\\${separator}|\\${separator}$`, 'g'), '');
}

export function encodeHTMLEntities(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

export function decodeHTMLEntities(text: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };
  return text.replace(/&(?:amp|lt|gt|quot|#039|apos|nbsp);/g, m => map[m] || m);
}

export function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUtf8(base64: string): string {
  const binary = atob(base64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function formatJSON(jsonStr: string, spaces: number = 2): { formatted: string; isValid: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    return { formatted: JSON.stringify(parsed, null, spaces), isValid: true };
  } catch (err: unknown) {
    return { formatted: jsonStr, isValid: false, error: err instanceof Error ? err.message : 'Invalid JSON' };
  }
}

export function minifyJSON(jsonStr: string): { minified: string; isValid: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    return { minified: JSON.stringify(parsed), isValid: true };
  } catch (err: unknown) {
    return { minified: jsonStr, isValid: false, error: err instanceof Error ? err.message : 'Invalid JSON' };
  }
}

export function formatXML(xmlStr: string, indent: string = '  '): { formatted: string; isValid: boolean; error?: string } {
  try {
    // Basic formatting by tag hierarchy
    let formatted = '';
    let pad = 0;
    const lines = xmlStr.replace(/>\s*</g, '><').split(/(?=<)|(?<=>)/);

    for (let i = 0; i < lines.length; i++) {
      const node = lines[i].trim();
      if (!node) continue;

      if (node.startsWith('</')) {
        pad = Math.max(0, pad - 1);
        formatted += indent.repeat(pad) + node + '\n';
      } else if (node.startsWith('<') && !node.endsWith('/>') && !node.startsWith('<?') && !node.startsWith('<!')) {
        formatted += indent.repeat(pad) + node + '\n';
        pad++;
      } else {
        formatted += indent.repeat(pad) + node + '\n';
      }
    }

    return { formatted: formatted.trim(), isValid: true };
  } catch (err: unknown) {
    return { formatted: xmlStr, isValid: false, error: err instanceof Error ? err.message : 'Invalid XML' };
  }
}

export function parseCSV(csvText: string, delimiter: string = ','): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return { headers: [], rows: [] };
  return { headers: rows[0], rows: rows.slice(1) };
}

export function generateLoremIpsum(type: 'paragraphs' | 'sentences' | 'words', count: number): string {
  const dictionary = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
    'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis',
    'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum',
    'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non',
    'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  function getSentence() {
    const len = Math.floor(Math.random() * 8) + 8;
    const words: string[] = [];
    for (let i = 0; i < len; i++) {
      words.push(dictionary[Math.floor(Math.random() * dictionary.length)]);
    }
    const s = words.join(' ');
    return s.charAt(0).toUpperCase() + s.slice(1) + '.';
  }

  function getParagraph() {
    const sentenceCount = Math.floor(Math.random() * 4) + 4;
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(getSentence());
    }
    return sentences.join(' ');
  }

  if (type === 'words') {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      words.push(dictionary[i % dictionary.length]);
    }
    return words.join(' ');
  }

  if (type === 'sentences') {
    const list: string[] = [];
    for (let i = 0; i < count; i++) list.push(getSentence());
    return list.join(' ');
  }

  const paras: string[] = [];
  for (let i = 0; i < count; i++) paras.push(getParagraph());
  return paras.join('\n\n');
}
