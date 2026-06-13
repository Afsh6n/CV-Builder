import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input',
  imports: [CommonModule],
  templateUrl: './form-input.html',
  styleUrl: './form-input.css'
})
export class FormInput {
  inputId = input<string>('');
  fieldId = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  value = input<string>('');
  ltr = input(false);
  disabled = input(false);
  error = input<string>('');
  suggestions = input<string[]>([]);
  valueChange = output<string>();
  blurred = output<void>();

  datalistId = computed(() => `list-${this.inputId() || this.fieldId() || Math.random().toString(36).slice(2)}`);

  onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
