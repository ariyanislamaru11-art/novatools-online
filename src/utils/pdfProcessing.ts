/**
 * Real PDF Processing Pipeline for NovaTools using pdf-lib
 * 100% Client-side in-browser processing with zero server uploads
 */

import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export async function mergePDFs(pdfFiles: File[]): Promise<{ blob: Blob; pageCount: number }> {
  if (pdfFiles.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach(page => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  const blob = new Blob([mergedBytes as any], { type: 'application/pdf' });
  return { blob, pageCount: mergedPdf.getPageCount() };
}

export async function splitPDF(pdfFile: File, pageRangesStr: string): Promise<{ blob: Blob; pageCount: number }> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  // Parse page ranges (e.g. "1-3, 5, 7-9")
  const selectedIndices = parsePageRanges(pageRangesStr, totalPages);
  if (selectedIndices.length === 0) {
    throw new Error(`No valid pages selected. Document has ${totalPages} pages.`);
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, selectedIndices);
  copiedPages.forEach(page => newPdf.addPage(page));

  const newBytes = await newPdf.save();
  const blob = new Blob([newBytes as any], { type: 'application/pdf' });
  return { blob, pageCount: newPdf.getPageCount() };
}

export function parsePageRanges(rangesStr: string, maxPages: number): number[] {
  const indices: number[] = [];
  const parts = rangesStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let p = Math.max(1, start); p <= Math.min(maxPages, end); p++) {
          indices.push(p - 1); // 0-indexed
        }
      }
    } else {
      const page = parseInt(trimmed, 10);
      if (!isNaN(page) && page >= 1 && page <= maxPages) {
        indices.push(page - 1);
      }
    }
  }

  // Remove duplicates while keeping order
  return Array.from(new Set(indices));
}

export async function rotatePDFPages(pdfFile: File, rotationDegrees: number, pageNumbers?: number[]): Promise<{ blob: Blob; pageCount: number }> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  pages.forEach((page, index) => {
    if (!pageNumbers || pageNumbers.includes(index + 1)) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationDegrees) % 360));
    }
  });

  const pdfBytes = await pdfDoc.save();
  return { blob: new Blob([pdfBytes as any], { type: 'application/pdf' }), pageCount: pages.length };
}

export async function deletePDFPages(pdfFile: File, pagesToDelete: number[]): Promise<{ blob: Blob; remainingCount: number }> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const total = pdfDoc.getPageCount();

  // Convert to 0-indexed set
  const toDeleteSet = new Set(pagesToDelete.map(p => p - 1));

  if (toDeleteSet.size >= total) {
    throw new Error('You cannot delete all pages in the PDF.');
  }

  const remainingIndices: number[] = [];
  for (let i = 0; i < total; i++) {
    if (!toDeleteSet.has(i)) {
      remainingIndices.push(i);
    }
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, remainingIndices);
  copiedPages.forEach(p => newPdf.addPage(p));

  const pdfBytes = await newPdf.save();
  return { blob: new Blob([pdfBytes as any], { type: 'application/pdf' }), remainingCount: newPdf.getPageCount() };
}

export async function reorderPDFPages(pdfFile: File, newPageOrder1Indexed: number[]): Promise<{ blob: Blob; pageCount: number }> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const total = pdfDoc.getPageCount();

  const validIndices = newPageOrder1Indexed
    .filter(p => p >= 1 && p <= total)
    .map(p => p - 1);

  if (validIndices.length === 0) {
    throw new Error('Invalid page order provided.');
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, validIndices);
  copiedPages.forEach(p => newPdf.addPage(p));

  const pdfBytes = await newPdf.save();
  return { blob: new Blob([pdfBytes as any], { type: 'application/pdf' }), pageCount: newPdf.getPageCount() };
}

export async function addPageNumbersToPDF(
  pdfFile: File,
  options: {
    format: 'Page X of Y' | 'X / Y' | 'X';
    position: 'bottom-center' | 'bottom-right' | 'top-right' | 'bottom-left';
    fontSize: number;
  }
): Promise<{ blob: Blob; pageCount: number }> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const total = pdfDoc.getPageCount();

  for (let i = 0; i < total; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const pageNum = i + 1;

    let text = `${pageNum}`;
    if (options.format === 'Page X of Y') text = `Page ${pageNum} of ${total}`;
    else if (options.format === 'X / Y') text = `${pageNum} / ${total}`;

    const textWidth = font.widthOfTextAtSize(text, options.fontSize);
    let x = (width - textWidth) / 2;
    let y = 25;

    if (options.position === 'bottom-right') {
      x = width - textWidth - 30;
      y = 25;
    } else if (options.position === 'bottom-left') {
      x = 30;
      y = 25;
    } else if (options.position === 'top-right') {
      x = width - textWidth - 30;
      y = height - 35;
    }

    page.drawText(text, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return { blob: new Blob([pdfBytes as any], { type: 'application/pdf' }), pageCount: total };
}

export async function addWatermarkToPDF(
  pdfFile: File,
  text: string,
  options: { fontSize: number; opacity: number }
): Promise<{ blob: Blob; pageCount: number }> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const total = pdfDoc.getPageCount();

  for (let i = 0; i < total; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, options.fontSize);

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: options.fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: options.opacity,
      rotate: degrees(45),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return { blob: new Blob([pdfBytes as any], { type: 'application/pdf' }), pageCount: total };
}

export async function readPDFMetadata(pdfFile: File) {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return {
    title: pdfDoc.getTitle() || '',
    author: pdfDoc.getAuthor() || '',
    subject: pdfDoc.getSubject() || '',
    keywords: pdfDoc.getKeywords() || '',
    creator: pdfDoc.getCreator() || '',
    producer: pdfDoc.getProducer() || '',
    pageCount: pdfDoc.getPageCount(),
    creationDate: pdfDoc.getCreationDate()?.toLocaleString() || '',
    modificationDate: pdfDoc.getModificationDate()?.toLocaleString() || '',
  };
}

export async function updatePDFMetadata(
  pdfFile: File,
  meta: { title?: string; author?: string; subject?: string; keywords?: string }
): Promise<Blob> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  if (meta.title !== undefined) pdfDoc.setTitle(meta.title);
  if (meta.author !== undefined) pdfDoc.setAuthor(meta.author);
  if (meta.subject !== undefined) pdfDoc.setSubject(meta.subject);
  if (meta.keywords !== undefined) pdfDoc.setKeywords([meta.keywords]);

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as any], { type: 'application/pdf' });
}

export async function imagesToPDF(
  imageFiles: File[],
  pageSize: 'A4' | 'Letter' | 'Fit' = 'A4',
  margin: number = 20
): Promise<{ blob: Blob; pageCount: number }> {
  if (imageFiles.length === 0) throw new Error('Please select at least one image file.');

  const pdfDoc = await PDFDocument.create();

  // Page dimensions in points (72 points per inch)
  const dimensions = {
    A4: { width: 595.28, height: 841.89 },
    Letter: { width: 612.0, height: 792.0 },
  };

  for (const file of imageFiles) {
    const arrayBuffer = await file.arrayBuffer();
    let embeddedImg;

    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      embeddedImg = await pdfDoc.embedJpg(arrayBuffer);
    } else {
      // For PNG or other formats
      embeddedImg = await pdfDoc.embedPng(arrayBuffer);
    }

    let pageWidth = dimensions.A4.width;
    let pageHeight = dimensions.A4.height;

    if (pageSize === 'Letter') {
      pageWidth = dimensions.Letter.width;
      pageHeight = dimensions.Letter.height;
    } else if (pageSize === 'Fit') {
      pageWidth = embeddedImg.width + margin * 2;
      pageHeight = embeddedImg.height + margin * 2;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Scale image while preserving aspect ratio
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const imgRatio = embeddedImg.width / embeddedImg.height;
    const maxRatio = maxWidth / maxHeight;

    let drawWidth = maxWidth;
    let drawHeight = maxHeight;

    if (imgRatio > maxRatio) {
      drawWidth = maxWidth;
      drawHeight = maxWidth / imgRatio;
    } else {
      drawHeight = maxHeight;
      drawWidth = maxHeight * imgRatio;
    }

    const x = margin + (maxWidth - drawWidth) / 2;
    const y = margin + (maxHeight - drawHeight) / 2;

    page.drawImage(embeddedImg, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return { blob: new Blob([pdfBytes as any], { type: 'application/pdf' }), pageCount: pdfDoc.getPageCount() };
}
