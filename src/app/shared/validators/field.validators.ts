import { parseJalali } from '../utils/jalali-date.util';

export function isValidEmail(value: string): boolean {
  if (!value.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidMobile(value: string): boolean {
  if (!value.trim()) return true;
  const n = value.replace(/\D/g, '');
  return /^09\d{9}$/.test(n) || /^9\d{9}$/.test(n);
}

export function isValidPhone(value: string): boolean {
  if (!value.trim()) return true;
  const n = value.replace(/\D/g, '');
  return n.length >= 8 && n.length <= 11;
}

export function isValidUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const u = value.startsWith('http') ? value : `https://${value}`;
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

export function emailError(value: string): string {
  return isValidEmail(value) ? '' : 'فرمت ایمیل معتبر نیست';
}

export function mobileError(value: string): string {
  return isValidMobile(value) ? '' : 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود';
}

export function phoneError(value: string): string {
  return isValidPhone(value) ? '' : 'شماره تلفن معتبر نیست';
}

export function urlError(value: string): string {
  return isValidUrl(value) ? '' : 'آدرس وب معتبر نیست';
}

export function requiredError(value: string, label = 'این فیلد'): string {
  return value.trim() ? '' : `${label} الزامی است`;
}

export function jalaliDateError(value: string, mode: 'date' | 'month' = 'date'): string {
  if (!value.trim()) return '';
  return parseJalali(value, mode)
    ? ''
    : mode === 'month'
      ? 'تاریخ نامعتبر است (مثال: ۱۴۰۳/۰۶)'
      : 'تاریخ نامعتبر است (مثال: ۱۴۰۳/۰۶/۱۵)';
}
