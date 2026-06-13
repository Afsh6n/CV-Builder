import { Pipe, PipeTransform } from '@angular/core';

const EN = '0123456789';
const FA = '۰۱۲۳۴۵۶۷۸۹';

export function toPersianDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[0-9]/g, d => FA[EN.indexOf(d)] ?? d);
}

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹]/g, d => {
    const i = FA.indexOf(d);
    return i >= 0 ? EN[i] : d;
  });
}

@Pipe({ name: 'persianDigits'})
export class PersianDigitsPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    return toPersianDigits(value);
  }
}
