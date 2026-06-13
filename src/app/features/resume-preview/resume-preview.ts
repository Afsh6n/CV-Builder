import { Component, input, computed, signal, effect, inject, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeIcon, ResumeIconName } from '../../shared/components/resume-icon/resume-icon';
import { SkillCard } from '../../shared/components/skill-card/skill-card';
import { SkillChart } from '../../shared/components/skill-chart/skill-chart';
import { MonthFormatPipe } from '../../shared/pipes/month-format.pipe';
import { toPersianDigits } from '../../shared/pipes/persian-digits.pipe';
import { FontLoaderService } from '../../core/services/font-loader.service';
import { QrCodeService } from '../../core/services/qr-code.service';
import { CertificateLightbox } from '../../shared/components/certificate-lightbox/certificate-lightbox';
import { fontFamilyCss } from '../../core/constants/font.constants';
import { Certificate, Resume, SkillDisplayType, SocialPlatform, ThemeId } from '../../core/types/resume.types';
import { LANGUAGE_LEVEL_LABELS, SKILL_LEVEL_LABELS, THEME_PRESETS } from '../../core/constants/resume.constants';
import { formatSalary } from '../../shared/utils/salary.formatter';

@Component({
  selector: 'app-resume-preview',
  imports: [
    CommonModule,
    ResumeIcon,
    CertificateLightbox,
    SkillCard,
    SkillChart,
    MonthFormatPipe
  ],
  templateUrl: './resume-preview.html',
  styleUrl: './resume-preview.css'
})
export class ResumePreview {
  private fontLoader = inject(FontLoaderService);
  private qrCodeService = inject(QrCodeService);

  resume = input<Resume | null>(null);
  languageLabels = LANGUAGE_LEVEL_LABELS;
  skillLabels = SKILL_LEVEL_LABELS;

  qrDataUrl = signal<string>('');
  lightboxImage = signal<string>('');
  lightboxTitle = signal<string>('');

  layoutClass = computed(() => `layout-${this.resume()?.settings.layoutId || 'default'}`);
  careerInfo = computed(() => this.resume()?.careerInfo);

  themeVars = computed(() => {
    const r = this.resume();
    const id = (r?.settings.themeId || 'blue') as ThemeId;
    const t = THEME_PRESETS[id];
    return {
      '--theme-primary': t.primary,
      '--theme-primary-light': t.primaryLight,
      '--theme-accent': t.accent,
      'font-family': fontFamilyCss(r?.settings.fontFamilyId || 'vazirmatn')
    };
  });

  themePrimary = computed(() => THEME_PRESETS[(this.resume()?.settings.themeId || 'blue') as ThemeId].primary);
  themeAccent = computed(() => THEME_PRESETS[(this.resume()?.settings.themeId || 'blue') as ThemeId].accent);
  chartFont = computed(() => fontFamilyCss(this.resume()?.settings.fontFamilyId || 'vazirmatn'));

  certificatesForDisplay = computed(() => [...(this.resume()?.certificates || [])].reverse());

  technicalSkills = computed(
    () => this.resume()?.skills.filter(s => s.category === 'technical' && s.name.trim()) || []
  );

  softSkills = computed(
    () => this.resume()?.skills.filter(s => s.category === 'soft' && s.name.trim()) || []
  );

  technicalDisplay = computed(() => this.resume()?.settings.technicalSkillsDisplay || 'cards');
  softDisplay = computed(() => this.resume()?.settings.softSkillsDisplay || 'radialBar');

  constructor() {
    effect(() => {
      const r = this.resume();
      if (!r) return;
      const fontId = r.settings.fontFamilyId;
      const qrContent = r.settings.display.qrCodeContent.trim();
      const showQr = r.settings.display.showQrCode && !!qrContent;
      untracked(() => {
        this.fontLoader.ensureLoaded(fontId).catch(() => { });
        if (showQr) {
          this.qrCodeService.toDataUrl(qrContent).then(url => this.qrDataUrl.set(url));
        } else if (this.qrDataUrl()) {
          this.qrDataUrl.set('');
        }
      });
    });
  }

  fullName = computed(() => {
    const info = this.resume()?.personalInfo;
    return info ? `${info.firstName} ${info.lastName}`.trim() : '';
  });

  locationText = computed(() => {
    const info = this.resume()?.personalInfo;
    return info ? [info.city, info.province, info.country].filter(Boolean).join('، ') : '';
  });

  photoStyle = computed(() => ({
    'object-position': `center ${this.resume()?.personalInfo.photoOffsetY ?? 50}%`
  }));

  showPersonalLabels = computed(() => {
    return this.resume()?.settings.display.showPersonalInfoLabels !== false;
  });

  compactBasicInfo(): string {
    const info = this.resume()?.personalInfo;
    if (!info) return '';
    return [info.birthDate, info.maritalStatus, info.militaryStatus].filter(v => !!v).join(' | ');
  }

  formatLastUpdated(): string {
    const iso = this.resume()?.lastUpdatedAt;
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));
    } catch {
      return '';
    }
  }

  getCertValidity(cert: { validFrom: string; validTo: string; current: boolean }): string {
    if (cert.current) return `اعتبار از ${cert.validFrom || '—'} تا اکنون`;
    return `اعتبار از ${cert.validFrom || '—'} تا ${cert.validTo || '—'}`;
  }

  getDescriptionLines(text: string): string[] {
    return text.split('\n').filter(line => line.trim());
  }

  getSocialDisplay(item: { username: string; url: string }): string {
    return item.username || item.url || '';
  }

  getSocialIcon(platform: SocialPlatform): ResumeIconName {
    const map: Record<SocialPlatform, ResumeIconName> = {
      github: 'github',
      gitlab: 'gitlab',
      linkedin: 'linkedin',
      telegram: 'telegram',
      instagram: 'instagram',
      twitter: 'twitter',
      youtube: 'youtube',
      website: 'website',
      other: 'social'
    };
    return map[platform] || 'social';
  }

  normalizeUrl(url: string): string {
    return url && !url.startsWith('http') ? `https://${url}` : url;
  }

  getEducationLocation(edu: { city: string; province: string; country: string }): string {
    return [edu.city, edu.province, edu.country].filter(Boolean).join('، ');
  }

  getWorkLocation(exp: { city: string; province: string; country: string }): string {
    return [exp.city, exp.province, exp.country].filter(Boolean).join('، ');
  }

  useSkillCards(display: SkillDisplayType): boolean {
    return display === 'cards';
  }

  isChartMode(display: SkillDisplayType): display is Exclude<SkillDisplayType, 'cards'> {
    return display !== 'cards';
  }

  asChartMode(display: SkillDisplayType): Exclude<SkillDisplayType, 'cards'> {
    return display as Exclude<SkillDisplayType, 'cards'>;
  }

  formatMonth(value: string): string {
    if (!value) return '';
    return toPersianDigits(value.replace(/-/g, '/'));
  }

  openCertificateImage(cert: Certificate): void {
    if (!cert.imageData) return;
    this.lightboxImage.set(cert.imageData);
    this.lightboxTitle.set(cert.title);
  }

  closeLightbox(): void {
    this.lightboxImage.set('');
    this.lightboxTitle.set('');
  }

  showCertThumbnail(cert: Certificate): boolean {
    return !!(this.resume()?.settings.display.showCertificateThumbnails && cert.imageData);
  }

  formatSalaryView(value?: string): string {
    if (!value) return '';
    return formatSalary(value);
  }

  formatExperience(value?: string): string {
    if (!value) return '';
    return `${value} سال`;
  }
}
