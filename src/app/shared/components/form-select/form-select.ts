import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-form-select',
  imports: [CommonModule],
  templateUrl: './form-select.html',
})
export class FormSelect<T extends string = string> {
  selectId = input<string>('');
  fieldId = input<string>('');
  placeholder = input<string>('انتخاب کنید...');
  options = input.required<SelectOption<T>[]>();
  value = input<T | ''>('');
  disabled = input(false);
  error = input<string>('');
  valueChange = output<T | ''>();
  blurred = output<void>();

  onChange(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value as T | '');
  }
}
