import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  inject,
  ElementRef,
  HostListener
} from '@angular/core';
import { toPersianDigits } from '@app/shared/pipes/persian-digits.pipe';
import { buildCalendarGrid, buildYearOptions, formatJalali, JALALI_MONTHS, JalaliDateMode, parseJalali, todayJalali } from '@app/shared/utils/jalali-date.util';
import moment from 'jalali-moment';


export type PersianDateMode = JalaliDateMode;

@Component({
  selector: 'app-persian-date-input',
  templateUrl: './persian-date-input.html',
  styleUrl: './persian-date-input.css'
})
export class PersianDateInput {
  private host = inject(ElementRef<HTMLElement>);
  readonly toPersianDigits = toPersianDigits;
  readonly monthNames = JALALI_MONTHS;

  value = input<string>('');
  mode = input<PersianDateMode>('date');
  placeholder = input<string>('');
  error = input<string>('');
  disabled = input(false);
  valueChange = output<string>();

  open = signal(false);
  viewMode = signal<'calendar' | 'months' | 'years'>('calendar');
  viewYear = signal(todayJalali('date').jYear());
  viewMonth = signal(todayJalali('date').jMonth() + 1);

  displayPlaceholder = computed(
    () => this.placeholder() || (this.mode() === 'month' ? 'مثال: ۱۴۰۳/۰۶' : 'انتخاب تاریخ')
  );

  displayValue = computed(() => {
    const v = this.value();
    if (!v) return '';
    const formatted = formatJalali(v, this.mode()) || v;
    return toPersianDigits(formatted);
  });

  yearOptions = computed(() => buildYearOptions(this.viewYear(), 40));

  calendarCells = computed(() => buildCalendarGrid(this.viewYear(), this.viewMonth()));

  selectedMonthIndex = computed(() => {
    const m = parseJalali(this.value(), 'month');
    if (!m || m.jYear() !== this.viewYear()) return -1;
    return m.jMonth();
  });

  constructor() {
    effect(() => {
      const m = parseJalali(this.value(), this.mode());
      if (m) {
        this.viewYear.set(m.jYear());
        this.viewMonth.set(m.jMonth() + 1);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  toggle(): void {
    if (this.disabled()) return;
    const isOpen = this.open();
    if (!isOpen) {
      this.viewMode.set(this.mode() === 'month' ? 'months' : 'calendar');
      const m = parseJalali(this.value(), this.mode());
      if (m) {
        this.viewYear.set(m.jYear());
        this.viewMonth.set(m.jMonth() + 1);
      } else {
        const today = todayJalali('date');
        this.viewYear.set(today.jYear());
        this.viewMonth.set(today.jMonth() + 1);
      }
    }
    this.open.set(!isOpen);
  }

  showYearPicker(): void {
    this.viewMode.set('years');
  }

  showMonthPicker(): void {
    this.viewMode.set('months');
  }

  selectYear(year: number): void {
    this.viewYear.set(year);
    if (this.mode() === 'month') {
      this.viewMode.set('months');
    } else {
      this.viewMode.set('calendar');
    }
  }

  onYearSelect(event: Event): void {
    const y = Number((event.target as HTMLSelectElement).value);
    if (!Number.isNaN(y)) this.selectYear(y);
  }

  onMonthSelect(month: number): void {
    this.viewMonth.set(month);
    if (this.mode() === 'date') {
      this.viewMode.set('calendar');
    } else {
      this.selectMonth(month - 1);
    }
  }

  shiftYear(delta: number): void {
    this.viewYear.update(y => y + delta);
  }

  selectMonth(monthIndex: number): void {
    const formatted = moment(`${this.viewYear()}/${monthIndex + 1}/1`, 'jYYYY/jM/jD').format('jYYYY/jMM');
    this.valueChange.emit(formatted);
    this.open.set(false);
  }

  selectDay(date: moment.Moment): void {
    this.valueChange.emit(date.format('jYYYY/jMM/jDD'));
    this.open.set(false);
  }

  selectToday(): void {
    const t = todayJalali('date');
    if (this.mode() === 'month') {
      this.selectMonth(t.jMonth());
    } else {
      this.selectDay(t);
    }
  }

  clear(): void {
    this.valueChange.emit('');
    this.open.set(false);
  }

  isSelectedDay(date: moment.Moment | null): boolean {
    if (!date) return false;
    const m = parseJalali(this.value(), 'date');
    if (!m) return false;
    return (
      date.jYear() === m.jYear() &&
      date.jMonth() === m.jMonth() &&
      date.jDate() === m.jDate()
    );
  }

  isToday(date: moment.Moment | null): boolean {
    if (!date) return false;
    const t = todayJalali('date');
    return date.jYear() === t.jYear() && date.jMonth() === t.jMonth() && date.jDate() === t.jDate();
  }
}
