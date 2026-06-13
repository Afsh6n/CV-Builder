import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { requiredError } from '../../../shared/validators/field.validators';
import { CareerInfo } from '../../../core/types/resume.types';

type FieldErrors = Partial<Record<keyof CareerInfo, string>>;

@Component({
  selector: 'app-career-info-form',
  imports: [FormsModule, FormField, FormInput],
  templateUrl: './career-info-form.html',
  styleUrl: './career-info-form.css'
})
export class CareerInfoForm {
  careerInfo = input<CareerInfo>({ expectedSalary: '', totalExperience: '' });
  careerInfoChanged = output<CareerInfo>();

  fieldErrors = signal<FieldErrors>({});

  update(field: keyof CareerInfo, value: string): void {
    const updatedInfo = { ...this.careerInfo(), [field]: value };
    this.careerInfoChanged.emit(updatedInfo);
    this.validateField(field, value);
  }

  fieldError(field: keyof CareerInfo): string {
    return this.fieldErrors()[field] ?? '';
  }

  private validateField(field: keyof CareerInfo, value: string): void {
    let error = '';
    if (field === 'expectedSalary' || field === 'totalExperience') {
      error = requiredError(value, field === 'expectedSalary' ? 'حقوق مورد انتظار' : 'مدت سابقه کاری');
    }
    this.fieldErrors.update(errors => ({ ...errors, [field]: error }));
  }
}
