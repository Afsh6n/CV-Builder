import { Pipe, PipeTransform } from '@angular/core';

import { toPersianDigits } from './persian-digits.pipe';

@Pipe({ name: 'monthFormat'  })
export class MonthFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return toPersianDigits(value.replace(/-/g, '/'));
  }
}
