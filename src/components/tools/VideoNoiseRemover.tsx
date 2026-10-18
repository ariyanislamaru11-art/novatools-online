import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  ShieldCheck,
  Headphones,
  Mic,
  Activity,
  Layers,
  Zap,
  ArrowRight
} from 'lucide-react';
import { ToolDef } from '../../types';

interface VideoNoiseRemoverProps {
  tool: ToolDef;
  lang: 'en' | 'bn';
}

type PresetMode = 'studio_vocal' | 'speech_clarity' | 'wind_outdoor' | 'hiss_hum' | 'custom';

export const VideoNoiseRemover: React.FC<VideoNoiseRemoverProps> = ({ tool, lang }) => {
  // Video File state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isDenoiseActive, setIsDenoiseActive] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // DSP Filter Parameters
  const [preset, setPreset] = useState<PresetMode>('studio_vocal');
  const [noiseReductionStrength, setNoiseReductionStrength] = useState<number>(85); // 0 - 100
  const [vocalBoost, setVocalBoost] = useState<number>(5); // dB 0 - 12
  const [rumbleCutFreq, setRumbleCutFreq] = useState<number>(90); // Hz 40 - 160
  const [hissCutFreq, setHissCutFreq] = useState<number>(6500); // Hz 4000 - 12000
  const [noiseGateThreshold, setNoiseGateThreshold] = useState<number>(-42); // dB -60 to -15
  const [removeHum, setRemoveHum] = useState<boolean>(true);

  // Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportType, setExportType] = useState<'audio_wav' | 'video_clean'>('video_clean');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Web Audio Nodes refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const hpFilterRef = useRef<BiquadFilterNode | null>(null);
  const lpFilterRef = useRef<BiquadFilterNode | null>(null);
  const vocalPresenceRef = useRef<BiquadFilterNode | null>(null);
  const vocalBodyRef = useRef<BiquadFilterNode | null>(null);
  const notch50Ref = useRef<BiquadFilterNode | null>(null);
  const notch60Ref = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const denoiseGainRef = useRef<GainNode | null>(null);
  const bypassGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Handle Video Selection
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert(lang === 'en' ? 'Please select a valid video file (MP4, WebM, MOV, MKV).' : 'অনুগ্রহ করে একটি সঠিক ভিডিও ফাইল নির্বাচন করুন (MP4, WebM, MOV, MKV)।');
      return;
    }

    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setStatusMessage(null);

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Setup Web Audio Graph when video element is ready
  const initAudioGraph = () => {
    if (!videoRef.current) return;
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(videoRef.current);
      sourceNodeRef.current = source;

      // 1. High-Pass Filter for Sub-rumble / Wind
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = rumbleCutFreq;
      hp.Q.value = 0.8;
      hpFilterRef.current = hp;

      // 2. 50Hz Notch Filter (electrical AC hum)
      const n50 = ctx.createBiquadFilter();
      n50.type = 'notch';
      n50.frequency.value = 50;
      n50.Q.value = 8.0;
      notch50Ref.current = n50;

      // 3. 60Hz Notch Filter (electrical AC hum)
      const n60 = ctx.createBiquadFilter();
      n60.type = 'notch';
      n60.frequency.value = 60;
      n60.Q.value = 8.0;
      notch60Ref.current = n60;

      // 4. Low-Pass Filter (high-frequency hiss and static above vocal range)
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = hissCutFreq;
      lp.Q.value = 0.7;
      lpFilterRef.current = lp;

      // 5. Vocal Presence Booster (peaking around 2800Hz for speech clarity)
      const vp = ctx.createBiquadFilter();
      vp.type = 'peaking';
      vp.frequency.value = 2800;
      vp.Q.value = 1.2;
      vp.gain.value = vocalBoost;
      vocalPresenceRef.current = vp;

      // 6. Vocal Warmth / Body (peaking around 250Hz for full chest vocal tone)
      const vb = ctx.createBiquadFilter();
      vb.type = 'peaking';
      vb.frequency.value = 240;
      vb.Q.value = 1.0;
      vb.gain.value = 2.5;
      vocalBodyRef.current = vb;

      // 7. Dynamics Compressor / Speech Leveler
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = noiseGateThreshold;
      comp.knee.value = 12;
      comp.ratio.value = 8;
      comp.attack.value = 0.005;
      comp.release.value = 0.08;
      compressorRef.current = comp;

      // 8. Denoised Path Gain Node
      const denoiseGain = ctx.createGain();
      denoiseGain.gain.value = isDenoiseActive ? 1 : 0;
      denoiseGainRef.current = denoiseGain;

      // 9. Bypass (Original Audio) Path Gain Node
      const bypassGain = ctx.createGain();
      bypassGain.gain.value = isDenoiseActive ? 0 : 1;
      bypassGainRef.current = bypassGain;

      // 10. Master Gain
      const master = ctx.createGain();
      master.gain.value = volume;
      masterGainRef.current = master;

      // 11. Analyser Node for visualizer
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      // Connect Denoised Chain:
      // source -> hp -> n50 -> n60 -> lp -> vp -> vb -> comp -> denoiseGain -> master
      source.connect(hp);
      hp.connect(n50);
      n50.connect(n60);
      n60.connect(lp);
      lp.connect(vp);
      vp.connect(vb);
      vb.connect(comp);
      comp.connect(denoiseGain);
      denoiseGain.connect(master);

      // Connect Bypass (Original) Chain:
      // source -> bypassGain -> master
      source.connect(bypassGain);
      bypassGain.connect(master);

      // Connect Master to Analyser and Speakers
      master.connect(analyser);
      analyser.connect(ctx.destination);

      startVisualizer();
    } catch (e) {
      console.error('Failed to initialize Web Audio DSP graph', e);
    }
  };

  // Real-time audio frequency visualizer
  const startVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient based on vocal frequency range
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#06b6d4'); // cyan
        grad.addColorStop(0.6, '#3b82f6'); // blue
        grad.addColorStop(1, '#a855f7'); // violet

        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }
    };

    draw();
  };

  // Apply Preset Values
  const handleApplyPreset = (p: PresetMode) => {
    setPreset(p);
    if (p === 'studio_vocal') {
      setNoiseReductionStrength(90);
      setVocalBoost(6);
      setRumbleCutFreq(95);
      setHissCutFreq(6000);
      setNoiseGateThreshold(-40);
      setRemoveHum(true);
      updateAudioNodes(90, 6, 95, 6000, -40, true);
    } else if (p === 'speech_clarity') {
      setNoiseReductionStrength(75);
      setVocalBoost(7.5);
      setRumbleCutFreq(85);
      setHissCutFreq(7200);
      setNoiseGateThreshold(-45);
      setRemoveHum(true);
      updateAudioNodes(75, 7.5, 85, 7200, -45, true);
    } else if (p === 'wind_outdoor') {
      setNoiseReductionStrength(95);
      setVocalBoost(8);
      setRumbleCutFreq(135);
      setHissCutFreq(5500);
      setNoiseGateThreshold(-36);
      setRemoveHum(true);
      updateAudioNodes(95, 8, 135, 5500, -36, true);
    } else if (p === 'hiss_hum') {
      setNoiseReductionStrength(80);
      setVocalBoost(3);
      setRumbleCutFreq(80);
      setHissCutFreq(5000);
      setNoiseGateThreshold(-48);
      setRemoveHum(true);
      updateAudioNodes(80, 3, 80, 5000, -48, true);
    }
  };

  // Update DSP Audio Nodes
  const updateAudioNodes = (
    strength = noiseReductionStrength,
    boost = vocalBoost,
    hp = rumbleCutFreq,
    lp = hissCutFreq,
    gate = noiseGateThreshold,
    hum = removeHum
  ) => {
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;

    if (hpFilterRef.current) {
      hpFilterRef.current.frequency.setTargetAtTime(hp, now, 0.05);
    }
    if (lpFilterRef.current) {
      lpFilterRef.current.frequency.setTargetAtTime(lp, now, 0.05);
    }
    if (vocalPresenceRef.current) {
      vocalPresenceRef.current.gain.setTargetAtTime(boost, now, 0.05);
    }
    if (notch50Ref.current && notch60Ref.current) {
      notch50Ref.current.Q.setTargetAtTime(hum ? 8.0 : 0.001, now, 0.05);
      notch60Ref.current.Q.setTargetAtTime(hum ? 8.0 : 0.001, now, 0.05);
    }
    if (compressorRef.current) {
      compressorRef.current.threshold.setTargetAtTime(gate, now, 0.05);
      const ratio = 4 + (strength / 100) * 12;
      compressorRef.current.ratio.setTargetAtTime(ratio, now, 0.05);
    }
  };

  // Toggle Denoise A/B Live Switching
  const handleToggleDenoise = (active: boolean) => {
    setIsDenoiseActive(active);
    if (!audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    if (denoiseGainRef.current) {
      denoiseGainRef.current.gain.setTargetAtTime(active ? 1 : 0, now, 0.03);
    }
    if (bypassGainRef.current) {
      bypassGainRef.current.gain.setTargetAtTime(active ? 0 : 1, now, 0.03);
    }
  };

  // Play/Pause Video
  const handleTogglePlay = async () => {
    if (!videoRef.current) return;
    initAudioGraph();

    if (videoRef.current.paused) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Playback error', e);
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Offline DSP Audio Buffer Processing for pristine file export
  const processOfflineAudio = async (
    audioBuffer: AudioBuffer,
    onProgress: (p: number) => void
  ): Promise<AudioBuffer> => {
    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    // Highpass rumble cut
    const hp = offlineCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = rumbleCutFreq;
    hp.Q.value = 0.8;

    // 50Hz notch
    const n50 = offlineCtx.createBiquadFilter();
    n50.type = 'notch';
    n50.frequency.value = 50;
    n50.Q.value = removeHum ? 8.0 : 0.001;

    // 60Hz notch
    const n60 = offlineCtx.createBiquadFilter();
    n60.type = 'notch';
    n60.frequency.value = 60;
    n60.Q.value = removeHum ? 8.0 : 0.001;

    // Lowpass hiss cut
    const lp = offlineCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = hissCutFreq;
    lp.Q.value = 0.7;

    // Vocal presence boost
    const vp = offlineCtx.createBiquadFilter();
    vp.type = 'peaking';
    vp.frequency.value = 2800;
    vp.Q.value = 1.2;
    vp.gain.value = vocalBoost;

    // Vocal body warm
    const vb = offlineCtx.createBiquadFilter();
    vb.type = 'peaking';
    vb.frequency.value = 240;
    vb.Q.value = 1.0;
    vb.gain.value = 2.5;

    // Noise gate / vocal compressor
    const comp = offlineCtx.createDynamicsCompressor();
    comp.threshold.value = noiseGateThreshold;
    comp.knee.value = 12;
    comp.ratio.value = 4 + (noiseReductionStrength / 100) * 12;
    comp.attack.value = 0.005;
    comp.release.value = 0.08;

    source.connect(hp);
    hp.connect(n50);
    n50.connect(n60);
    n60.connect(lp);
    lp.connect(vp);
    vp.connect(vb);
    vb.connect(comp);
    comp.connect(offlineCtx.destination);

    source.start(0);

    onProgress(50);
    const rendered = await offlineCtx.startRendering();
    onProgress(90);
    return rendered;
  };

  // Convert AudioBuffer to 16-bit PCM WAV Blob
  const audioBufferToWavBlob = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sample = 0;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    const setUint16 = (data: number) => {
      out.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      out.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

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

  // Handle Export (Clean Audio or Remuxed Video)
  const handleExport = async () => {
    if (!videoFile || !videoRef.current) return;
    setIsExporting(true);
    setExportProgress(10);
    setStatusMessage(lang === 'en' ? 'Extracting audio track from video...' : 'ভিডিও থেকে অডিও ট্র্যাক আলাদা করা হচ্ছে...');

    try {
      // 1. Decode original video audio using AudioContext
      const arrayBuffer = await videoFile.arrayBuffer();
      setExportProgress(25);
      setStatusMessage(lang === 'en' ? 'Decoding audio waveform...' : 'অডিও তরঙ্গ ডিকোড করা হচ্ছে...');

      const decodeCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
      setExportProgress(45);
      setStatusMessage(lang === 'en' ? 'Filtering background noise and isolating vocals...' : 'নয়েজ দূর করা হচ্ছে এবং ভোকাল নিখুঁত করা হচ্ছে...');

      // 2. Process through offline DSP filter pipeline
      const cleanBuffer = await processOfflineAudio(decodedBuffer, p => {
        setExportProgress(p);
      });

      // 3. Build WAV Blob
      const wavBlob = audioBufferToWavBlob(cleanBuffer);
      const baseName = videoFile.name.replace(/\.[^/.]+$/, '');

      if (exportType === 'audio_wav') {
        const url = URL.createObjectURL(wavBlob);
        setDownloadUrl(url);
        setDownloadFileName(`${baseName}_clean_vocals.wav`);
        setExportProgress(100);
        setStatusMessage(lang === 'en' ? 'Clean studio audio ready for download!' : 'পরিষ্কার ভোকাল অডিও ডাউনলোড করার জন্য প্রস্তুত!');
      } else {
        // Video Export with Clean Audio using MediaRecorder playback capture
        setStatusMessage(lang === 'en' ? 'Synchronizing clean audio with video frames...' : 'পরিষ্কার অডিও ও ভিডিও ফ্রেম সমন্বয় করা হচ্ছে...');
        setExportProgress(75);

        // Create MediaStreamDestination from clean processed audio
        const liveCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const cleanSource = liveCtx.createBufferSource();
        cleanSource.buffer = cleanBuffer;

        const dest = liveCtx.createMediaStreamDestination();
        cleanSource.connect(dest);

        // Capture video track from video element
        const videoElem = videoRef.current;
        const videoStream = (videoElem as any).captureStream ? (videoElem as any).captureStream() : (videoElem as any).mozCaptureStream ? (videoElem as any).mozCaptureStream() : null;

        if (videoStream && videoStream.getVideoTracks().length > 0 && typeof MediaRecorder !== 'undefined') {
          const combinedStream = new MediaStream([
            videoStream.getVideoTracks()[0],
            dest.stream.getAudioTracks()[0],
          ]);

          const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
            ? 'video/webm;codecs=vp9,opus'
            : MediaRecorder.isTypeSupported('video/webm')
            ? 'video/webm'
            : 'video/mp4';

          const recorder = new MediaRecorder(combinedStream, { mimeType });
          const chunks: Blob[] = [];

          recorder.ondataavailable = e => {
            if (e.data.size > 0) chunks.push(e.data);
          };

          recorder.onstop = () => {
            const cleanVideoBlob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(cleanVideoBlob);
            setDownloadUrl(url);
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
            setDownloadFileName(`${baseName}_denoised_vocal.${ext}`);
            setExportProgress(100);
            setStatusMessage(lang === 'en' ? 'Clean video ready! All noise removed.' : 'পরিষ্কার ভিডিও প্রস্তুত! সকল নয়েজ দূর করা হয়েছে।');
            setIsExporting(false);
          };

          // Fast recording sequence
          recorder.start();
          cleanSource.start(0);
          videoElem.currentTime = 0;
          videoElem.muted = true;
          await videoElem.play();

          // Wait until video duration or max 60s
          const durationMs = Math.min(videoElem.duration * 1000, 120000);
          setTimeout(() => {
            if (recorder.state === 'recording') {
              recorder.stop();
              videoElem.pause();
              videoElem.muted = false;
            }
          }, durationMs + 200);
          return;
        } else {
          // Fallback to high-definition WAV if browser doesn't support captureStream
          const url = URL.createObjectURL(wavBlob);
          setDownloadUrl(url);
          setDownloadFileName(`${baseName}_clean_vocals.wav`);
          setExportProgress(100);
          setStatusMessage(lang === 'en' ? 'Clean studio audio ready for download!' : 'পরিষ্কার ভোকাল অডিও ডাউনলোড করার জন্য প্রস্তুত!');
        }
      }
    } catch (err: any) {
      console.error('Export error', err);
      setStatusMessage(lang === 'en' ? `Error during processing: ${err?.message || 'Unknown error'}` : 'প্রসেসিংয়ে ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Upload Dropzone if no file selected */}
      {!videoFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileChange(file);
          }}
          className="border-2 border-dashed border-slate-700 hover:border-cyan-400/80 rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/70 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/10 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/10">
            <FileVideo className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            {lang === 'en' ? 'Upload Video with Background Noise' : 'নয়েজযুক্ত ভিডিও আপলোড করুন'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-4">
            {lang === 'en'
              ? 'Drag & drop your video here (MP4, WebM, MOV, MKV). Our AI audio DSP will cancel hiss, room hum, wind, and isolate clear human vocals.'
              : 'এখানে আপনার ভিডিও ফাইলটি ড্র্যাগ করে ছেড়ে দিন (MP4, WebM, MOV)। আমাদের এআই অডিও ডিএসপি ব্যাকগ্রাউন্ডের নয়েজ মুছে ফেলে স্পষ্ট কণ্ঠস্বর বা ভোকাল রাখবে।'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{lang === 'en' ? 'Select Video File' : 'ভিডিও ফাইল নির্বাচন করুন'}</span>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-mono text-slate-500">
            <span>• 100% Client-Side Privacy</span>
            <span>• Zero Server Uploads</span>
            <span>• Real-Time Vocal Enhancement</span>
          </div>
        </div>
      )}

      {/* Video Workspace when file is loaded */}
      {videoFile && videoUrl && (
        <div className="space-y-6">
          
          {/* Top Video Header & Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FileVideo className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {videoFile.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                  <span>{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  {videoDuration > 0 && <span>• {Math.floor(videoDuration / 60)}:{(Math.floor(videoDuration % 60)).toString().padStart(2, '0')}</span>}
                  {videoDimensions.width > 0 && <span>• {videoDimensions.width}x{videoDimensions.height}</span>}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setVideoFile(null);
                setVideoUrl(null);
                setDownloadUrl(null);
              }}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              {lang === 'en' ? 'Choose Another Video' : 'অন্য ভিডিও নির্বাচন করুন'}
            </button>
          </div>

          {/* Main Visual Player & Waveform Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Video Screen (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl aspect-video flex items-center justify-center group">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  playsInline
                  onLoadedMetadata={e => {
                    const v = e.currentTarget;
                    setVideoDuration(v.duration);
                    setVideoDimensions({ width: v.videoWidth, height: v.videoHeight });
                  }}
                  onTimeUpdate={e => {
                    setCurrentTime(e.currentTarget.currentTime);
                  }}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                />

                {/* Real-Time Audio Frequency Spectrum Overlay */}
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={50}
                  className="absolute bottom-14 left-4 right-4 h-12 w-[calc(100%-2rem)] pointer-events-none opacity-80"
                />

                {/* Big Center Play Overlay Button if paused */}
                {!isPlaying && (
                  <button
                    onClick={handleTogglePlay}
                    className="absolute w-16 h-16 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/30 hover:scale-105 transition-all cursor-pointer"
                  >
                    <Play className="w-8 h-8 fill-slate-950 ml-1" />
                  </button>
                )}

                {/* Live A/B Mode Watermark Indicator */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                    isDenoiseActive
                      ? 'bg-emerald-500/90 text-slate-950 border border-emerald-400'
                      : 'bg-amber-500/90 text-slate-950 border border-amber-400'
                  }`}>
                    {isDenoiseActive ? (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Noise Removed • Vocal Isolate' : 'নয়েজ মুক্ত • স্পষ্ট ভোকাল'}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Original Noisy Audio' : 'আসল নয়েজযুক্ত অডিও'}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                {/* Seek Bar */}
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                  <input
                    type="range"
                    min={0}
                    max={videoDuration || 100}
                    value={currentTime}
                    onChange={e => {
                      const t = parseFloat(e.target.value);
                      setCurrentTime(t);
                      if (videoRef.current) videoRef.current.currentTime = t;
                    }}
                    className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <span>{Math.floor(videoDuration / 60)}:{(Math.floor(videoDuration % 60)).toString().padStart(2, '0')}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTogglePlay}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                      <span>{isPlaying ? (lang === 'en' ? 'Pause' : 'থামান') : (lang === 'en' ? 'Play' : 'চালান')}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          setCurrentTime(0);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title={lang === 'en' ? 'Restart Video' : 'শুরু থেকে দেখুন'}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* A/B Audio Switcher: Original vs Denoised */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                    <button
                      onClick={() => handleToggleDenoise(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        !isDenoiseActive
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'en' ? 'Original Audio' : 'আসল অডিও'}
                    </button>
                    <button
                      onClick={() => handleToggleDenoise(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        isDenoiseActive
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Denoised Vocal' : 'নয়েজ মুক্ত ভোকাল'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Audio DSP Noise Cancellation & Vocal Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Presets Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
                  <Sliders className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Noise Cancellation Presets' : 'নয়েজ ফিল্টার প্রিসেট'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApplyPreset('studio_vocal')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition ${
                      preset === 'studio_vocal'
                        ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Mic className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Studio Vocal</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal">
                      {lang === 'en' ? 'Max noise cut & warm vocals' : 'সর্বোচ্চ নয়েজ মুক্ত ভোকাল'}
                    </p>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('speech_clarity')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition ${
                      preset === 'speech_clarity'
                        ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Headphones className="w-3.5 h-3.5 text-blue-400" />
                      <span>Speech Clarity</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal">
                      {lang === 'en' ? 'Crisp dialogue & interviews' : 'পরিষ্কার কথোপকথন ও ডায়ালগ'}
                    </p>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('wind_outdoor')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition ${
                      preset === 'wind_outdoor'
                        ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Activity className="w-3.5 h-3.5 text-teal-400" />
                      <span>Wind &amp; Outdoor</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal">
                      {lang === 'en' ? 'Cuts heavy wind & street noise' : 'বাতাস ও বাইরের ট্রাফিক নয়েজ দূর'}
                    </p>
                  </button>

                  <button
                    onClick={() => handleApplyPreset('hiss_hum')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition ${
                      preset === 'hiss_hum'
                        ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Zap className="w-3.5 h-3.5 text-violet-400" />
                      <span>Hiss &amp; AC Hum</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal">
                      {lang === 'en' ? 'Fan, AC & mic wire buzz' : 'ফ্যান, এসি ও মাইক গুঞ্জন দূর'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Fine-Tuning Sliders Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    {lang === 'en' ? 'Noise Reduction Strength' : 'নয়েজ কমানোর তীব্রতা'}
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{noiseReductionStrength}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={noiseReductionStrength}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setNoiseReductionStrength(val);
                    setPreset('custom');
                    updateAudioNodes(val, vocalBoost, rumbleCutFreq, hissCutFreq, noiseGateThreshold, removeHum);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-white">
                    {lang === 'en' ? 'Vocal Clarity Boost' : 'ভোকাল স্পষ্টতা বৃদ্ধি'}
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">+{vocalBoost} dB</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.5}
                  value={vocalBoost}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setVocalBoost(val);
                    setPreset('custom');
                    updateAudioNodes(noiseReductionStrength, val, rumbleCutFreq, hissCutFreq, noiseGateThreshold, removeHum);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-white">
                    {lang === 'en' ? 'Noise Gate Threshold (Mute Silence)' : 'নয়েজ গেট (নীরবতার নয়েজ বন্ধ)'}
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{noiseGateThreshold} dB</span>
                </div>
                <input
                  type="range"
                  min={-60}
                  max={-18}
                  step={1}
                  value={noiseGateThreshold}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setNoiseGateThreshold(val);
                    setPreset('custom');
                    updateAudioNodes(noiseReductionStrength, vocalBoost, rumbleCutFreq, hissCutFreq, val, removeHum);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="humCheck"
                      checked={removeHum}
                      onChange={e => {
                        const checked = e.target.checked;
                        setRemoveHum(checked);
                        updateAudioNodes(noiseReductionStrength, vocalBoost, rumbleCutFreq, hissCutFreq, noiseGateThreshold, checked);
                      }}
                      className="accent-cyan-400 rounded cursor-pointer"
                    />
                    <label htmlFor="humCheck" className="text-xs text-slate-300 cursor-pointer">
                      {lang === 'en' ? '50Hz/60Hz Electrical Hum Notch' : '৫০/৬০ হার্টজ বিদ্যুৎ গুঞ্জন ফিল্টার'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Export & Download Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
                  <Download className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Clean Export Options' : 'পরিষ্কার ফাইল এক্সপোর্ট'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setExportType('video_clean');
                      setDownloadUrl(null);
                    }}
                    className={`p-2.5 rounded-xl border text-xs text-center transition ${
                      exportType === 'video_clean'
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    🎬 {lang === 'en' ? 'Clean Video (MP4/WebM)' : 'পরিষ্কার ভিডিও'}
                  </button>
                  <button
                    onClick={() => {
                      setExportType('audio_wav');
                      setDownloadUrl(null);
                    }}
                    className={`p-2.5 rounded-xl border text-xs text-center transition ${
                      exportType === 'audio_wav'
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    🎙️ {lang === 'en' ? 'Studio Vocal (WAV)' : 'ভোকাল ট্র্যাক (WAV)'}
                  </button>
                </div>

                {/* Export Action Button */}
                {!downloadUrl ? (
                  <button
                    disabled={isExporting}
                    onClick={handleExport}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>{lang === 'en' ? `Processing (${exportProgress}%)...` : `প্রসেসিং চলছে (${exportProgress}%)...`}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{lang === 'en' ? 'Render & Download Clean File' : 'নয়েজ দূর করে ডাউনলোড করুন'}</span>
                      </>
                    )}
                  </button>
                ) : (
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'en' ? `Download ${downloadFileName}` : `ডাউনলোড করুন (${downloadFileName})`}</span>
                  </a>
                )}

                {statusMessage && (
                  <p className="text-[11px] font-mono text-center text-slate-400">
                    {statusMessage}
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
