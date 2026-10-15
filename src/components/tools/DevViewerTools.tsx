import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  QrCode, 
  Key, 
  Code, 
  Layers, 
  Palette, 
  Link, 
  Globe, 
  AlertTriangle,
  Upload
} from 'lucide-react';
import { ToolDef } from '../../types';
import { 
  generateUUID, 
  generatePassword, 
  calculatePasswordStrength, 
  calculateHash, 
  convertUnixTimestamp, 
  parseURL, 
  generateRobotsTxt, 
  generateSitemapXml, 
  hexToRgb, 
  rgbToHex, 
  rgbToHsl, 
  hslToRgb, 
  decodeJWT, 
  explainCron 
} from '../../utils/devProcessing';

interface DevViewerToolsProps {
  tool: ToolDef;
  lang: 'en' | 'bn';
}

export const DevViewerTools: React.FC<DevViewerToolsProps> = ({ tool, lang }) => {
  const [copied, setCopied] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // QR Code
  const [qrText, setQrText] = useState('https://novatools.app');
  const [qrType, setQrType] = useState<'url' | 'text' | 'wifi'>('url');
  const [wifiSsid, setWifiSsid] = useState('HomeNetwork');
  const [wifiPassword, setWifiPassword] = useState('Secret1234');
  const [qrColorDark, setQrColorDark] = useState('#000000');
  const [qrColorLight, setQrColorLight] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Barcode
  const [barcodeText, setBarcodeText] = useState('123456789012');
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  // UUID
  const [uuidCount, setUuidCount] = useState(5);
  const [uuidList, setUuidList] = useState<string[]>([]);

  // Password Generator
  const [passLength, setPassLength] = useState(16);
  const [passUpper, setPassUpper] = useState(true);
  const [passLower, setPassLower] = useState(true);
  const [passNums, setPassNums] = useState(true);
  const [passSyms, setPassSyms] = useState(true);
  const [passAmbiguous, setPassAmbiguous] = useState(false);
  const [generatedPass, setGeneratedPass] = useState('');

  // SHA Hash
  const [hashInput, setHashInput] = useState('NovaTools 2026');
  const [hashAlgo, setHashAlgo] = useState<'SHA-256' | 'SHA-512' | 'SHA-1'>('SHA-256');
  const [hashResult, setHashResult] = useState('');

  // Timestamp
  const [timestampInput, setTimestampInput] = useState(Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 16));
  const [timestampDetails, setTimestampDetails] = useState<any>(null);

  // URL Parser
  const [urlInput, setUrlInput] = useState('https://novatools.app/tools/qr-code-generator?ref=nav&theme=dark#preview');
  const [parsedUrl, setParsedUrl] = useState<any>(null);

  // Meta Tags
  const [metaTitle, setMetaTitle] = useState('NovaTools - 80+ Free Online Tools');
  const [metaDesc, setMetaDesc] = useState('Free online workspace for image conversion, PDF manipulation, developer utilities, and calculators.');
  const [metaUrl, setMetaUrl] = useState('https://novatools.app');
  const [metaImage, setMetaImage] = useState('https://novatools.app/og-image.png');

  // Robots.txt
  const [robotsDisallows, setRobotsDisallows] = useState('/admin/\n/api/');
  const [robotsSitemap, setRobotsSitemap] = useState('https://novatools.app/sitemap.xml');
  const [robotsOutput, setRobotsOutput] = useState('');

  // Sitemap
  const [sitemapUrls, setSitemapUrls] = useState('https://novatools.app/\nhttps://novatools.app/tools/pdf-reader\nhttps://novatools.app/tools/png-to-jpg');
  const [sitemapOutput, setSitemapOutput] = useState('');

  // CSS Gradient
  const [gradType, setGradType] = useState<'linear' | 'radial'>('linear');
  const [gradAngle, setGradAngle] = useState(135);
  const [gradColor1, setGradColor1] = useState('#06b6d4');
  const [gradColor2, setGradColor2] = useState('#8b5cf6');

  // CSS Box Shadow
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(10);
  const [shadowBlur, setShadowBlur] = useState(25);
  const [shadowSpread, setShadowSpread] = useState(-5);
  const [shadowColor, setShadowColor] = useState('rgba(6, 182, 212, 0.3)');
  const [shadowInset, setShadowInset] = useState(false);

  // Color Converter
  const [colorHex, setColorHex] = useState('#06B6D4');
  const [colorRgbStr, setColorRgbStr] = useState('rgb(6, 182, 212)');
  const [colorHslStr, setColorHslStr] = useState('hsl(189, 94%, 43%)');

  // Color Palette
  const [paletteBase, setPaletteBase] = useState('#06B6D4');
  const [paletteList, setPaletteList] = useState<string[]>([]);

  // JWT Decoder
  const [jwtInput, setJwtInput] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFyaXlhbiBJc2xhbSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzk5OTk5OTk5fQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [jwtDecoded, setJwtDecoded] = useState<any>(null);

  // Cron Expression
  const [cronInput, setCronInput] = useState('*/15 * * * *');
  const [cronDesc, setCronDesc] = useState('');

  // HTTP Status Search
  const [httpSearch, setHttpSearch] = useState('');

  // Initialize tool-specific computations
  useEffect(() => {
    setErrorNotice(null);
    if (tool.slug === 'uuid-generator') {
      handleGenerateUuids();
    } else if (tool.slug === 'password-generator') {
      handleGeneratePassword();
    } else if (tool.slug === 'sha256-hash-calculator') {
      handleCalculateHash();
    } else if (tool.slug === 'timestamp-converter') {
      handleConvertTimestamp(parseInt(timestampInput, 10));
    } else if (tool.slug === 'url-parser') {
      setParsedUrl(parseURL(urlInput));
    } else if (tool.slug === 'robots-txt-generator') {
      handleGenerateRobots();
    } else if (tool.slug === 'xml-sitemap-generator') {
      handleGenerateSitemap();
    } else if (tool.slug === 'color-palette-generator') {
      handleGeneratePalette(paletteBase);
    } else if (tool.slug === 'jwt-decoder') {
      handleDecodeJwt();
    } else if (tool.slug === 'cron-expression-helper') {
      setCronDesc(explainCron(cronInput));
    }
  }, [tool.slug]);

  // QR Code Generation
  useEffect(() => {
    if (tool.slug !== 'qr-code-generator') return;
    let payload = qrText;
    if (qrType === 'wifi') {
      payload = `WIFI:T:WPA;S:${wifiSsid};P:${wifiPassword};;`;
    }

    if (qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        payload,
        {
          width: 256,
          margin: 2,
          color: {
            dark: qrColorDark,
            light: qrColorLight,
          },
        },
        err => {
          if (err) setErrorNotice(err.message);
          else {
            setErrorNotice(null);
            setQrDataUrl(qrCanvasRef.current?.toDataURL() || '');
          }
        }
      );
    }
  }, [tool.slug, qrText, qrType, wifiSsid, wifiPassword, qrColorDark, qrColorLight]);

  // Barcode Generation
  useEffect(() => {
    if (tool.slug !== 'barcode-generator' || !barcodeSvgRef.current) return;
    try {
      JsBarcode(barcodeSvgRef.current, barcodeText, {
        format: barcodeFormat,
        lineColor: '#000000',
        width: 2,
        height: 80,
        displayValue: true,
      });
      setErrorNotice(null);
    } catch (err: unknown) {
      setErrorNotice(err instanceof Error ? err.message : 'Invalid barcode characters for selected format.');
    }
  }, [tool.slug, barcodeText, barcodeFormat]);

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) list.push(generateUUID());
    setUuidList(list);
  };

  const handleGeneratePassword = () => {
    const pass = generatePassword({
      length: passLength,
      uppercase: passUpper,
      lowercase: passLower,
      numbers: passNums,
      symbols: passSyms,
      excludeAmbiguous: passAmbiguous,
    });
    setGeneratedPass(pass);
  };

  const handleCalculateHash = async () => {
    try {
      const hash = await calculateHash(hashInput, hashAlgo);
      setHashResult(hash);
    } catch (err: unknown) {
      setErrorNotice(err instanceof Error ? err.message : 'Hash calculation failed');
    }
  };

  const handleConvertTimestamp = (val: number) => {
    try {
      const details = convertUnixTimestamp(val, val > 9999999999 ? 'milliseconds' : 'seconds');
      setTimestampDetails(details);
      setErrorNotice(null);
    } catch (err: unknown) {
      setErrorNotice('Invalid Unix timestamp number.');
    }
  };

  const handleGenerateRobots = () => {
    const dis = robotsDisallows.split('\n').map(s => s.trim()).filter(Boolean);
    const txt = generateRobotsTxt({
      allowAll: dis.length === 0,
      disallowPaths: dis,
      allowPaths: ['/'],
      sitemapUrl: robotsSitemap,
    });
    setRobotsOutput(txt);
  };

  const handleGenerateSitemap = () => {
    const urls = sitemapUrls.split('\n').map(u => ({
      loc: u.trim(),
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: 'weekly',
      priority: '0.8',
    })).filter(u => u.loc.startsWith('http'));
    setSitemapOutput(generateSitemapXml(urls));
  };

  const handleColorHexChange = (hex: string) => {
    setColorHex(hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      setColorRgbStr(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setColorHslStr(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
    }
  };

  const handleGeneratePalette = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Generate harmonic angles: 0, 30, 60, 180, 210
    const offsets = [0, 30, 60, 180, 210];
    const generated = offsets.map(deg => {
      const newH = (hsl.h + deg) % 360;
      const c = hslToRgb(newH, hsl.s, hsl.l);
      return rgbToHex(c.r, c.g, c.b);
    });
    setPaletteList(generated);
  };

  const handleDecodeJwt = () => {
    try {
      const decoded = decodeJWT(jwtInput);
      setJwtDecoded(decoded);
      setErrorNotice(null);
    } catch (err: unknown) {
      setErrorNotice(err instanceof Error ? err.message : 'Invalid JWT token');
      setJwtDecoded(null);
    }
  };

  const httpCodes = [
    { code: 200, name: 'OK', desc: 'The request has succeeded. Standard response for successful HTTP requests.' },
    { code: 201, name: 'Created', desc: 'The request has been fulfilled, resulting in the creation of a new resource.' },
    { code: 204, name: 'No Content', desc: 'The server successfully processed the request, and is not returning any content.' },
    { code: 301, name: 'Moved Permanently', desc: 'This and all future requests should be directed to the given URI.' },
    { code: 302, name: 'Found', desc: 'Tells the client to look at (browse to) another URL temporarily.' },
    { code: 304, name: 'Not Modified', desc: 'Indicates that the resource has not been modified since the version specified by request headers.' },
    { code: 400, name: 'Bad Request', desc: 'The server cannot or will not process the request due to client error (malformed syntax).' },
    { code: 401, name: 'Unauthorized', desc: 'Authentication is required and has failed or has not yet been provided.' },
    { code: 403, name: 'Forbidden', desc: 'The request was valid, but the server is refusing action due to insufficient permissions.' },
    { code: 404, name: 'Not Found', desc: 'The requested resource could not be found but may be available in the future.' },
    { code: 429, name: 'Too Many Requests', desc: 'The user has sent too many requests in a given amount of time (Rate limiting).' },
    { code: 500, name: 'Internal Server Error', desc: 'A generic error message, given when an unexpected condition was encountered on the server.' },
    { code: 502, name: 'Bad Gateway', desc: 'The server received an invalid response from the upstream server while acting as a gateway or proxy.' },
    { code: 503, name: 'Service Unavailable', desc: 'The server cannot handle the request (because it is overloaded or down for maintenance).' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. QR CODE GENERATOR */}
      {tool.slug === 'qr-code-generator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              {['url', 'text', 'wifi'].map(t => (
                <button
                  key={t}
                  onClick={() => setQrType(t as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase ${
                    qrType === t ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {qrType === 'wifi' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Wi-Fi Network Name (SSID)</label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={e => setWifiSsid(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Wi-Fi Password</label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={e => setWifiPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {qrType === 'url' ? 'Destination Website URL' : 'Plain Text Content'}
                </label>
                <textarea
                  rows={4}
                  value={qrText}
                  onChange={e => setQrText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            )}

            <div className="flex items-center gap-4 pt-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Color Dark</label>
                <input
                  type="color"
                  value={qrColorDark}
                  onChange={e => setQrColorDark(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Color Light</label>
                <input
                  type="color"
                  value={qrColorLight}
                  onChange={e => setQrColorLight(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-2xl bg-white shadow-xl">
              <canvas ref={qrCanvasRef} />
            </div>

            {qrDataUrl && (
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = qrDataUrl;
                  a.download = `novatools-qr-${Date.now()}.png`;
                  a.click();
                }}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. BARCODE GENERATOR */}
      {tool.slug === 'barcode-generator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Barcode Value / Number</label>
              <input
                type="text"
                value={barcodeText}
                onChange={e => setBarcodeText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Format</label>
              <select
                value={barcodeFormat}
                onChange={e => setBarcodeFormat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              >
                <option value="CODE128">CODE128 (Standard)</option>
                <option value="EAN13">EAN-13 (13 digits)</option>
                <option value="UPC">UPC (12 digits)</option>
                <option value="CODE39">CODE39</option>
              </select>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white flex items-center justify-center overflow-auto shadow">
            <svg ref={barcodeSvgRef} />
          </div>
        </div>
      )}

      {/* 3. UUID GENERATOR */}
      {tool.slug === 'uuid-generator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-300">Quantity:</label>
              <input
                type="number"
                min={1}
                max={50}
                value={uuidCount}
                onChange={e => setUuidCount(parseInt(e.target.value, 10) || 1)}
                className="w-20 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
              />
              <button
                onClick={handleGenerateUuids}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate</span>
              </button>
            </div>

            <button
              onClick={() => handleCopy(uuidList.join('\n'))}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy All</span>
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-xs text-cyan-300">
            {uuidList.map((id, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <span>{id}</span>
                <button onClick={() => handleCopy(id)} className="text-slate-500 hover:text-white p-1">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PASSWORD GENERATOR */}
      {tool.slug === 'password-generator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <span className="font-mono text-lg font-bold text-white tracking-wider break-all">{generatedPass}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleGeneratePassword}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCopy(generatedPass)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Strength Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Security Strength:</span>
              <span className={`font-bold ${calculatePasswordStrength(generatedPass).color}`}>
                {calculatePasswordStrength(generatedPass).label}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  calculatePasswordStrength(generatedPass).score >= 4
                    ? 'w-full bg-emerald-400'
                    : calculatePasswordStrength(generatedPass).score >= 3
                    ? 'w-3/4 bg-blue-400'
                    : 'w-1/2 bg-amber-400'
                }`}
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Password Length:</span>
                <span className="font-mono font-bold text-cyan-400">{passLength} characters</span>
              </div>
              <input
                type="range"
                min={8}
                max={64}
                value={passLength}
                onChange={e => { setPassLength(parseInt(e.target.value, 10)); handleGeneratePassword(); }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={passUpper} onChange={e => { setPassUpper(e.target.checked); }} className="rounded border-slate-700 text-cyan-500" />
                Uppercase (A-Z)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={passLower} onChange={e => { setPassLower(e.target.checked); }} className="rounded border-slate-700 text-cyan-500" />
                Lowercase (a-z)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={passNums} onChange={e => { setPassNums(e.target.checked); }} className="rounded border-slate-700 text-cyan-500" />
                Numbers (0-9)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={passSyms} onChange={e => { setPassSyms(e.target.checked); }} className="rounded border-slate-700 text-cyan-500" />
                Symbols (!@#$)
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 5. SHA HASH CALCULATOR */}
      {tool.slug === 'sha256-hash-calculator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {(['SHA-256', 'SHA-512', 'SHA-1'] as const).map(algo => (
                <button
                  key={algo}
                  onClick={() => { setHashAlgo(algo); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    hashAlgo === algo ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
            <button
              onClick={handleCalculateHash}
              className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl"
            >
              Compute Hash
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Input Text String</label>
            <textarea
              rows={3}
              value={hashInput}
              onChange={e => setHashInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
            />
          </div>

          {hashResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">{hashAlgo} Digest:</span>
                <button onClick={() => handleCopy(hashResult)} className="text-cyan-400 hover:underline">
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400 break-all">{hashResult}</div>
            </div>
          )}
        </div>
      )}

      {/* 6. TIMESTAMP CONVERTER */}
      {tool.slug === 'timestamp-converter' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={timestampInput}
              onChange={e => {
                setTimestampInput(e.target.value);
                const n = parseInt(e.target.value, 10);
                if (!isNaN(n)) handleConvertTimestamp(n);
              }}
              placeholder="Epoch timestamp (seconds or ms)..."
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono w-64"
            />
            <button
              onClick={() => {
                const nowSec = Math.floor(Date.now() / 1000);
                setTimestampInput(nowSec.toString());
                handleConvertTimestamp(nowSec);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Set to Current Timestamp
            </button>
          </div>

          {timestampDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">UTC Time:</span>
                <strong className="text-white">{timestampDetails.utc}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">ISO 8601:</span>
                <strong className="text-cyan-400">{timestampDetails.iso}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Local System Time:</span>
                <strong className="text-emerald-400">{timestampDetails.local}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Relative:</span>
                <strong className="text-amber-400">{timestampDetails.relative}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. URL PARSER */}
      {tool.slug === 'url-parser' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Enter URL to Parse</label>
            <input
              type="text"
              value={urlInput}
              onChange={e => { setUrlInput(e.target.value); setParsedUrl(parseURL(e.target.value)); }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
            />
          </div>

          {parsedUrl?.isValid && (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Protocol</span>
                  <strong className="text-cyan-400">{parsedUrl.protocol}</strong>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Hostname</span>
                  <strong className="text-emerald-400">{parsedUrl.hostname}</strong>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Port</span>
                  <strong className="text-white">{parsedUrl.port}</strong>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Pathname</span>
                  <strong className="text-violet-400 truncate block">{parsedUrl.pathname}</strong>
                </div>
              </div>

              {parsedUrl.searchParams?.length > 0 && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-2 font-bold uppercase">Query Parameters:</span>
                  <div className="space-y-1">
                    {parsedUrl.searchParams.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span className="text-cyan-300 font-bold">{p.key}</span>
                        <span className="text-slate-300">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 8. META TAG GENERATOR */}
      {tool.slug === 'meta-tag-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Page Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={e => setMetaTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={metaDesc}
                onChange={e => setMetaDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Canonical URL</label>
              <input
                type="text"
                value={metaUrl}
                onChange={e => setMetaUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Social Preview Image URL</label>
              <input
                type="text"
                value={metaImage}
                onChange={e => setMetaImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Generated HTML Head Tags:</span>
              <button
                onClick={() => handleCopy(`<title>${metaTitle}</title>\n<meta name="description" content="${metaDesc}" />\n<meta property="og:title" content="${metaTitle}" />\n<meta property="og:description" content="${metaDesc}" />\n<meta property="og:image" content="${metaImage}" />`)}
                className="text-xs text-cyan-400 hover:underline"
              >
                {copied ? 'Copied Tags' : 'Copy All'}
              </button>
            </div>
            <textarea
              rows={10}
              readOnly
              value={`<title>${metaTitle}</title>\n<meta name="description" content="${metaDesc}" />\n<link rel="canonical" href="${metaUrl}" />\n\n<!-- Open Graph / Facebook -->\n<meta property="og:type" content="website" />\n<meta property="og:url" content="${metaUrl}" />\n<meta property="og:title" content="${metaTitle}" />\n<meta property="og:description" content="${metaDesc}" />\n<meta property="og:image" content="${metaImage}" />\n\n<!-- Twitter -->\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${metaTitle}" />\n<meta name="twitter:description" content="${metaDesc}" />`}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 9. ROBOTS.TXT & SITEMAP GENERATOR */}
      {['robots-txt-generator', 'xml-sitemap-generator'].includes(tool.slug) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            {tool.slug === 'robots-txt-generator' ? (
              <>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Disallow Paths (one per line)</label>
                  <textarea
                    rows={4}
                    value={robotsDisallows}
                    onChange={e => { setRobotsDisallows(e.target.value); handleGenerateRobots(); }}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Sitemap URL</label>
                  <input
                    type="text"
                    value={robotsSitemap}
                    onChange={e => { setRobotsSitemap(e.target.value); handleGenerateRobots(); }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Page URLs (one per line)</label>
                <textarea
                  rows={8}
                  value={sitemapUrls}
                  onChange={e => { setSitemapUrls(e.target.value); handleGenerateSitemap(); }}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Generated Output:</span>
              <button
                onClick={() => handleCopy(tool.slug === 'robots-txt-generator' ? robotsOutput : sitemapOutput)}
                className="text-xs text-cyan-400 hover:underline"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              rows={10}
              readOnly
              value={tool.slug === 'robots-txt-generator' ? robotsOutput : sitemapOutput}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
            />
          </div>
        </div>
      )}

      {/* 10. CSS GRADIENT GENERATOR */}
      {tool.slug === 'css-gradient-generator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setGradType('linear')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  gradType === 'linear' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setGradType('radial')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  gradType === 'radial' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Radial
              </button>
            </div>

            {gradType === 'linear' && (
              <div>
                <label className="block text-slate-400 mb-1">Angle: {gradAngle}°</label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={gradAngle}
                  onChange={e => setGradAngle(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Color Stop 1</label>
                <input
                  type="color"
                  value={gradColor1}
                  onChange={e => setGradColor1(e.target.value)}
                  className="w-full h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Color Stop 2</label>
                <input
                  type="color"
                  value={gradColor2}
                  onChange={e => setGradColor2(e.target.value)}
                  className="w-full h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div
              className="w-full h-40 rounded-xl shadow-inner border border-white/10"
              style={{
                background: gradType === 'linear'
                  ? `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})`
                  : `radial-gradient(circle, ${gradColor1}, ${gradColor2})`
              }}
            />
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <span className="text-cyan-300 truncate">
                background: {gradType === 'linear' ? `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})` : `radial-gradient(circle, ${gradColor1}, ${gradColor2})`};
              </span>
              <button
                onClick={() => handleCopy(`background: ${gradType === 'linear' ? `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})` : `radial-gradient(circle, ${gradColor1}, ${gradColor2})`};`)}
                className="text-cyan-400 ml-2 font-bold hover:underline shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. CSS BOX SHADOW GENERATOR */}
      {tool.slug === 'css-box-shadow-generator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">X Offset: {shadowX}px</label>
              <input type="range" min={-50} max={50} value={shadowX} onChange={e => setShadowX(parseInt(e.target.value, 10))} className="w-full accent-cyan-400" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Y Offset: {shadowY}px</label>
              <input type="range" min={-50} max={50} value={shadowY} onChange={e => setShadowY(parseInt(e.target.value, 10))} className="w-full accent-cyan-400" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Blur Radius: {shadowBlur}px</label>
              <input type="range" min={0} max={100} value={shadowBlur} onChange={e => setShadowBlur(parseInt(e.target.value, 10))} className="w-full accent-cyan-400" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Spread Radius: {shadowSpread}px</label>
              <input type="range" min={-20} max={40} value={shadowSpread} onChange={e => setShadowSpread(parseInt(e.target.value, 10))} className="w-full accent-cyan-400" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={shadowInset} onChange={e => setShadowInset(e.target.checked)} className="rounded text-cyan-500" />
              Inset Shadow
            </label>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between items-center space-y-4">
            <div className="h-44 w-full flex items-center justify-center">
              <div
                className="w-36 h-28 rounded-2xl bg-slate-800 flex items-center justify-center text-xs font-bold text-white transition-all"
                style={{
                  boxShadow: `${shadowInset ? 'inset ' : ''}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`
                }}
              >
                Preview Box
              </div>
            </div>
            <div className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <span className="text-cyan-300 truncate">
                box-shadow: {shadowInset ? 'inset ' : ''}{shadowX}px {shadowY}px {shadowBlur}px {shadowSpread}px {shadowColor};
              </span>
              <button
                onClick={() => handleCopy(`box-shadow: ${shadowInset ? 'inset ' : ''}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor};`)}
                className="text-cyan-400 ml-2 font-bold hover:underline shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. COLOR CONVERTER & PALETTE */}
      {tool.slug === 'color-converter' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={colorHex}
              onChange={e => handleColorHexChange(e.target.value)}
              className="w-16 h-16 rounded-2xl border border-slate-700 cursor-pointer bg-transparent"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">HEX</span>
                <strong className="text-white">{colorHex}</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">RGB</span>
                <strong className="text-cyan-400">{colorRgbStr}</strong>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">HSL</span>
                <strong className="text-emerald-400">{colorHslStr}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 13. COLOR PALETTE GENERATOR */}
      {tool.slug === 'color-palette-generator' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={paletteBase}
              onChange={e => { setPaletteBase(e.target.value); handleGeneratePalette(e.target.value); }}
              className="w-10 h-10 rounded border border-slate-700 cursor-pointer bg-transparent"
            />
            <span className="text-xs font-mono text-slate-300">Base Brand Color: {paletteBase}</span>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {paletteList.map((hex, i) => (
              <div key={i} className="text-center space-y-2">
                <div
                  className="h-24 rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: hex }}
                  onClick={() => handleCopy(hex)}
                  title="Click to copy HEX"
                />
                <div className="text-xs font-mono text-white font-bold">{hex}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 14. JWT DECODER */}
      {tool.slug === 'jwt-decoder' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Decoding is strictly client-side. Decoding does not verify cryptographic signature or trustworthiness.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Encoded JWT String</label>
            <textarea
              rows={3}
              value={jwtInput}
              onChange={e => setJwtInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300"
            />
            <button onClick={handleDecodeJwt} className="mt-2 px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg">
              Decode Token
            </button>
          </div>

          {jwtDecoded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase">Header</span>
                <pre className="text-cyan-300 overflow-auto">{JSON.stringify(jwtDecoded.header, null, 2)}</pre>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase">Payload Claims</span>
                <pre className="text-emerald-300 overflow-auto">{JSON.stringify(jwtDecoded.payload, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 15. CRON HELPER */}
      {tool.slug === 'cron-expression-helper' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">5-Part Cron String</label>
            <input
              type="text"
              value={cronInput}
              onChange={e => { setCronInput(e.target.value); setCronDesc(explainCron(e.target.value)); }}
              placeholder="* * * * *"
              className="w-full sm:w-80 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-xs block mb-1">Human Explanation:</span>
            <div className="text-base font-bold text-emerald-400">{cronDesc}</div>
          </div>
        </div>
      )}

      {/* 16. HTTP STATUS REFERENCE */}
      {tool.slug === 'http-status-reference' && (
        <div className="space-y-4">
          <input
            type="text"
            value={httpSearch}
            onChange={e => setHttpSearch(e.target.value)}
            placeholder="Search status code (e.g. 404, 200, Forbidden, Gateway)..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {httpCodes
              .filter(c => 
                c.code.toString().includes(httpSearch) || 
                c.name.toLowerCase().includes(httpSearch.toLowerCase()) || 
                c.desc.toLowerCase().includes(httpSearch.toLowerCase())
              )
              .map(item => (
                <div key={item.code} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {item.code}
                    </span>
                    <span className="font-bold text-sm text-white">{item.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Error notice */}
      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <span>{errorNotice}</span>
        </div>
      )}

    </div>
  );
};
