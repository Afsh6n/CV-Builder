import { Component, input, output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { PersianDateInput } from '../persian-date-input/persian-date-input';
import { OrderButtons } from '../../../shared/components/order-buttons/order-buttons';
import { ResumeIcon } from '../../../shared/components/resume-icon/resume-icon';
import { SuggestionService } from '../../../core/services/suggestion.service';
import { moveItemInList } from '../../../shared/utils/array-order.util';
import { requiredError, jalaliDateError } from '../../../shared/validators/field.validators';
import { WorkExperience } from '../../../core/types/resume.types';
import { createEmptyWorkExperience } from '../../../core/utils/resume.factories';

type FieldErrors = Partial<Record<keyof WorkExperience, string>>;

@Component({
  selector: 'app-work-experience-form',
  imports: [
    CommonModule,
    FormField,
    FormInput,
    PersianDateInput,
    OrderButtons,
    ResumeIcon
  ],
  templateUrl: './work-experience-form.html',
  styleUrl: './work-experience-form.css'
})
export class WorkExperienceForm {
  private suggestionService = inject(SuggestionService);

  workExperience = input<WorkExperience[]>([]);
  workExperienceChanged = output<WorkExperience[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  fieldErrors = signal<Record<string, FieldErrors>>({});

  positionSuggestions = computed(() => this.suggestionService.getSuggestions('position'));
  companySuggestions = computed(() => this.suggestionService.getSuggestions('company'));
  countrySuggestions = computed(() => this.suggestionService.getSuggestions('country'));
  provinceSuggestions = computed(() => this.suggestionService.getSuggestions('province'));
  citySuggestions = computed(() => this.suggestionService.getSuggestions('city'));

  addEntry(): void {
    const newEntry = createEmptyWorkExperience();
    this.workExperienceChanged.emit([...this.workExperience(), newEntry]);
    this.editModeChanged.emit(newEntry.id);
  }

  removeEntry(id: string): void {
    this.workExperienceChanged.emit(this.workExperience().filter(exp => exp.id !== id));
    this.clearErrors(id);
    if (this.editingId() === id) this.editModeChanged.emit(null);
  }

  updateEntry(id: string, field: keyof WorkExperience, value: unknown): void {
    const updated = this.workExperience().map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    this.workExperienceChanged.emit(updated);
    this.clearFieldError(id, field);
  }

  saveSuggestions(id: string): void {
    const exp = this.workExperience().find(e => e.id === id);
    if (!exp) return;

    if (exp.position) this.suggestionService.addSuggestion('position', exp.position);
    if (exp.company) this.suggestionService.addSuggestion('company', exp.company);
    if (exp.country) this.suggestionService.addSuggestion('country', exp.country);
    if (exp.province) this.suggestionService.addSuggestion('province', exp.province);
    if (exp.city) this.suggestionService.addSuggestion('city', exp.city);
  }

  toggleCurrent(id: string): void {
    const updated = this.workExperience().map(exp =>
      exp.id === id ? { ...exp, current: !exp.current, endDate: '' } : exp
    );
    this.workExperienceChanged.emit(updated);
  }

  moveEntry(id: string, direction: 'up' | 'down'): void {
    const next = moveItemInList(this.workExperience(), id, direction);
    if (next) this.workExperienceChanged.emit(next);
  }

  errorsFor(id: string): FieldErrors {
    return this.fieldErrors()[id] ?? {};
  }

  fieldError(id: string, field: keyof WorkExperience): string {
    return this.errorsFor(id)[field] ?? '';
  }

  startEditing(id: string): void {
    this.editModeChanged.emit(id);
  }

  stopEditing(id: string): void {
    const exp = this.workExperience().find(e => e.id === id);
    if (exp && !this.validateEntry(exp)) return;
    this.saveSuggestions(id);
    this.clearErrors(id);
    this.editModeChanged.emit(null);
  }

  isEditing(id: string): boolean {
    return this.editingId() === id;
  }

  private validateEntry(exp: WorkExperience): boolean {
    const errors: FieldErrors = {
      position: requiredError(exp.position, 'سمت شغلی'),
      company: requiredError(exp.company, 'محل کار'),
      startDate:
        requiredError(exp.startDate, 'تاریخ شروع') ||
        jalaliDateError(exp.startDate, 'month'),
      endDate: exp.current
        ? ''
        : jalaliDateError(exp.endDate, 'month')
    };
    const hasError = Object.values(errors).some(Boolean);
    if (hasError) {
      this.fieldErrors.update(m => ({ ...m, [exp.id]: errors }));
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

  private clearFieldError(id: string, field: keyof WorkExperience): void {
    this.fieldErrors.update(m => {
      const entry = m[id];
      if (!entry?.[field]) return m;
      const nextEntry = { ...entry };
      delete nextEntry[field];
      return { ...m, [id]: nextEntry };
    });
  }
}
