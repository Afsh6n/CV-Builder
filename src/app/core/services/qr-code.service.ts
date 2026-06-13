import { Injectable } from '@angular/core';
import QRCode from 'qrcode';

@Injectable({ providedIn: 'root' })
export class QrCodeService {
  async toDataUrl(text: string, size = 120): Promise<string> {
    if (!text.trim()) return '';
    return QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: { dark: '#1e293b', light: '#ffffff' }
    });
  }
}
