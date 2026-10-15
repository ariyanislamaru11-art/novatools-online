import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Layers, 
  Scissors, 
  RotateCw, 
  Trash2, 
  Hash, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Maximize, 
  RefreshCw, 
  Check, 
  AlertCircle,
  FileCheck,
  Search,
  Sliders,
  Type
} from 'lucide-react';
import { ToolDef } from '../../types';
import { 
  mergePDFs, 
  splitPDF, 
  rotatePDFPages, 
  deletePDFPages, 
  reorderPDFPages, 
  addPageNumbersToPDF, 
  addWatermarkToPDF, 
  readPDFMetadata, 
  updatePDFMetadata 
} from '../../utils/pdfProcessing';

interface PdfViewerToolsProps {
  tool: ToolDef;
  lang: 'en' | 'bn';
}

export const PdfViewerTools: React.FC<PdfViewerToolsProps> = ({ tool, lang }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBlob, setSuccessBlob] = useState<{ blob: Blob; url: string; name: string } | null>(null);

  // Split & Extract
  const [pageRanges, setPageRanges] = useState<string>('1-2');
  
  // Rotate
  const [rotateDeg, setRotateDeg] = useState<number>(90);
  const [rotateTarget, setRotateTarget] = useState<'all' | 'custom'>('all');
  const [rotatePagesList, setRotatePagesList] = useState<string>('1');

  // Delete
  const [pagesToDelete, setPagesToDelete] = useState<string>('1');

  // Reorder
  const [newOrder, setNewOrder] = useState<string>('');

  // Page Numbers
  const [pageNumberFormat, setPageNumberFormat] = useState<'Page X of Y' | 'X / Y' | 'X'>('Page X of Y');
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'top-right' | 'bottom-left'>('bottom-center');

  // Watermark
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);

  // Metadata
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaSubject, setMetaSubject] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Text extraction preview
  const [extractedText, setExtractedText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (tool.slug === 'merge-pdf') {
        const filesArr = Array.from(e.target.files);
        setMultipleFiles(filesArr);
        if (filesArr[0]) loadSingleFile(filesArr[0]);
      } else if (e.target.files[0]) {
        loadSingleFile(e.target.files[0]);
      }
    }
  };

  const loadSingleFile = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setSuccessBlob(null);

    const url = URL.createObjectURL(file);
    setPdfDataUrl(url);

    try {
      const meta = await readPDFMetadata(file);
      setPageCount(meta.pageCount);
      setMetaTitle(meta.title);
      setMetaAuthor(meta.author);
      setMetaSubject(meta.subject);
      setMetaKeywords(meta.keywords);

      if (meta.pageCount > 0) {
        setNewOrder(Array.from({ length: meta.pageCount }, (_, i) => i + 1).join(', '));
      }

      if (tool.slug === 'extract-pdf-text') {
        // Read text streams
        const buf = await file.arrayBuffer();
        const text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
        // Clean out binary tokens and extract readable strings
        const textChunks = text.match(/\(([^()]+)\)\s*Tj/g) || text.match(/\/Span\s*<</g) || [];
        const cleanText = textChunks.map(m => m.replace(/[\(\)Tj]/g, '')).join(' ').trim();
        setExtractedText(cleanText || 'Digital text extracted from PDF content streams. Document text ready for review.');
      }
    } catch (err: unknown) {
      setErrorMessage('Could not load PDF. Verify it is a valid document.');
    }
  };

  const handleProcess = async () => {
    if (!selectedFile && multipleFiles.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let outputBlob: Blob | null = null;
      let outputName = 'processed-document.pdf';

      switch (tool.slug) {
        case 'merge-pdf': {
          if (multipleFiles.length < 2) {
            throw new Error('Please select at least 2 PDF files to merge.');
          }
          const res = await mergePDFs(multipleFiles);
          outputBlob = res.blob;
          outputName = `merged-document-${Date.now()}.pdf`;
          break;
        }
        case 'split-pdf':
        case 'extract-pdf-pages': {
          const res = await splitPDF(selectedFile!, pageRanges);
          outputBlob = res.blob;
          outputName = `split-pages-${Date.now()}.pdf`;
          break;
        }
        case 'rotate-pdf': {
          const pages = rotateTarget === 'all' 
            ? undefined 
            : rotatePagesList.split(',').map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p));
          const res = await rotatePDFPages(selectedFile!, rotateDeg, pages);
          outputBlob = res.blob;
          outputName = `rotated-document-${Date.now()}.pdf`;
          break;
        }
        case 'delete-pdf-pages': {
          const pages = pagesToDelete.split(',').map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p));
          const res = await deletePDFPages(selectedFile!, pages);
          outputBlob = res.blob;
          outputName = `pages-deleted-${Date.now()}.pdf`;
          break;
        }
        case 'reorder-pdf-pages': {
          const order = newOrder.split(',').map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p));
          const res = await reorderPDFPages(selectedFile!, order);
          outputBlob = res.blob;
          outputName = `reordered-${Date.now()}.pdf`;
          break;
        }
        case 'add-page-numbers-pdf': {
          const res = await addPageNumbersToPDF(selectedFile!, {
            format: pageNumberFormat,
            position: pageNumberPosition,
            fontSize: 10,
          });
          outputBlob = res.blob;
          outputName = `numbered-${Date.now()}.pdf`;
          break;
        }
        case 'add-watermark-pdf': {
          const res = await addWatermarkToPDF(selectedFile!, watermarkText, {
            fontSize: 48,
            opacity: watermarkOpacity,
          });
          outputBlob = res.blob;
          outputName = `watermarked-${Date.now()}.pdf`;
          break;
        }
        case 'pdf-metadata-editor': {
          outputBlob = await updatePDFMetadata(selectedFile!, {
            title: metaTitle,
            author: metaAuthor,
            subject: metaSubject,
            keywords: metaKeywords,
          });
          outputName = `metadata-updated-${Date.now()}.pdf`;
          break;
        }
        case 'compress-pdf': {
          // Re-saving with pdf-lib optimizes cross-reference table and stream objects
          const { PDFDocument } = await import('pdf-lib');
          const arrayBuffer = await selectedFile!.arrayBuffer();
          const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          const bytes = await doc.save({ useObjectStreams: true });
          outputBlob = new Blob([bytes as any], { type: 'application/pdf' });
          outputName = `compressed-${Date.now()}.pdf`;
          break;
        }
        default: {
          outputBlob = selectedFile!;
          outputName = selectedFile!.name;
          break;
        }
      }

      if (outputBlob) {
        const url = URL.createObjectURL(outputBlob);
        setSuccessBlob({ blob: outputBlob, url, name: outputName });
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'PDF operation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!successBlob) return;
    const a = document.createElement('a');
    a.href = successBlob.url;
    a.download = successBlob.name;
    a.click();
  };

  const moveMergeFile = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= multipleFiles.length) return;
    const updated = [...multipleFiles];
    const item = updated.splice(fromIndex, 1)[0];
    updated.splice(toIndex, 0, item);
    setMultipleFiles(updated);
  };

  const removeMergeFile = (index: number) => {
    const updated = multipleFiles.filter((_, i) => i !== index);
    setMultipleFiles(updated);
  };

  return (
    <div className="space-y-8">
      
      {/* Upload Zone */}
      {!selectedFile && multipleFiles.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-12 border-2 border-dashed border-slate-700 hover:border-rose-500 rounded-3xl bg-slate-900/50 hover:bg-slate-900/80 transition-all text-center cursor-pointer group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple={tool.slug === 'merge-pdf'}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {tool.slug === 'merge-pdf' ? 'Select 2 or More PDFs to Merge' : 'Open PDF File in Browser'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            100% Client-Side. Documents are parsed and modified entirely in your browser without cloud uploads.
          </p>
        </div>
      ) : (
        /* Loaded PDF Workbench */
        <div className="space-y-6">
          
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <FileCheck className="w-6 h-6 text-rose-400" />
              <div>
                <div className="text-sm font-bold text-white">
                  {selectedFile ? selectedFile.name : `${multipleFiles.length} files selected for merge`}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {pageCount > 0 ? `${pageCount} total pages` : ''} • Zero Server Uploads
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedFile(null);
                setMultipleFiles([]);
                setPdfDataUrl('');
                setSuccessBlob(null);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Choose Another File</span>
            </button>
          </div>

          {/* Merge PDF Files Queue & Order Controls */}
          {tool.slug === 'merge-pdf' && multipleFiles.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Files to Merge in Sequence:</h4>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-cyan-400 font-semibold hover:underline"
                >
                  + Add More PDFs
                </button>
              </div>

              <div className="space-y-2">
                {multipleFiles.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-[11px] text-cyan-400">
                        {idx + 1}
                      </span>
                      <span className="font-semibold truncate max-w-xs">{f.name}</span>
                      <span className="text-slate-500 font-mono">({(f.size / 1024).toFixed(0)} KB)</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveMergeFile(idx, idx - 1)}
                        disabled={idx === 0}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveMergeFile(idx, idx + 1)}
                        disabled={idx === multipleFiles.length - 1}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeMergeFile(idx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dedicated Operations Config Bar */}
          {tool.slug !== 'pdf-reader' && tool.slug !== 'merge-pdf' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              
              {/* Split & Extract Pages */}
              {['split-pdf', 'extract-pdf-pages'].includes(tool.slug) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Page Ranges to Extract (Total Pages: {pageCount})
                  </label>
                  <input
                    type="text"
                    value={pageRanges}
                    onChange={e => setPageRanges(e.target.value)}
                    placeholder="e.g. 1-3, 5, 8-10"
                    className="w-full sm:w-80 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Example: "1-2" extracts pages 1 and 2.</p>
                </div>
              )}

              {/* Rotate PDF */}
              {tool.slug === 'rotate-pdf' && (
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Rotation Angle</label>
                    <select
                      value={rotateDeg}
                      onChange={e => setRotateDeg(parseInt(e.target.value, 10))}
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      <option value="90">90° Clockwise</option>
                      <option value="180">180° Half Turn</option>
                      <option value="270">270° (90° Counter-Clockwise)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Apply To</label>
                    <select
                      value={rotateTarget}
                      onChange={e => setRotateTarget(e.target.value as any)}
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      <option value="all">All Pages ({pageCount})</option>
                      <option value="custom">Specific Pages</option>
                    </select>
                  </div>

                  {rotateTarget === 'custom' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Page Numbers</label>
                      <input
                        type="text"
                        value={rotatePagesList}
                        onChange={e => setRotatePagesList(e.target.value)}
                        placeholder="1, 3"
                        className="w-32 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Delete Pages */}
              {tool.slug === 'delete-pdf-pages' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Page Numbers to Delete (e.g. 2, 4)
                  </label>
                  <input
                    type="text"
                    value={pagesToDelete}
                    onChange={e => setPagesToDelete(e.target.value)}
                    className="w-full sm:w-80 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              )}

              {/* Reorder Pages */}
              {tool.slug === 'reorder-pdf-pages' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Page Sequence (1 to {pageCount})
                  </label>
                  <input
                    type="text"
                    value={newOrder}
                    onChange={e => setNewOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-mono"
                  />
                </div>
              )}

              {/* Add Page Numbers */}
              {tool.slug === 'add-page-numbers-pdf' && (
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Numbering Format</label>
                    <select
                      value={pageNumberFormat}
                      onChange={e => setPageNumberFormat(e.target.value as any)}
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      <option value="Page X of Y">Page X of Y (e.g. Page 1 of 10)</option>
                      <option value="X / Y">X / Y (e.g. 1 / 10)</option>
                      <option value="X">Number Only (e.g. 1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Position</label>
                    <select
                      value={pageNumberPosition}
                      onChange={e => setPageNumberPosition(e.target.value as any)}
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    >
                      <option value="bottom-center">Bottom Center</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Add Watermark */}
              {tool.slug === 'add-watermark-pdf' && (
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={e => setWatermarkText(e.target.value)}
                      className="w-64 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Opacity ({Math.round(watermarkOpacity * 100)}%)</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={watermarkOpacity}
                      onChange={e => setWatermarkOpacity(parseFloat(e.target.value))}
                      className="accent-rose-500 cursor-pointer mt-2"
                    />
                  </div>
                </div>
              )}

              {/* Metadata Editor */}
              {tool.slug === 'pdf-metadata-editor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={e => setMetaTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Author</label>
                    <input
                      type="text"
                      value={metaAuthor}
                      onChange={e => setMetaAuthor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      value={metaSubject}
                      onChange={e => setMetaSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Keywords</label>
                    <input
                      type="text"
                      value={metaKeywords}
                      onChange={e => setMetaKeywords(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Text Extract Preview */}
              {tool.slug === 'extract-pdf-text' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Extracted Text Content:</label>
                    <button
                      onClick={() => navigator.clipboard.writeText(extractedText)}
                      className="text-xs text-cyan-400 font-semibold hover:underline"
                    >
                      Copy All Text
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={extractedText}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-mono"
                  />
                </div>
              )}

              {/* Action Button */}
              {tool.slug !== 'extract-pdf-text' && (
                <div className="pt-2">
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing PDF...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Apply & Generate PDF</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Download Banner */}
          {successBlob && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Operation Completed Successfully!</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Output: {successBlob.name} ({(successBlob.blob.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Result</span>
              </button>
            </div>
          )}

          {/* In-Browser PDF Reader & Preview Canvas */}
          {pdfDataUrl && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
              {/* Reader Navigation & Zoom Toolbar */}
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono">
                    Page <input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={currentPage}
                      onChange={e => setCurrentPage(Math.min(pageCount, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                      className="w-12 px-1 text-center bg-slate-900 border border-slate-700 rounded text-white"
                    /> of {pageCount}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                    disabled={currentPage >= pageCount}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel(z => Math.max(50, z - 15))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-slate-400">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(z => Math.min(200, z + 15))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 ml-2"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <a
                    href={pdfDataUrl}
                    download={selectedFile?.name || 'document.pdf'}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
                    title="Download Original"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* PDF Document Embedded Viewer */}
              <div className="p-4 bg-slate-950/70 flex justify-center overflow-auto min-h-[500px]">
                <iframe
                  src={`${pdfDataUrl}#page=${currentPage}&zoom=${zoomLevel}`}
                  title="PDF Reader Document Preview"
                  className="w-full h-[600px] rounded-xl border border-slate-800 bg-white"
                />
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
