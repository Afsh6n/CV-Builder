import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SegmentOption<T extends string | number = string | number> {
  value: T;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-segmented-control',
  imports: [CommonModule],
  templateUrl: './segmented-control.html',
  styleUrl: './segmented-control.css'
})
export class SegmentedControl<T extends string | number = string | number> {
  options = input.required<SegmentOption<T>[]>();
  value = input.required<T>();
  ariaLabel = input<string>('انتخاب گزینه');
  wrap = input<boolean>(true);
  valueChange = output<T>();

  isSelected = (val: T): boolean => this.value() === val;

  select(val: T): void {
    this.valueChange.emit(val);
  }
}
