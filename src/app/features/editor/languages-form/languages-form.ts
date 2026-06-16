import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { FormSelect, SelectOption } from '../../../shared/components/form-select/form-select';
import { ResumeIcon } from '../../../shared/components/resume-icon/resume-icon';
import { OrderButtons } from '../../../shared/components/order-buttons/order-buttons';
import { EditorItemActions } from '../../../shared/components/editor-item-actions/editor-item-actions';
import { EditorFormActions } from '../../../shared/components/editor-form-actions/editor-form-actions';
import { EditorAddButton } from '../../../shared/components/editor-add-button/editor-add-button';
import { moveItemInList } from '../../../shared/utils/array-order.util';
import { ListEditController } from '../../../shared/utils/list-edit.controller';
import { Language } from '../../../core/types/resume.types';
import { LANGUAGE_LEVEL_LABELS, LANGUAGE_OPTIONS } from '../../../core/constants/resume.constants';
import { createEmptyLanguage } from '../../../core/utils/resume.factories';

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
    EditorAddButton
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
  levels = [1, 2, 3, 4, 5] as const;

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
