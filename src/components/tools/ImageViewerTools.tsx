import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Maximize2, 
  Check, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  Eye, 
  FileText, 
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { ToolDef } from '../../types';
import { 
  convertImageFormat, 
  resizeImage, 
  cropImage, 
  rotateAndFlipImage, 
  addWatermarkToImage, 
  stripExifMetadata, 
  generateFaviconSizes,
  ProcessedImageResult 
} from '../../utils/imageProcessing';
import { imagesToPDF } from '../../utils/pdfProcessing';

interface ImageViewerToolsProps {
  tool: ToolDef;
  lang: 'en' | 'bn';
}

export const ImageViewerTools: React.FC<ImageViewerToolsProps> = ({ tool, lang }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);

  // Tool specific configurations
  const [quality, setQuality] = useState(0.85);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(600);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  // Watermark
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkPos, setWatermarkPos] = useState<'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.6);
  const [watermarkSize, setWatermarkSize] = useState(36);
  const [watermarkColor, setWatermarkColor] = useState('#ffffff');

  // Color picker
  const [pickedColor, setPickedColor] = useState<{ hex: string; rgb: string; hsl: string } | null>(null);
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Favicons
  const [faviconResults, setFaviconResults] = useState<Array<{ size: number; dataUrl: string; blob: Blob }>>([]);

  // Multi-image to PDF
  const [multiFiles, setMultiFiles] = useState<File[]>([]);
  const [pdfPageFormat, setPdfPageFormat] = useState<'A4' | 'Letter' | 'Fit'>('A4');
  const [pdfMargin, setPdfMargin] = useState(20);

  // Compare Tool
  const [secondFile, setSecondFile] = useState<File | null>(null);
  const [secondPreviewUrl, setSecondPreviewUrl] = useState<string>('');
  const [sliderPos, setSliderPos] = useState(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  const handleMultiFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setMultiFiles(filesArr);
      setSelectedFile(filesArr[0]);
      loadFile(filesArr[0]);
    }
  };

  const loadFile = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setResult(null);

    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);

      // Render to canvas for color picker
      if (canvasRef.current) {
        const c = canvasRef.current;
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
      }
    };
    img.src = url;
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspectRatio && imageNaturalSize.width > 0) {
      const ratio = imageNaturalSize.height / imageNaturalSize.width;
      setTargetHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspectRatio && imageNaturalSize.height > 0) {
      const ratio = imageNaturalSize.width / imageNaturalSize.height;
      setTargetWidth(Math.round(val * ratio));
    }
  };

  // Canvas color picker click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const p = ctx.getImageData(x, y, 1, 1).data;

    const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
    const hex = `#${toHex(p[0])}${toHex(p[1])}${toHex(p[2])}`;
    const rgb = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;

    // Calculate HSL
    const r = p[0] / 255, g = p[1] / 255, b = p[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    const hsl = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

    setPickedColor({ hex, rgb, hsl });
    setColorHistory(prev => Array.from(new Set([hex, ...prev])).slice(0, 8));
  };

  const processOperation = async () => {
    if (!selectedFile && tool.slug !== 'image-to-pdf') return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let res: ProcessedImageResult | null = null;

      switch (tool.slug) {
        case 'png-to-jpg':
          res = await convertImageFormat(selectedFile!, 'image/jpeg', quality, bgColor);
          break;
        case 'jpg-to-png':
        case 'webp-to-png':
          res = await convertImageFormat(selectedFile!, 'image/png');
          break;
        case 'png-to-webp':
        case 'jpg-to-webp':
          res = await convertImageFormat(selectedFile!, 'image/webp', quality);
          break;
        case 'image-compressor': {
          const mime = selectedFile!.type.includes('png') ? 'image/png' : 'image/jpeg';
          res = await convertImageFormat(selectedFile!, mime as any, quality);
          break;
        }
        case 'image-resizer':
          res = await resizeImage(selectedFile!, targetWidth, targetHeight, selectedFile!.type.includes('png') ? 'image/png' : 'image/jpeg', quality);
          break;
        case 'image-cropper': {
          const cropW = Math.round(imageNaturalSize.width * 0.8);
          const cropH = Math.round(imageNaturalSize.height * 0.8);
          res = await cropImage(selectedFile!, 0, 0, cropW, cropH);
          break;
        }
        case 'image-rotator-flipper':
          res = await rotateAndFlipImage(selectedFile!, rotationDegrees, flipH, flipV);
          break;
        case 'image-watermark':
          res = await addWatermarkToImage(selectedFile!, watermarkText, {
            fontSize: watermarkSize,
            color: watermarkColor,
            opacity: watermarkOpacity,
            position: watermarkPos,
          });
          break;
        case 'exif-remover':
          res = await stripExifMetadata(selectedFile!);
          break;
        case 'favicon-generator': {
          const sizes = await generateFaviconSizes(selectedFile!);
          setFaviconResults(sizes);
          setIsProcessing(false);
          return;
        }
        case 'image-to-pdf': {
          const files = multiFiles.length > 0 ? multiFiles : [selectedFile!];
          const pdfRes = await imagesToPDF(files, pdfPageFormat, pdfMargin);
          const url = URL.createObjectURL(pdfRes.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `images-compiled-${Date.now()}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          setIsProcessing(false);
          return;
        }
        default:
          res = await convertImageFormat(selectedFile!, 'image/jpeg', quality);
          break;
      }

      setResult(res);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.dataUrl;
    const ext = result.format.includes('jpeg') ? 'jpg' : result.format.includes('webp') ? 'webp' : 'png';
    const baseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'novatools-image';
    a.download = `${baseName}-processed.${ext}`;
    a.click();
  };

  return (
    <div className="space-y-8">
      
      {/* Upload Zone */}
      {!selectedFile ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-10 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-3xl bg-slate-900/50 hover:bg-slate-900/80 transition-all text-center cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            multiple={tool.slug === 'image-to-pdf'}
            onChange={tool.slug === 'image-to-pdf' ? handleMultiFileSelect : handleFileSelect}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {tool.slug === 'image-to-pdf' ? 'Choose Image(s) to Convert to PDF' : 'Drop your image here or browse'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Supports high-resolution PNG, JPG, and WebP files. All processing occurs locally on your machine.
          </p>
        </div>
      ) : (
        /* Loaded Image Workbench */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-sm font-bold text-white">{selectedFile.name}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {imageNaturalSize.width} × {imageNaturalSize.height} px
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedFile(null);
                setImagePreviewUrl('');
                setResult(null);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Change Image</span>
            </button>
          </div>

          {/* Specific Tool Controls */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
            
            {/* PNG to JPG / Quality controls */}
            {['png-to-jpg', 'png-to-webp', 'jpg-to-webp', 'image-compressor'].includes(tool.slug) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Target Quality: {Math.round(quality * 100)}%
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {quality > 0.8 ? 'Best quality' : quality > 0.5 ? 'Balanced' : 'Smallest size'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={e => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                {tool.slug === 'png-to-jpg' && (
                  <div className="flex items-center gap-3 pt-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Background Fill for Transparency:
                    </label>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={e => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-400 uppercase">{bgColor}</span>
                  </div>
                )}
              </div>
            )}

            {/* Resizer Controls */}
            {tool.slug === 'image-resizer' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={e => handleWidthChange(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={e => handleHeightChange(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    id="lockRatio"
                    checked={lockAspectRatio}
                    onChange={e => setLockAspectRatio(e.target.checked)}
                    className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <label htmlFor="lockRatio" className="text-xs text-slate-300 cursor-pointer">
                    Lock Aspect Ratio ({imageNaturalSize.width && (imageNaturalSize.width / imageNaturalSize.height).toFixed(2)})
                  </label>
                </div>
              </div>
            )}

            {/* Rotator & Flipper Controls */}
            {tool.slug === 'image-rotator-flipper' && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setRotationDegrees(r => (r + 90) % 360)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700"
                >
                  <RotateCw className="w-4 h-4 text-cyan-400" />
                  <span>Rotate 90° (Current: {rotationDegrees}°)</span>
                </button>

                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    flipH ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span>Flip Horizontal</span>
                </button>

                <button
                  onClick={() => setFlipV(!flipV)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    flipV ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  <FlipVertical className="w-4 h-4" />
                  <span>Flip Vertical</span>
                </button>
              </div>
            )}

            {/* Watermark Controls */}
            {tool.slug === 'image-watermark' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Watermark Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={e => setWatermarkText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Position</label>
                  <select
                    value={watermarkPos}
                    onChange={e => setWatermarkPos(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:border-cyan-500"
                  >
                    <option value="bottom-right">Bottom-Right</option>
                    <option value="center">Center</option>
                    <option value="bottom-left">Bottom-Left</option>
                    <option value="top-right">Top-Right</option>
                    <option value="top-left">Top-Left</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Opacity ({Math.round(watermarkOpacity * 100)}%)</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={e => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer mt-2"
                  />
                </div>
              </div>
            )}

            {/* Image to PDF Controls */}
            {tool.slug === 'image-to-pdf' && (
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Page Format</label>
                  <select
                    value={pdfPageFormat}
                    onChange={e => setPdfPageFormat(e.target.value as any)}
                    className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  >
                    <option value="A4">A4 (Standard Document)</option>
                    <option value="Letter">US Letter</option>
                    <option value="Fit">Fit to Image Size</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Page Margin (pt)</label>
                  <input
                    type="number"
                    value={pdfMargin}
                    onChange={e => setPdfMargin(parseInt(e.target.value, 10) || 0)}
                    className="w-24 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
                <div className="pt-5 text-xs text-slate-400">
                  Total Images: {multiFiles.length || 1}
                </div>
              </div>
            )}

            {/* Color Picker Interactive Canvas */}
            {tool.slug === 'image-color-picker' && (
              <div className="space-y-4">
                <div className="text-xs text-cyan-400 font-semibold">
                  Click anywhere on the image below to inspect pixel color:
                </div>
                <div className="overflow-auto max-h-[380px] rounded-xl border border-slate-800 bg-slate-950/50 flex justify-center p-2">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="cursor-crosshair max-w-full h-auto rounded"
                  />
                </div>

                {pickedColor && (
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl shadow border border-white/20"
                        style={{ backgroundColor: pickedColor.hex }}
                      />
                      <div>
                        <div className="text-base font-mono font-bold text-white">{pickedColor.hex}</div>
                        <div className="text-xs text-slate-400 font-mono">{pickedColor.rgb} • {pickedColor.hsl}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigator.clipboard.writeText(pickedColor.hex)}
                      className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy HEX</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Primary Action Button (Process / Convert) */}
            {tool.slug !== 'image-color-picker' && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={processOperation}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Locally...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{tool.slug === 'image-to-pdf' ? 'Convert to PDF & Download' : 'Process Image'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Result Output Preview & Download */}
          {result && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Image Processed Successfully</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Dimensions: {result.width} × {result.height} px
                      {result.originalSize > 0 && (
                        <> • Size: {(result.newSize / 1024).toFixed(1)} KB (
                          {result.reductionPercent > 0 ? `-${result.reductionPercent}% reduction` : 'Optimized'}
                        )</>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={downloadResult}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </button>
              </div>

              {/* Preview image */}
              <div className="max-h-[400px] overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center p-4 border border-slate-800">
                <img
                  src={result.dataUrl}
                  alt="Processed Result"
                  className="max-h-[350px] w-auto object-contain rounded"
                />
              </div>
            </div>
          )}

          {/* Favicon Generator Output Gallery */}
          {faviconResults.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-4">
              <h4 className="text-sm font-bold text-white">Generated Favicon Package:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {faviconResults.map(fav => (
                  <div key={fav.size} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <div className="h-16 flex items-center justify-center">
                      <img src={fav.dataUrl} alt={`Favicon ${fav.size}`} style={{ width: fav.size, height: fav.size }} />
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-300">{fav.size} × {fav.size}</div>
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = fav.dataUrl;
                        a.download = `favicon-${fav.size}x${fav.size}.png`;
                        a.click();
                      }}
                      className="w-full py-1 text-[11px] rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 font-semibold transition-colors"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
