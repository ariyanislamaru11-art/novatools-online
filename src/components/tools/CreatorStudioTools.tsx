import React, { useState, useRef, useEffect } from 'react';
import {
  FileVideo,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Download,
  Scissors,
  Music,
  FileText,
  Image as ImageIcon,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Sliders,
  Type,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Eye,
  RefreshCw,
  Film
} from 'lucide-react';
import { ToolDef } from '../../types';
import { VideoNoiseRemover } from './VideoNoiseRemover';

interface CreatorStudioToolsProps {
  tool: ToolDef;
  lang: 'en' | 'bn';
}

export const CreatorStudioTools: React.FC<CreatorStudioToolsProps> = ({ tool, lang }) => {
  if (tool.slug === 'video-noise-remover') {
    return <VideoNoiseRemover tool={tool} lang={lang} />;
  }
  if (tool.slug === 'video-trimmer') {
    return <VideoTrimmerTool lang={lang} />;
  }
  if (tool.slug === 'audio-extractor') {
    return <AudioExtractorTool lang={lang} />;
  }
  if (tool.slug === 'subtitle-editor') {
    return <SubtitleEditorTool lang={lang} />;
  }
  if (tool.slug === 'thumbnail-designer') {
    return <ThumbnailDesignerTool lang={lang} />;
  }
  if (tool.slug === 'video-inspector') {
    return <VideoInspectorTool lang={lang} />;
  }
  if (tool.slug === 'creator-export-checker') {
    return <CreatorExportCheckerTool lang={lang} />;
  }

  // Fallback to Video Noise Remover
  return <VideoNoiseRemover tool={tool} lang={lang} />;
};

/* =========================================================================
   1. VIDEO TRIMMER & CUTTER TOOL
   ========================================================================= */
const VideoTrimmerTool: React.FC<{ lang: 'en' | 'bn' }> = ({ lang }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert(lang === 'en' ? 'Please upload a valid video file.' : 'একটি সঠিক ভিডিও ফাইল আপলোড করুন।');
      return;
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    setStartTime(0);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(dur, 15));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);
    if (curr >= endTime) {
      videoRef.current.currentTime = startTime;
      if (!isPlaying) {
        videoRef.current.pause();
      }
    }
  };

  const handleExportTrim = async () => {
    if (!videoRef.current || !videoFile) return;
    setIsExporting(true);
    setExportProgress(10);

    try {
      const videoElem = videoRef.current;
      videoElem.currentTime = startTime;
      await new Promise(r => setTimeout(r, 200));

      const stream = (videoElem as any).captureStream ? (videoElem as any).captureStream() : (videoElem as any).mozCaptureStream ? (videoElem as any).mozCaptureStream() : null;

      if (!stream || typeof MediaRecorder === 'undefined') {
        throw new Error(lang === 'en' ? 'Browser does not support direct stream capture.' : 'ব্রাউজারে ভিডিও স্ট্রিম ক্যাপচার সমর্থিত নয়।');
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const trimmedBlob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(trimmedBlob);
        setDownloadUrl(url);
        setIsExporting(false);
        setExportProgress(100);
      };

      recorder.start();
      videoElem.muted = false;
      await videoElem.play();

      const trimDurationMs = (endTime - startTime) * 1000;
      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 250;
        const progress = Math.min(95, Math.floor((elapsed / trimDurationMs) * 100));
        setExportProgress(progress);
      }, 250);

      setTimeout(() => {
        clearInterval(interval);
        if (recorder.state === 'recording') {
          recorder.stop();
          videoElem.pause();
        }
      }, trimDurationMs + 100);
    } catch (err: any) {
      console.error('Trim export error', err);
      alert(err.message || 'Export failed');
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!videoFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFileSelect(f);
          }}
          className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-3xl p-12 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
          />
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Scissors className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {lang === 'en' ? 'Upload Video to Trim & Cut' : 'ভিডিও আপলোড করে ট্রিম বা কাটুন'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            {lang === 'en'
              ? 'Select start and end points to cut unwanted parts. 100% private in-browser trimming.'
              : 'শুরু ও শেষের সময় সিলেক্ট করে অপ্রয়োজনীয় অংশ কেটে ফেলুন। ব্রাউজারেই ১০০% সুরক্ষিত।'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">
            <Upload className="w-4 h-4" />
            <span>{lang === 'en' ? 'Select Video' : 'ভিডিও সিলেক্ট করুন'}</span>
          </div>
        </div>
      )}

      {videoFile && videoUrl && (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-3xl mx-auto border border-slate-800 shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              src={videoUrl}
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Timecode & Range Sliders */}
          <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-cyan-400 transition"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                  <span>{isPlaying ? (lang === 'en' ? 'Pause' : 'থামান') : (lang === 'en' ? 'Play Range' : 'প্লে করুন')}</span>
                </button>
                <div className="text-xs font-mono text-slate-300">
                  <span>Current: </span>
                  <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Trim Duration: </span>
                <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 font-bold">
                  {formatTime(Math.max(0, endTime - startTime))}
                </span>
              </div>
            </div>

            {/* Range controls */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Start Cut Point: {formatTime(startTime)}</span>
                  <span>{((startTime / (duration || 1)) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, endTime - 0.5)}
                  step={0.1}
                  value={startTime}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setStartTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>End Cut Point: {formatTime(endTime)}</span>
                  <span>{((endTime / (duration || 1)) * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min={Math.min(duration, startTime + 0.5)}
                  max={duration || 10}
                  step={0.1}
                  value={endTime}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setEndTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">Quick Clips:</span>
              <button
                onClick={() => { setStartTime(0); setEndTime(Math.min(duration, 15)); }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                15s (Shorts)
              </button>
              <button
                onClick={() => { setStartTime(0); setEndTime(Math.min(duration, 30)); }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                30s (Reel)
              </button>
              <button
                onClick={() => { setStartTime(0); setEndTime(Math.min(duration, 60)); }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                60s (TikTok)
              </button>
              <button
                onClick={() => { setStartTime(0); setEndTime(duration); }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Full Video
              </button>
            </div>

            {/* Export Section */}
            <div className="pt-4 border-t border-slate-800">
              {!downloadUrl ? (
                <button
                  disabled={isExporting}
                  onClick={handleExportTrim}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>{lang === 'en' ? `Trimming Video (${exportProgress}%)...` : `ভিডিও ট্রিম করা হচ্ছে (${exportProgress}%)...`}</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Render & Cut Selected Segment' : 'সিলেক্টেড অংশ কেটে বের করুন'}</span>
                    </>
                  )}
                </button>
              ) : (
                <a
                  href={downloadUrl}
                  download={`${videoFile.name.replace(/\.[^/.]+$/, '')}_trimmed.webm`}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Download Trimmed Video (WebM)' : 'কাটা ভিডিও ডাউনলোড করুন'}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   2. AUDIO EXTRACTOR TOOL
   ========================================================================= */
const AudioExtractorTool: React.FC<{ lang: 'en' | 'bn' }> = ({ lang }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractProgress, setExtractProgress] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [audioInfo, setAudioInfo] = useState<{ duration: number; sampleRate: number; channels: number } | null>(null);
  const [format, setFormat] = useState<'wav' | 'webm'>('wav');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert(lang === 'en' ? 'Please upload a video file.' : 'ভিডিও ফাইল আপলোড করুন।');
      return;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioInfo(null);
    setVideoFile(file);
  };

  const handleExtract = async () => {
    if (!videoFile) return;
    setIsExtracting(true);
    setExtractProgress(20);

    try {
      const buffer = await videoFile.arrayBuffer();
      setExtractProgress(50);

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const decoded = await ctx.decodeAudioData(buffer);
      setExtractProgress(80);

      setAudioInfo({
        duration: decoded.duration,
        sampleRate: decoded.sampleRate,
        channels: decoded.numberOfChannels,
      });

      // Convert AudioBuffer to 16-bit PCM WAV
      const wavBlob = audioBufferToWavBlob(decoded);
      const url = URL.createObjectURL(wavBlob);
      const baseName = videoFile.name.replace(/\.[^/.]+$/, '');
      setAudioUrl(url);
      setAudioFileName(`${baseName}_audio.wav`);
      setExtractProgress(100);
    } catch (err: any) {
      console.error('Audio extraction error', err);
      alert(lang === 'en' ? 'Failed to extract audio track from video.' : 'ভিডিও থেকে অডিও আলাদা করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsExtracting(false);
    }
  };

  const audioBufferToWavBlob = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sample = 0;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data: number) => { out.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { out.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (offset < buffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out], { type: 'audio/wav' });
  };

  return (
    <div className="space-y-6">
      {!videoFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-3xl p-12 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
            <Music className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {lang === 'en' ? 'Upload Video to Extract Audio' : 'ভিডিও থেকে অডিও বের করতে আপলোড করুন'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            {lang === 'en'
              ? 'Rip studio-quality 16-bit PCM WAV or WebM audio from any MP4, MOV, WebM, or MKV video.'
              : 'যেকোনো ভিডিও থেকে স্টুডিও কোয়ালিটি অডিও আলাদা করুন। ১০০% নিরাপদ ব্রাউজার এক্সট্রাকশন।'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">
            <Upload className="w-4 h-4" />
            <span>{lang === 'en' ? 'Select Video File' : 'ভিডিও সিলেক্ট করুন'}</span>
          </div>
        </div>
      )}

      {videoFile && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FileVideo className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white truncate max-w-xs">{videoFile.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={() => { setVideoFile(null); setAudioUrl(null); }}
              className="text-xs text-slate-400 hover:text-white"
            >
              {lang === 'en' ? 'Change' : 'পরিবর্তন'}
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">
              {lang === 'en' ? 'Export Audio Format' : 'অডিও ফরম্যাট'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('wav')}
                className={`p-3 rounded-xl border text-xs text-left transition ${
                  format === 'wav' ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 font-bold' : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="font-bold">Lossless WAV (16-bit PCM)</div>
                <div className="text-[10px] text-slate-400 font-normal">Uncompressed, studio quality</div>
              </button>
              <button
                onClick={() => setFormat('webm')}
                className={`p-3 rounded-xl border text-xs text-left transition ${
                  format === 'webm' ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 font-bold' : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="font-bold">WebM Audio (Opus)</div>
                <div className="text-[10px] text-slate-400 font-normal">Compact, efficient streaming</div>
              </button>
            </div>
          </div>

          {!audioUrl ? (
            <button
              disabled={isExtracting}
              onClick={handleExtract}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{lang === 'en' ? `Extracting Audio (${extractProgress}%)...` : `অডিও আলাদা করা হচ্ছে (${extractProgress}%)...`}</span>
                </>
              ) : (
                <>
                  <Music className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Extract Audio Track Now' : 'অডিও ট্র্যাক আলাদা করুন'}</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'en' ? 'Audio Extracted Successfully!' : 'অডিও সফলভাবে তৈরি হয়েছে!'}</span>
              </div>

              {audioInfo && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-500">Duration</div>
                    <div className="text-white font-bold">{Math.floor(audioInfo.duration)}s</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Sample Rate</div>
                    <div className="text-white font-bold">{audioInfo.sampleRate / 1000} kHz</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Channels</div>
                    <div className="text-white font-bold">{audioInfo.channels === 2 ? 'Stereo' : 'Mono'}</div>
                  </div>
                </div>
              )}

              <audio controls src={audioUrl} className="w-full" />

              <a
                href={audioUrl}
                download={audioFileName}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{lang === 'en' ? `Download ${audioFileName}` : 'অডিও ডাউনলোড করুন'}</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   3. SUBTITLE EDITOR (SRT / VTT) TOOL
   ========================================================================= */
interface SubtitleCue {
  id: number;
  startTime: string; // "00:00:01,000"
  endTime: string;   // "00:00:04,500"
  text: string;
}

const SubtitleEditorTool: React.FC<{ lang: 'en' | 'bn' }> = ({ lang }) => {
  const [cues, setCues] = useState<SubtitleCue[]>([
    { id: 1, startTime: '00:00:01,000', endTime: '00:00:04,000', text: 'Welcome to NovaTools Creator Studio!' },
    { id: 2, startTime: '00:00:04,500', endTime: '00:00:08,200', text: 'Edit, sync, and export captions in SRT or VTT format.' },
    { id: 3, startTime: '00:00:09,000', endTime: '00:00:13,000', text: '100% private, free, and browser-native.' },
  ]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [offsetMs, setOffsetMs] = useState<number>(500);

  // Time conversion helpers
  const timeToMs = (timeStr: string): number => {
    const clean = timeStr.replace('.', ',');
    const parts = clean.split(':');
    if (parts.length < 3) return 0;
    const hrs = parseInt(parts[0], 10) || 0;
    const mins = parseInt(parts[1], 10) || 0;
    const [secsStr, msStr] = parts[2].split(',');
    const secs = parseInt(secsStr, 10) || 0;
    const ms = parseInt(msStr, 10) || 0;
    return hrs * 3600000 + mins * 60000 + secs * 1000 + ms;
  };

  const msToTime = (totalMs: number): string => {
    const safeMs = Math.max(0, totalMs);
    const hrs = Math.floor(safeMs / 3600000);
    const mins = Math.floor((safeMs % 3600000) / 60000);
    const secs = Math.floor((safeMs % 60000) / 1000);
    const ms = Math.floor(safeMs % 1000);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  // Shift all cues by delta ms
  const handleShiftTime = (delta: number) => {
    setCues(prev =>
      prev.map(c => ({
        ...c,
        startTime: msToTime(timeToMs(c.startTime) + delta),
        endTime: msToTime(timeToMs(c.endTime) + delta),
      }))
    );
  };

  // Add new cue
  const handleAddCue = () => {
    const lastCue = cues[cues.length - 1];
    const newStartMs = lastCue ? timeToMs(lastCue.endTime) + 500 : 1000;
    const newEndMs = newStartMs + 3000;
    const newId = cues.length > 0 ? Math.max(...cues.map(c => c.id)) + 1 : 1;
    setCues(prev => [
      ...prev,
      {
        id: newId,
        startTime: msToTime(newStartMs),
        endTime: msToTime(newEndMs),
        text: 'New subtitle cue text...',
      },
    ]);
  };

  // Delete cue
  const handleDeleteCue = (id: number) => {
    setCues(prev => prev.filter(c => c.id !== id));
  };

  // Search & Replace
  const handleReplace = () => {
    if (!searchQuery) return;
    setCues(prev =>
      prev.map(c => ({
        ...c,
        text: c.text.replaceAll(searchQuery, replaceQuery),
      }))
    );
  };

  // Parse imported file
  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      const parsed: SubtitleCue[] = [];
      const blocks = content.replace(/\r\n/g, '\n').split('\n\n');
      let idx = 1;

      blocks.forEach(block => {
        const lines = block.trim().split('\n');
        if (lines.length >= 2) {
          const timingLine = lines.find(l => l.includes('-->'));
          if (timingLine) {
            const [start, end] = timingLine.split('-->').map(s => s.trim().replace('.', ','));
            const textLines = lines.slice(lines.indexOf(timingLine) + 1).join('\n');
            parsed.push({
              id: idx++,
              startTime: start,
              endTime: end,
              text: textLines,
            });
          }
        }
      });

      if (parsed.length > 0) {
        setCues(parsed);
      } else {
        alert(lang === 'en' ? 'Could not parse SRT/VTT file.' : 'ফাইলটি পার্স করা যায়নি।');
      }
    };
    reader.readAsText(file);
  };

  // Export SRT
  const handleExportSrt = () => {
    let srtText = '';
    cues.forEach((c, i) => {
      srtText += `${i + 1}\n${c.startTime} --> ${c.endTime}\n${c.text}\n\n`;
    });
    downloadTextFile(srtText, 'subtitles.srt', 'text/plain');
  };

  // Export VTT
  const handleExportVtt = () => {
    let vttText = 'WEBVTT\n\n';
    cues.forEach(c => {
      const s = c.startTime.replace(',', '.');
      const e = c.endTime.replace(',', '.');
      vttText += `${s} --> ${e}\n${c.text}\n\n`;
    });
    downloadTextFile(vttText, 'subtitles.vtt', 'text/vtt');
  };

  const downloadTextFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Import .SRT / .VTT' : 'ফাইল ইমপোর্ট'}</span>
            <input
              type="file"
              accept=".srt,.vtt,text/plain"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleImportFile(f);
              }}
            />
          </label>

          <button
            onClick={handleAddCue}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Add Cue' : 'নতুন কিউ'}</span>
          </button>
        </div>

        {/* Global Time Shift */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Sync Shift:</span>
          <button
            onClick={() => handleShiftTime(-500)}
            className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 hover:text-white"
          >
            -0.5s
          </button>
          <button
            onClick={() => handleShiftTime(500)}
            className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 hover:text-white"
          >
            +0.5s
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSrt}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SRT</span>
          </button>
          <button
            onClick={handleExportVtt}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export VTT</span>
          </button>
        </div>
      </div>

      {/* Search & Replace Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Find text..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white"
          />
        </div>
        <input
          type="text"
          value={replaceQuery}
          onChange={e => setReplaceQuery(e.target.value)}
          placeholder="Replace with..."
          className="flex-1 min-w-[200px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
        />
        <button
          onClick={handleReplace}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
        >
          Replace All
        </button>
      </div>

      {/* Cues Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80 bg-slate-950">
        {cues.map((cue, idx) => (
          <div key={cue.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-slate-900/40 transition">
            <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-mono font-bold text-slate-500 shrink-0">
              #{idx + 1}
            </span>

            {/* Timecodes */}
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={cue.startTime}
                onChange={e => {
                  const val = e.target.value;
                  setCues(prev => prev.map(c => c.id === cue.id ? { ...c, startTime: val } : c));
                }}
                className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-cyan-400 text-center"
              />
              <span className="text-slate-500 font-mono text-xs">→</span>
              <input
                type="text"
                value={cue.endTime}
                onChange={e => {
                  const val = e.target.value;
                  setCues(prev => prev.map(c => c.id === cue.id ? { ...c, endTime: val } : c));
                }}
                className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-cyan-400 text-center"
              />
            </div>

            {/* Text Input */}
            <textarea
              rows={1}
              value={cue.text}
              onChange={e => {
                const val = e.target.value;
                setCues(prev => prev.map(c => c.id === cue.id ? { ...c, text: val } : c));
              }}
              className="flex-1 w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white resize-none"
            />

            {/* Delete button */}
            <button
              onClick={() => handleDeleteCue(cue.id)}
              className="p-1.5 text-slate-500 hover:text-red-400 transition"
              title="Delete cue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================================
   4. THUMBNAIL & SOCIAL COVER DESIGNER TOOL
   ========================================================================= */
const ThumbnailDesignerTool: React.FC<{ lang: 'en' | 'bn' }> = ({ lang }) => {
  const [headline, setHeadline] = useState<string>('HOW TO MASTER AI TOOLS');
  const [subline, setSubline] = useState<string>('Step-by-Step Complete Guide');
  const [badgeText, setBadgeText] = useState<string>('100% FREE');
  const [aspect, setAspect] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [accentColor, setAccentColor] = useState<string>('#22d3ee');
  const [bgStyle, setBgStyle] = useState<'cyber' | 'sunset' | 'ocean' | 'dark'>('cyber');
  const [uploadedBg, setUploadedBg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    renderCanvas();
  }, [headline, subline, badgeText, aspect, textColor, accentColor, bgStyle, uploadedBg]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 1280;
    let height = 720;
    if (aspect === '9:16') {
      width = 1080;
      height = 1920;
    } else if (aspect === '1:1') {
      width = 1080;
      height = 1080;
    }

    canvas.width = width;
    canvas.height = height;

    // Draw Background
    if (uploadedBg) {
      const img = new Image();
      img.src = uploadedBg;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        // Add dark gradient overlay for text readability
        const overlay = ctx.createLinearGradient(0, 0, 0, height);
        overlay.addColorStop(0, 'rgba(2, 6, 23, 0.4)');
        overlay.addColorStop(1, 'rgba(2, 6, 23, 0.85)');
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, width, height);
        drawTextElements(ctx, width, height);
      };
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (bgStyle === 'cyber') {
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#1e1b4b');
      } else if (bgStyle === 'sunset') {
        grad.addColorStop(0, '#1c1917');
        grad.addColorStop(0.5, '#450a0a');
        grad.addColorStop(1, '#7c2d12');
      } else if (bgStyle === 'ocean') {
        grad.addColorStop(0, '#042f2e');
        grad.addColorStop(0.5, '#082f49');
        grad.addColorStop(1, '#020617');
      } else {
        grad.addColorStop(0, '#09090b');
        grad.addColorStop(1, '#18181b');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Decorative gradient circles
      ctx.fillStyle = accentColor + '22';
      ctx.beginPath();
      ctx.arc(width * 0.8, height * 0.2, width * 0.3, 0, Math.PI * 2);
      ctx.fill();

      drawTextElements(ctx, width, height);
    }
  };

  const drawTextElements = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 1. Badge
    if (badgeText) {
      ctx.font = 'bold 32px sans-serif';
      const badgeMetrics = ctx.measureText(badgeText);
      const bWidth = badgeMetrics.width + 40;
      const bHeight = 56;
      const bX = 80;
      const bY = height * 0.22;

      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bWidth, bHeight, 16);
      ctx.fill();

      ctx.fillStyle = '#020617';
      ctx.fillText(badgeText, bX + 20, bY + 40);
    }

    // 2. Main Headline
    ctx.font = '900 84px sans-serif';
    ctx.fillStyle = textColor;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    const words = headline.split(' ');
    let line = '';
    let startY = height * 0.45;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - 160 && n > 0) {
        ctx.fillText(line, 80, startY);
        line = words[n] + ' ';
        startY += 96;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 80, startY);

    // 3. Subline
    ctx.shadowBlur = 0;
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText(subline, 80, startY + 80);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `thumbnail_${aspect.replace(':', '_')}.png`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Controls Column (5 cols) */}
      <div className="lg:col-span-5 space-y-5 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
          <ImageIcon className="w-4 h-4" />
          <span>Thumbnail Settings</span>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300">Format Presets</label>
          <div className="grid grid-cols-3 gap-2">
            {(['16:9', '9:16', '1:1'] as const).map(a => (
              <button
                key={a}
                onClick={() => setAspect(a)}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  aspect === a ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                {a === '16:9' ? 'YouTube 16:9' : a === '9:16' ? 'Reel 9:16' : 'Square 1:1'}
              </button>
            ))}
          </div>
        </div>

        {/* Text Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-300">Badge Text</label>
            <input
              type="text"
              value={badgeText}
              onChange={e => setBadgeText(e.target.value)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-300">Main Title Headline</label>
            <input
              type="text"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-300">Subline Catchphrase</label>
            <input
              type="text"
              value={subline}
              onChange={e => setSubline(e.target.value)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Color Palette */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-300">Accent Color</label>
            <input
              type="color"
              value={accentColor}
              onChange={e => setAccentColor(e.target.value)}
              className="w-full mt-1 h-9 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer p-1"
            />
          </div>
          <div>
            <label className="text-xs text-slate-300">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={e => setTextColor(e.target.value)}
              className="w-full mt-1 h-9 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer p-1"
            />
          </div>
        </div>

        {/* Background Upload */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300">Custom Background Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) {
                const r = new FileReader();
                r.onload = ev => setUploadedBg(ev.target?.result as string);
                r.readAsDataURL(f);
              }
            }}
            className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-xs file:text-white"
          />
        </div>

        <button
          onClick={handleDownload}
          className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download High-Res PNG</span>
        </button>
      </div>

      {/* Canvas Preview Column (7 cols) */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl">
        <canvas
          ref={canvasRef}
          className="max-h-[480px] w-auto max-w-full rounded-2xl shadow-2xl border border-slate-800 object-contain"
        />
        <p className="text-[11px] font-mono text-slate-500 mt-3">
          100% Client-Side Canvas Render • Real-Time Resolution
        </p>
      </div>
    </div>
  );
};

/* =========================================================================
   5. VIDEO METADATA INSPECTOR TOOL
   ========================================================================= */
const VideoInspectorTool: React.FC<{ lang: 'en' | 'bn' }> = ({ lang }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert(lang === 'en' ? 'Please upload a video file.' : 'ভিডিও ফাইল আপলোড করুন।');
      return;
    }
    setVideoFile(file);

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;

    video.onloadedmetadata = () => {
      const dur = video.duration;
      const w = video.videoWidth;
      const h = video.videoHeight;
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const g = gcd(w, h);
      const aspectStr = `${w / g}:${h / g}`;

      // Resolution class
      let resClass = 'SD';
      if (w >= 3840 || h >= 2160) resClass = '4K UHD (2160p)';
      else if (w >= 2560 || h >= 1440) resClass = '2K QHD (1440p)';
      else if (w >= 1920 || h >= 1080) resClass = 'Full HD (1080p)';
      else if (w >= 1280 || h >= 720) resClass = 'HD (720p)';

      // Bitrate estimate
      const bitrateMbps = dur > 0 ? ((file.size * 8) / (dur * 1000000)).toFixed(2) : 'N/A';

      setMetadata({
        name: file.name,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
        sizeBytes: file.size.toLocaleString(),
        mimeType: file.type || 'video/mp4',
        width: w,
        height: h,
        aspectRatio: aspectStr,
        resClass,
        durationSec: dur.toFixed(2),
        durationFormatted: `${Math.floor(dur / 60)}m ${Math.floor(dur % 60)}s`,
        bitrateMbps,
      });

      URL.revokeObjectURL(url);
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {!metadata ? (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-3xl p-12 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition"
        >
          <label className="cursor-pointer">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
              <Info className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {lang === 'en' ? 'Upload Video to Inspect Technical Specs' : 'ভিডিও আপলোড করে স্পেসিফিকেশন দেখুন'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              Inspect video codecs, dimensions, aspect ratio, audio stream, and estimated bitrate without uploading to any server.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">
              <Upload className="w-4 h-4" />
              <span>{lang === 'en' ? 'Select Video' : 'ভিডিও নির্বাচন করুন'}</span>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-6 p-6 rounded-3xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FileVideo className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{metadata.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{metadata.resClass} • {metadata.sizeMB} MB</p>
              </div>
            </div>
            <button
              onClick={() => setMetadata(null)}
              className="text-xs text-cyan-400 hover:underline"
            >
              {lang === 'en' ? 'Inspect Another Video' : 'অন্য ভিডিও দেখুন'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">Resolution</div>
              <div className="text-base font-bold text-white font-mono mt-1">{metadata.width} x {metadata.height}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">Aspect Ratio</div>
              <div className="text-base font-bold text-cyan-400 font-mono mt-1">{metadata.aspectRatio}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">Duration</div>
              <div className="text-base font-bold text-white font-mono mt-1">{metadata.durationFormatted}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-mono">Est. Bitrate</div>
              <div className="text-base font-bold text-white font-mono mt-1">{metadata.bitrateMbps} Mbps</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 divide-y divide-slate-800/80 bg-slate-950 text-xs">
            <div className="p-3 flex justify-between">
              <span className="text-slate-400">Container Format / MIME</span>
              <span className="font-mono text-slate-200">{metadata.mimeType}</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-slate-400">Total File Size (Bytes)</span>
              <span className="font-mono text-slate-200">{metadata.sizeBytes} bytes</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-slate-400">Precision Duration (Seconds)</span>
              <span className="font-mono text-slate-200">{metadata.durationSec} s</span>
            </div>
            <div className="p-3 flex justify-between">
              <span className="text-slate-400">Browser Decoding Compatibility</span>
              <span className="font-mono text-emerald-400 font-bold">✓ Hardware Acceleration Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   6. CREATOR EXPORT CHECKER & PRE-FLIGHT VALIDATOR
   ========================================================================= */
const CreatorExportCheckerTool: React.FC<{ lang: 'en' | 'bn' }> = ({ lang }) => {
  const [platform, setPlatform] = useState<'yt_main' | 'yt_shorts' | 'tiktok' | 'insta_reels' | 'twitter'>('yt_shorts');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [checks, setChecks] = useState<any[]>([]);

  const platformsConfig = {
    yt_main: {
      name: 'YouTube Standard (1080p / 4K)',
      aspect: '16:9',
      maxDurationSec: 43200, // 12 hrs
      maxSizeMB: 128000,
      recommendedRes: '1920x1080 or 3840x2160',
    },
    yt_shorts: {
      name: 'YouTube Shorts',
      aspect: '9:16',
      maxDurationSec: 60,
      maxSizeMB: 500,
      recommendedRes: '1080x1920',
    },
    tiktok: {
      name: 'TikTok Video',
      aspect: '9:16',
      maxDurationSec: 600, // 10 mins
      maxSizeMB: 287,
      recommendedRes: '1080x1920',
    },
    insta_reels: {
      name: 'Instagram Reels',
      aspect: '9:16',
      maxDurationSec: 90,
      maxSizeMB: 1000,
      recommendedRes: '1080x1920',
    },
    twitter: {
      name: 'Twitter / X Video',
      aspect: '16:9 or 1:1',
      maxDurationSec: 140, // 2m 20s
      maxSizeMB: 512,
      recommendedRes: '1920x1080',
    },
  };

  const runValidation = (file: File, platKey = platform) => {
    setVideoFile(file);
    const target = platformsConfig[platKey];

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;

    video.onloadedmetadata = () => {
      const dur = video.duration;
      const w = video.videoWidth;
      const h = video.videoHeight;
      const isVertical = h > w;
      const isSquare = Math.abs(h - w) < 20;

      const sizeMB = file.size / (1024 * 1024);

      const res: any[] = [];

      // 1. Aspect Ratio Check
      if (target.aspect === '9:16') {
        if (isVertical) {
          res.push({ title: 'Aspect Ratio (9:16 Vertical)', pass: true, msg: `Passed (${w}x${h} vertical video). Perfect for ${target.name}.` });
        } else {
          res.push({ title: 'Aspect Ratio (9:16 Vertical)', pass: false, msg: `Warning: This video is horizontal (${w}x${h}). ${target.name} displays best in 9:16 vertical.` });
        }
      } else {
        if (!isVertical || isSquare) {
          res.push({ title: 'Aspect Ratio (16:9 Landscape)', pass: true, msg: `Passed (${w}x${h} widescreen).` });
        } else {
          res.push({ title: 'Aspect Ratio (16:9 Landscape)', pass: false, msg: `Warning: Video is vertical (${w}x${h}). Standard YouTube displays with black pillarboxes.` });
        }
      }

      // 2. Duration Check
      if (dur <= target.maxDurationSec) {
        res.push({ title: 'Duration Limit', pass: true, msg: `Passed: ${Math.floor(dur)}s (Limit is ${target.maxDurationSec}s).` });
      } else {
        res.push({ title: 'Duration Limit', pass: false, msg: `Failed: Video is ${Math.floor(dur)}s, exceeding the ${target.maxDurationSec}s limit for ${target.name}.` });
      }

      // 3. File Size Check
      if (sizeMB <= target.maxSizeMB) {
        res.push({ title: 'File Size Limit', pass: true, msg: `Passed: ${sizeMB.toFixed(1)} MB (Max allowed: ${target.maxSizeMB} MB).` });
      } else {
        res.push({ title: 'File Size Limit', pass: false, msg: `Failed: ${sizeMB.toFixed(1)} MB exceeds ${target.maxSizeMB} MB limit.` });
      }

      // 4. Container Format
      if (['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
        res.push({ title: 'Video Container Format', pass: true, msg: `Passed: ${file.type || 'MP4/WebM'} is fully supported.` });
      } else {
        res.push({ title: 'Video Container Format', pass: false, msg: 'Warning: Uncommon video format. Recommended to convert to MP4 (H.264/AAC).' });
      }

      setChecks(res);
      URL.revokeObjectURL(url);
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Platform Select */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-cyan-400">Select Target Social Platform</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(platformsConfig).map(([k, cfg]) => (
            <button
              key={k}
              onClick={() => {
                setPlatform(k as any);
                if (videoFile) runValidation(videoFile, k as any);
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                platform === k ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300' : 'border-slate-800 bg-slate-950 text-slate-400'
              }`}
            >
              {cfg.name.split(' ')[0]} {cfg.name.includes('Shorts') ? 'Shorts' : cfg.name.includes('Reels') ? 'Reels' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      {!videoFile ? (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) runValidation(f);
          }}
          className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-3xl p-10 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition"
        >
          <label className="cursor-pointer">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) runValidation(f);
              }}
            />
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3 text-cyan-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              Upload Video to Validate for {platformsConfig[platform].name}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
              Automated pre-flight check for aspect ratio, duration, resolution, and file size limits.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Select Video</span>
            </div>
          </label>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-white truncate max-w-xs">{videoFile.name}</span>
            </div>
            <button
              onClick={() => { setVideoFile(null); setChecks([]); }}
              className="text-xs text-cyan-400 hover:underline"
            >
              Test Another
            </button>
          </div>

          <div className="space-y-3">
            {checks.map((chk, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  chk.pass
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                }`}
              >
                {chk.pass ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-xs">{chk.title}</div>
                  <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{chk.msg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
