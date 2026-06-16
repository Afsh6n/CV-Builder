import { ResumeIconName } from '../../shared/components/resume-icon/resume-icon';

export const APP_META = {
  title: 'رزومه ساز',
  subtitle: 'ساخت رزومه فارسی حرفه‌ای با خروجی PDF و تصویر PNG'
} as const;

export interface FooterLink {
  label: string;
  url: string;
  icon: ResumeIconName;
}

export const APP_FOOTER = {
  author: 'افشین کریمی',
  credit: 'ساخته شده توسط',
  links: [
    { label: 'GitHub', url: 'https://github.com/Afsh6n', icon: 'github' as ResumeIconName },
    { label: 'Telegram', url: 'https://t.me/DevYara', icon: 'telegram' as ResumeIconName },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/Afsh6n', icon: 'linkedin' as ResumeIconName },
  ] satisfies FooterLink[]
} as const;

export const CUSTOM_SECTION_ICON_OPTIONS: { value: ResumeIconName; label: string }[] = [
  { value: 'projects', label: 'پروژه' },
  { value: 'certificate', label: 'گواهی' },
  { value: 'education', label: 'تحصیلات' },
  { value: 'work', label: 'کاری' },
  { value: 'skills', label: 'مهارت' },
  { value: 'website', label: 'وب' },
  { value: 'summary', label: 'متن' }
];

