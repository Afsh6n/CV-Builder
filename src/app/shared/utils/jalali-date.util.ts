import moment from 'jalali-moment';

import { toEnglishDigits } from '../pipes/persian-digits.pipe';

export type JalaliDateMode = 'date' | 'month';

const FORMAT: Record<JalaliDateMode, string> = {
  date: 'jYYYY/jMM/jDD',
  month: 'jYYYY/jMM'
};

export function formatJalali(value: string, mode: JalaliDateMode): string {
  const parsed = parseJalali(value, mode);
  return parsed ? parsed.format(FORMAT[mode]) : '';
}

export function parseJalali(value: string, mode: JalaliDateMode): moment.Moment | null {
  const raw = toEnglishDigits(value).trim();
  if (!raw) return null;
  const m = moment(raw, FORMAT[mode], true);
  return m.isValid() ? m : null;
}

export function todayJalali(mode: JalaliDateMode): moment.Moment {
  return moment().locale('fa');
}

export function jalaliMonthDays(year: number, month: number): number {
  return moment.jDaysInMonth(year, month - 1);
}

export function buildCalendarGrid(
  viewYear: number,
  viewMonth: number
): { day: number; inMonth: boolean; date: moment.Moment | null }[] {
  const first = moment(`${viewYear}/${viewMonth}/1`, 'jYYYY/jM/jD').locale('fa');
  const daysInMonth = jalaliMonthDays(viewYear, viewMonth);
  
  const startWeekday = first.weekday(); 

  const cells: { day: number; inMonth: boolean; date: moment.Moment | null }[] = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: 0, inMonth: false, date: null });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = moment(`${viewYear}/${viewMonth}/${d}`, 'jYYYY/jM/jD').locale('fa');
    cells.push({
      day: d,
      inMonth: true,
      date: date
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: 0, inMonth: false, date: null });
  }
  
  return cells;
}

export const JALALI_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export function buildYearOptions(centerYear?: number, span = 80): number[] {
  const currentYear = todayJalali('date').jYear();
  const start = 1330;
  const end = currentYear + 10;
  const years: number[] = [];
  for (let y = end; y >= start; y--) {
    years.push(y);
  }
  return years;
}
