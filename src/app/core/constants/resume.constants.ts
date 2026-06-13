import { LayoutId, MilitaryStatus, ResumeDisplayOptions, ResumeSections, SkillDisplayType, SocialPlatform, ThemeId } from "../types/resume.types";
import { FontFamilyId } from "./font.constants";


export const SKILL_LEVEL_LABELS: Record<number, string> = {
  1: 'مبتدی', 2: 'پایه', 3: 'متوسط', 4: 'پیشرفته', 5: 'حرفه‌ای'
};

export const SKILL_LEVEL_PERCENT: Record<number, number> = {
  1: 20, 2: 40, 3: 60, 4: 80, 5: 100
};

export const LANGUAGE_LEVEL_LABELS = SKILL_LEVEL_LABELS;

export const THEME_PRESETS: Record<ThemeId, { primary: string; primaryLight: string; accent: string; name: string }> = {
  blue: { primary: '#3b82f6', primaryLight: '#eff6ff', accent: '#2563eb', name: 'آبی' },
  teal: { primary: '#0d9488', primaryLight: '#f0fdfa', accent: '#0f766e', name: 'فیروزه‌ای' },
  purple: { primary: '#7c3aed', primaryLight: '#f5f3ff', accent: '#6d28d9', name: 'بنفش' },
  rose: { primary: '#e11d48', primaryLight: '#fff1f2', accent: '#be123c', name: 'گل‌رز' }
};

export const LAYOUT_PRESETS: Record<LayoutId, { name: string; description: string }> = {
  default: { name: 'پیش‌فرض', description: 'چیدمان فعلی دو ستونه' },
  modern: { name: 'مدرن', description: 'کارت‌های گرد و سایه ملایم' },
  classic: { name: 'کلاسیک', description: 'حاشیه‌ها و خطوط سنتی' },
  minimalist: { name: 'مینیمال', description: 'فضای سفید بیشتر و خطوط نازک' }
};

export const DEFAULT_DISPLAY: ResumeDisplayOptions = {
  showLastUpdated: false,
  showQrCode: false,
  qrCodeContent: '',
  showCertificateThumbnails: true,
  showPersonalInfoLabels: true,
  showCareerInfo: true
};

export const DEFAULT_SECTIONS: ResumeSections = {
  technicalSkills: true,
  softSkills: true,
  certificates: true,
  socialMedia: true,
  projects: true,
  languages: true,
  careerInfo: true
};

export const DEFAULT_SETTINGS = {
  themeId: 'blue' as ThemeId,
  layoutId: 'default' as LayoutId,
  fontFamilyId: 'vazirmatn' as FontFamilyId,
  technicalSkillsDisplay: 'cards' as SkillDisplayType,
  softSkillsDisplay: 'radialBar' as SkillDisplayType,
  sections: { ...DEFAULT_SECTIONS },
  display: { ...DEFAULT_DISPLAY }
} as const;

export const SOCIAL_PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'website', label: 'وب‌سایت' },
  { value: 'other', label: 'سایر' }
];

export const DEGREE_OPTIONS = [
  'دیپلم', 'کاردانی', 'کارشناسی', 'کارشناسی ارشد', 'دکتری', 'فوق دکتری'
];

export const MILITARY_OPTIONS: MilitaryStatus[] = [
  'پایان خدمت', 'معاف', 'معافیت تحصیلی', 'در حال خدمت', 'مشمول'
];

export const LANGUAGE_OPTIONS = [
  'فارسی (زبان مادری)', 'انگلیسی', 'عربی', 'آلمانی', 'فرانسوی',
  'ترکی', 'چینی', 'اسپانیایی', 'روسی', 'ایتالیایی', 'ژاپنی', 'کره‌ای', 'سایر'
];

export const SKILL_DISPLAY_OPTIONS: { value: SkillDisplayType; label: string }[] = [
  { value: 'cards', label: 'کارت‌های مهارت (پیشنهادی)' },
  { value: 'bar', label: 'نمودار میله‌ای افقی (Bar)' },
  { value: 'column', label: 'نمودار ستونی (Column)' },
  { value: 'radialBar', label: 'دایره‌ای (همه در یک)' },
  { value: 'radialIndividual', label: 'دایره‌ای (هر کدام جدا)' },
  { value: 'pie', label: 'نمودار پای (Pie)' }
];