import { CommonModule } from '@angular/common';
import { Component, input, computed, signal, effect, inject, untracked } from '@angular/core';
import { ResumeIcon, ResumeIconName } from '@app/shared/components/resume-icon/resume-icon';
import { CertificateLightbox } from './certificate-lightbox/certificate-lightbox';
import { SkillCard } from './skill-card/skill-card';
import { SkillChart } from './skill-chart/skill-chart';
import { MonthFormatPipe } from '@app/shared/pipes/month-format.pipe';
import { FontLoaderService } from '@app/core/services/font-loader.service';
import { QrCodeService } from '@app/core/services/qr-code.service';
import { Certificate, Resume, SkillDisplayType, SocialPlatform,ThemeId } from '@app/core/types/resume.types';
import { LANGUAGE_LEVEL_LABELS, SKILL_LEVEL_LABELS, THEME_PRESETS } from '@app/core/constants/resume.constants';
import { fontFamilyCss } from '@app/core/constants/font.constants';
import { toPersianDigits } from '@app/shared/pipes/persian-digits.pipe';
import { formatSalary } from '@app/shared/utils/salary.formatter';


type SectionType = 'career' | 'education' | 'work' | 'technicalSkills' | 'softSkills' | 'certificates' | 'projects' | 'custom';

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

  sectionOrder = signal<SectionType[]>(['career', 'education', 'work', 'technicalSkills', 'softSkills', 'certificates', 'projects', 'custom']);
  draggedSection = signal<SectionType | null>(null);
  isDragging = signal<boolean>(false);

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

  onDragStart(section: SectionType, event: DragEvent): void {
    this.draggedSection.set(section);
    this.isDragging.set(true);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', section);
    }
  }

  onDragEnd(): void {
    this.draggedSection.set(null);
    this.isDragging.set(false);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(targetSection: SectionType, event: DragEvent): void {
    event.preventDefault();
    const dragged = this.draggedSection();
    if (!dragged || dragged === targetSection) {
      this.onDragEnd();
      return;
    }

    const currentOrder = [...this.sectionOrder()];
    const draggedIndex = currentOrder.indexOf(dragged);
    const targetIndex = currentOrder.indexOf(targetSection);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newOrder = [...currentOrder];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, dragged);
      this.sectionOrder.set(newOrder);
    }

    this.onDragEnd();
  }

  isSectionVisible(section: SectionType): boolean {
    const r = this.resume();
    if (!r) return false;

    switch (section) {
      case 'career':
        return !!(
          r.settings.sections.careerInfo &&
          r.settings.display.showCareerInfo &&
          (r.careerInfo.expectedSalary || r.careerInfo.totalExperience)
        );
      case 'education':
        return r.education.length > 0;
      case 'work':
        return r.workExperience.length > 0;
      case 'technicalSkills':
        return this.technicalSkills().length > 0;
      case 'softSkills':
        return !!(r.settings.sections.softSkills && this.softSkills().length > 0);
      case 'certificates':
        return !!(r.settings.sections.certificates && r.certificates.length > 0);
      case 'projects':
        return !!(r.settings.sections.projects && r.projects.length > 0);
      case 'custom':
        return r.customSections.length > 0;
      default:
        return false;
    }
  }

  getVisibleSections(): SectionType[] {
    return this.sectionOrder().filter(section => this.isSectionVisible(section));
  }

  isSectionBeingDragged(section: SectionType): boolean {
    return this.draggedSection() === section;
  }
}
