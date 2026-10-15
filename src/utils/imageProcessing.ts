/**
 * Real Image Processing Pipeline for NovaTools
 * Uses HTML5 Canvas, Blob, and FileReader APIs for zero-server client-side privacy.
 */

export interface ProcessedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  newSize: number;
  reductionPercent: number;
  format: string;
}

export function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image file. Ensure it is a valid PNG, JPG, or WebP image.'));
    };
    img.src = url;
  });
}

export async function convertImageFormat(
  file: File,
  targetMime: 'image/jpeg' | 'image/png' | 'image/webp',
  quality: number = 0.92,
  backgroundColor: string = '#ffffff'
): Promise<ProcessedImageResult> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas context.');

  // For JPEG or formats without alpha, fill background color
  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Canvas image conversion failed.'));
          return;
        }
        const dataUrl = canvas.toDataURL(targetMime, quality);
        const originalSize = file.size;
        const newSize = blob.size;
        const reductionPercent = Math.round(((originalSize - newSize) / originalSize) * 100);

        resolve({
          blob,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
          originalSize,
          newSize,
          reductionPercent,
          format: targetMime,
        });
      },
      targetMime,
      quality
    );
  });
}

export async function resizeImage(
  file: File,
  newWidth: number,
  newHeight: number,
  targetMime: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality: number = 0.92
): Promise<ProcessedImageResult> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(newWidth));
  canvas.height = Math.max(1, Math.round(newHeight));

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas context.');

  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Smooth resampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error('Failed to generate resized image blob'));
        const dataUrl = canvas.toDataURL(targetMime, quality);
        resolve({
          blob,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
          originalSize: file.size,
          newSize: blob.size,
          reductionPercent: Math.round(((file.size - blob.size) / file.size) * 100),
          format: targetMime,
        });
      },
      targetMime,
      quality
    );
  });
}

export async function cropImage(
  file: File,
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number,
  targetMime: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/png',
  quality: number = 0.95
): Promise<ProcessedImageResult> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(cropWidth));
  canvas.height = Math.max(1, Math.round(cropHeight));

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas');

  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(
    img,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error('Cropping failed.'));
        resolve({
          blob,
          dataUrl: canvas.toDataURL(targetMime, quality),
          width: canvas.width,
          height: canvas.height,
          originalSize: file.size,
          newSize: blob.size,
          reductionPercent: Math.round(((file.size - blob.size) / file.size) * 100),
          format: targetMime,
        });
      },
      targetMime,
      quality
    );
  });
}

export async function rotateAndFlipImage(
  file: File,
  degrees: number,
  flipHorizontal: boolean,
  flipVertical: boolean,
  targetMime: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/png',
  quality: number = 0.95
): Promise<ProcessedImageResult> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context.');

  const rad = (degrees * Math.PI) / 180;
  const is90or270 = Math.abs(degrees % 180) === 90;

  canvas.width = is90or270 ? img.naturalHeight : img.naturalWidth;
  canvas.height = is90or270 ? img.naturalWidth : img.naturalHeight;

  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error('Failed to export transformed image'));
        resolve({
          blob,
          dataUrl: canvas.toDataURL(targetMime, quality),
          width: canvas.width,
          height: canvas.height,
          originalSize: file.size,
          newSize: blob.size,
          reductionPercent: Math.round(((file.size - blob.size) / file.size) * 100),
          format: targetMime,
        });
      },
      targetMime,
      quality
    );
  });
}

export async function addWatermarkToImage(
  file: File,
  text: string,
  options: {
    fontSize: number;
    color: string;
    opacity: number;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  }
): Promise<ProcessedImageResult> {
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context.');

  ctx.drawImage(img, 0, 0);

  ctx.save();
  ctx.globalAlpha = Math.max(0.1, Math.min(1, options.opacity));
  ctx.fillStyle = options.color;
  ctx.font = `bold ${options.fontSize}px sans-serif`;

  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = options.fontSize;

  let x = 20;
  let y = textHeight + 20;

  switch (options.position) {
    case 'center':
      x = (canvas.width - textWidth) / 2;
      y = canvas.height / 2;
      break;
    case 'bottom-right':
      x = canvas.width - textWidth - 30;
      y = canvas.height - 30;
      break;
    case 'bottom-left':
      x = 30;
      y = canvas.height - 30;
      break;
    case 'top-right':
      x = canvas.width - textWidth - 30;
      y = textHeight + 30;
      break;
    case 'top-left':
      x = 30;
      y = textHeight + 30;
      break;
  }

  ctx.fillText(text, x, y);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error('Watermarking failed'));
        resolve({
          blob,
          dataUrl: canvas.toDataURL('image/png'),
          width: canvas.width,
          height: canvas.height,
          originalSize: file.size,
          newSize: blob.size,
          reductionPercent: 0,
          format: 'image/png',
        });
      },
      'image/png'
    );
  });
}

export async function stripExifMetadata(file: File): Promise<ProcessedImageResult> {
  // Loading into canvas and re-encoding effectively strips all EXIF, GPS, camera metadata and headers
  const img = await loadImageFromFile(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(img, 0, 0);

  const mime = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error('EXIF strip failed'));
        resolve({
          blob,
          dataUrl: canvas.toDataURL(mime, 0.95),
          width: canvas.width,
          height: canvas.height,
          originalSize: file.size,
          newSize: blob.size,
          reductionPercent: Math.round(((file.size - blob.size) / file.size) * 100),
          format: mime,
        });
      },
      mime,
      0.95
    );
  });
}

export async function generateFaviconSizes(file: File): Promise<Array<{ size: number; dataUrl: string; blob: Blob }>> {
  const sizes = [16, 32, 48, 64, 180];
  const img = await loadImageFromFile(file);
  const results: Array<{ size: number; dataUrl: string; blob: Blob }> = [];

  for (const s of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, s, s);

    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
    if (blob) {
      results.push({
        size: s,
        dataUrl: canvas.toDataURL('image/png'),
        blob,
      });
    }
  }

  return results;
}
