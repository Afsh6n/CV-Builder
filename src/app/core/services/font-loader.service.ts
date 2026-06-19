import { inject, Injectable } from '@angular/core';

import { AlertService } from './alert.service';
import { FONT_PRESETS, FontFamilyId, getFontPreset } from '../constants/font.constants';


@Injectable({ providedIn: 'root' })
export class FontLoaderService {
  private alertService = inject(AlertService);
  private loaded = new Set<FontFamilyId>();

  async ensureLoaded(id: FontFamilyId): Promise<void> {
    if (this.loaded.has(id)) return;
    const preset = getFontPreset(id);
    await Promise.all([
      this.loadFace(preset.family, preset.regularUrl, 400),
      preset.boldUrl ? this.loadFace(preset.family, preset.boldUrl, 700) : Promise.resolve()
    ]);
    this.loaded.add(id);
  }

  private async loadFace(family: string, url: string, weight: number): Promise<void> {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        await this.alertService.warning(`فونت ${family} یافت نشد. از فونت پیش‌فرض استفاده می‌شود.`);
        return;
      }
      const buffer = await res.arrayBuffer();
      const face = new FontFace(family, buffer, { weight: String(weight), style: 'normal' });
      const loaded = await face.load();
      document.fonts.add(loaded);
    } catch {
      await this.alertService.warning(`بارگذاری فونت ${family} ناموفق بود. از فونت پیش‌فرض استفاده می‌شود.`);
    }
  }

  preloadCommon(): void {
    FONT_PRESETS.slice(0, 3).forEach(p => {
      this.ensureLoaded(p.id).catch(() => { });
    });
  }
}
