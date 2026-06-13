import { Component, input, output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { FormSelect, SelectOption } from '../../../shared/components/form-select/form-select';
import { PersianDateInput } from '../persian-date-input/persian-date-input';
import { OrderButtons } from '../../../shared/components/order-buttons/order-buttons';
import { ResumeIcon } from '../../../shared/components/resume-icon/resume-icon';
import { SuggestionService } from '../../../core/services/suggestion.service';
import { moveItemInList } from '../../../shared/utils/array-order.util';
import { requiredError, jalaliDateError } from '../../../shared/validators/field.validators';
import { Education } from '../../../core/types/resume.types';
import { DEGREE_OPTIONS } from '../../../core/constants/resume.constants';
import { createEmptyEducation } from '../../../core/utils/resume.factories';

type FieldErrors = Partial<Record<keyof Education, string>>;

@Component({
  selector: 'app-education-form',
  imports: [
    CommonModule,
    FormField,
    FormInput,
    FormSelect,
    PersianDateInput,
    OrderButtons,
    ResumeIcon
  ],
  templateUrl: './education-form.html',
  styleUrl: './education-form.css'
})
export class EducationForm {
  private suggestionService = inject(SuggestionService);

  education = input<Education[]>([]);
  educationChanged = output<Education[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  degreeOptions = DEGREE_OPTIONS;
  degreeSelectOptions: SelectOption[] = DEGREE_OPTIONS.map(d => ({ value: d, label: d }));
  fieldErrors = signal<Record<string, FieldErrors>>({});

  institutionSuggestions = computed(() => this.suggestionService.getSuggestions('institution'));
  fieldSuggestions = computed(() => this.suggestionService.getSuggestions('field'));
  specializationSuggestions = computed(() => this.suggestionService.getSuggestions('specialization'));
  countrySuggestions = computed(() => this.suggestionService.getSuggestions('country'));
  provinceSuggestions = computed(() => this.suggestionService.getSuggestions('province'));
  citySuggestions = computed(() => this.suggestionService.getSuggestions('city'));

  addEntry(): void {
    const newEntry = createEmptyEducation();
    this.educationChanged.emit([...this.education(), newEntry]);
    this.editModeChanged.emit(newEntry.id);
  }

  removeEntry(id: string): void {
    this.educationChanged.emit(this.education().filter(edu => edu.id !== id));
    this.clearErrors(id);
    if (this.editingId() === id) this.editModeChanged.emit(null);
  }

  updateEntry(id: string, field: keyof Education, value: unknown): void {
    const updated = this.education().map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    this.educationChanged.emit(updated);
  }

  saveSuggestions(id: string): void {
    const edu = this.education().find(e => e.id === id);
    if (!edu) return;

    if (edu.institution) this.suggestionService.addSuggestion('institution', edu.institution);
    if (edu.field) this.suggestionService.addSuggestion('field', edu.field);
    if (edu.specialization) this.suggestionService.addSuggestion('specialization', edu.specialization);
    if (edu.country) this.suggestionService.addSuggestion('country', edu.country);
    if (edu.province) this.suggestionService.addSuggestion('province', edu.province);
    if (edu.city) this.suggestionService.addSuggestion('city', edu.city);
  }

  moveEntry(id: string, direction: 'up' | 'down'): void {
    const next = moveItemInList(this.education(), id, direction);
    if (next) this.educationChanged.emit(next);
  }

  toggleStudying(id: string): void {
    const updated = this.education().map(edu =>
      edu.id === id ? { ...edu, currentlyStudying: !edu.currentlyStudying, endDate: '' } : edu
    );
    this.educationChanged.emit(updated);
  }

  errorsFor(id: string): FieldErrors {
    return this.fieldErrors()[id] ?? {};
  }

  fieldError(id: string, field: keyof Education): string {
    return this.errorsFor(id)[field] ?? '';
  }

  startEditing(id: string): void {
    this.editModeChanged.emit(id);
  }

  stopEditing(id: string): void {
    const edu = this.education().find(e => e.id === id);
    if (edu && !this.validateEntry(edu)) return;
    this.saveSuggestions(id);
    this.clearErrors(id);
    this.editModeChanged.emit(null);
  }

  isEditing(id: string): boolean {
    return this.editingId() === id;
  }

  private validateEntry(edu: Education): boolean {
    const errors: FieldErrors = {
      institution: requiredError(edu.institution, 'نام مؤسسه'),
      field: requiredError(edu.field, 'رشته'),
      degree: requiredError(edu.degree, 'مقطع'),
      startDate:
        requiredError(edu.startDate, 'تاریخ شروع') ||
        jalaliDateError(edu.startDate, 'month'),
      endDate: edu.currentlyStudying
        ? ''
        : jalaliDateError(edu.endDate, 'month')
    };
    if (Object.values(errors).some(Boolean)) {
      this.fieldErrors.update(m => ({ ...m, [edu.id]: errors }));
      return false;
    }
    return true;
  }

  private clearErrors(id: string): void {
    this.fieldErrors.update(m => {
      const next = { ...m };
      delete next[id];
      return next;
    });
  }
}
