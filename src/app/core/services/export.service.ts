import { Injectable, inject } from '@angular/core';

import { FontLoaderService } from './font-loader.service';
import { Resume } from '../types/resume.types';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private fontLoader = inject(FontLoaderService);

  async exportToPdf(
    element: HTMLElement,
    resume: Resume,
    filename?: string
  ): Promise<void> {
    const name = filename || this.suggestFilename(resume, 'pdf');
    const fontId = resume.settings.fontFamilyId;

    await this.fontLoader.ensureLoaded(fontId);
    await document.fonts.ready;
    await this.exportWithHtml2Pdf(element, name);
  }

  async exportToImage(element: HTMLElement, resume: Resume, filename?: string): Promise<void> {
    const name = filename || this.suggestFilename(resume, 'png');
    await document.fonts.ready;

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        clonedDoc.fonts.ready;
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = name;
    link.click();
  }

  private async exportWithHtml2Pdf(element: HTMLElement, filename: string): Promise<void> {
    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: {
        scale: 4,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc: Document) => {
          clonedDoc.fonts.ready;
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
    };
    await html2pdf().set(opt).from(element).save();
  }

  private suggestFilename(resume: Resume, ext: string): string {
    const info = resume.personalInfo;
    const name = `${info.firstName}_${info.lastName}`.trim().replace(/\s+/g, '_');
    return `${name || 'resume'}.${ext}`;
  }
}