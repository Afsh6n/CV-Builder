import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { FormSelect, SelectOption } from '../../../shared/components/form-select/form-select';
import { ResumeIcon } from '../../../shared/components/resume-icon/resume-icon';
import { OrderButtons } from '../../../shared/components/order-buttons/order-buttons';
import { Language } from '../../../core/types/resume.types';
import { LANGUAGE_LEVEL_LABELS, LANGUAGE_OPTIONS } from '../../../core/constants/resume.constants';
import { createEmptyLanguage } from '../../../core/utils/resume.factories';

@Component({
  selector: 'app-languages-form',
  imports: [CommonModule, FormsModule, FormField, FormInput, FormSelect, ResumeIcon, OrderButtons],
  templateUrl: './languages-form.html',
  styleUrl: './languages-form.css'
})
export class LanguagesForm {
  languages = input<Language[]>([]);
  languagesChanged = output<Language[]>();
  moveRequested = output<{ id: string; direction: 'up' | 'down' }>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  levelLabels = LANGUAGE_LEVEL_LABELS;
  languageOptions = LANGUAGE_OPTIONS;
  languageSelectOptions: SelectOption[] = [
    ...LANGUAGE_OPTIONS.map(o => ({ value: o, label: o })),
    { value: '__custom__', label: 'سایر (نام دلخواه)' }
  ];
  displayTypeOptions: SelectOption<'graphic' | 'text'>[] = [
    { value: 'graphic', label: 'گرافیکی (نقطه‌ای)' },
    { value: 'text', label: 'متنی' }
  ];
  levels = [1, 2, 3, 4, 5] as const;

  addEntry(): void {
    const entry = createEmptyLanguage();
    this.languagesChanged.emit([...this.languages(), entry]);
    this.editModeChanged.emit(entry.id);
  }

  removeEntry(id: string): void {
    this.languagesChanged.emit(this.languages().filter(l => l.id !== id));
    if (this.editingId() === id) this.editModeChanged.emit(null);
  }

  updateEntry(id: string, field: keyof Language, value: unknown): void {
    const updated = this.languages().map(l => (l.id === id ? { ...l, [field]: value } : l));
    this.languagesChanged.emit(updated);
  }

  onLanguageSelect(id: string, value: string): void {
    if (value === '__custom__') {
      this.updateEntry(id, 'name', '');
      return;
    }
    this.updateEntry(id, 'name', value);
  }

  isCustomLanguage(name: string): boolean {
    return !!name && !this.languageOptions.includes(name);
  }

  moveUp(id: string): void { this.moveRequested.emit({ id, direction: 'up' }); }
  moveDown(id: string): void { this.moveRequested.emit({ id, direction: 'down' }); }

  startEditing(id: string): void { this.editModeChanged.emit(id); }
  stopEditing(): void { this.editModeChanged.emit(null); }
  isEditing(id: string): boolean { return this.editingId() === id; }
}
