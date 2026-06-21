import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LANGUAGE_LEVEL_LABELS, LANGUAGE_OPTIONS } from '@app/core/constants/resume.constants';
import { Language } from '@app/core/types/resume.types';
import { createEmptyLanguage } from '@app/core/utils/resume.factories';
import { EditorAddButton } from '@app/shared/components/editor-add-button/editor-add-button';
import { EditorFormActions } from '@app/shared/components/editor-form-actions/editor-form-actions';
import { EditorItemActions } from '@app/shared/components/editor-item-actions/editor-item-actions';
import { FormField } from '@app/shared/components/form-field/form-field';
import { FormInput } from '@app/shared/components/form-input/form-input';
import { FormSelect, SelectOption } from '@app/shared/components/form-select/form-select';
import { OrderButtons } from '@app/shared/components/order-buttons/order-buttons';
import { ResumeIcon } from '@app/shared/components/resume-icon/resume-icon';

import { SegmentedControl, SegmentOption } from "@app/shared/components/segmented-control/segmented-control";
import { moveItemInList } from '@app/shared/utils/array-order.util';
import { ListEditController } from '@app/shared/utils/list-edit.controller';



@Component({
  selector: 'app-languages-form',
  imports: [
    FormsModule,
    FormField,
    FormInput,
    FormSelect,
    ResumeIcon,
    OrderButtons,
    EditorItemActions,
    EditorFormActions,
    EditorAddButton,
    SegmentedControl
  ],
  templateUrl: './languages-form.html',
  styleUrl: './languages-form.css'
})
export class LanguagesForm {
  languages = input<Language[]>([]);
  languagesChanged = output<Language[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  private readonly editCtrl = new ListEditController<Language>(
    () => this.languages(),
    items => this.languagesChanged.emit(items),
    () => this.editingId(),
    id => this.editModeChanged.emit(id),
    createEmptyLanguage
  );

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

  levelOptions: SegmentOption<number>[] = [
    { value: 1, label: '۱', description: 'مبتدی' },
    { value: 2, label: '۲', description: 'متوسط' },
    { value: 3, label: '۳', description: 'خوب' },
    { value: 4, label: '۴', description: 'عالی' },
    { value: 5, label: '۵', description: 'مادری' }
  ];

  addEntry = (): void => { this.editCtrl.add(); };
  removeEntry = (id: string): void => { this.editCtrl.remove(id); };
  startEditing = (id: string): void => { this.editCtrl.startEditing(id); };
  saveEditing = (id: string): void => { this.editCtrl.completeSave(id); };
  cancelEditing = (id: string): void => { this.editCtrl.cancel(id); };
  isEditing = (id: string): boolean => this.editCtrl.isEditing(id);

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

  moveEntry(id: string, direction: 'up' | 'down'): void {
    const next = moveItemInList(this.languages(), id, direction);
    if (next) this.languagesChanged.emit(next);
  }
}