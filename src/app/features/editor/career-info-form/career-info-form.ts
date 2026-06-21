import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CareerInfo } from '@app/core/types/resume.types';
import { FormField } from '@app/shared/components/form-field/form-field';
import { FormInput } from '@app/shared/components/form-input/form-input';
import { normalizeSalary } from '@app/shared/utils/salary.formatter';
import { requiredError } from '@app/shared/validators/field.validators';



type FieldErrors = Partial<Record<keyof CareerInfo, string>>;

@Component({
  selector: 'app-career-info-form',
  imports: [FormsModule, FormField, FormInput],
  templateUrl: './career-info-form.html',
  styleUrl: './career-info-form.css'
})
export class CareerInfoForm {
  careerInfo = input.required<CareerInfo>();
  careerInfoChanged = output<CareerInfo>();

  fieldErrors = signal<FieldErrors>({});

  update(field: keyof CareerInfo, value: string): void {
    const normalizedValue =
      field === 'expectedSalary' ? normalizeSalary(value) : value;

    this.careerInfoChanged.emit({
      ...this.careerInfo(),
      [field]: normalizedValue
    });

    this.validateField(field, normalizedValue);
  }

  fieldError(field: keyof CareerInfo): string {
    return this.fieldErrors()[field] ?? '';
  }

  private validateField(field: keyof CareerInfo, value: string): void {
    const label =
      field === 'expectedSalary' ? 'حقوق مورد انتظار' : 'مدت سابقه کاری';

    const error = requiredError(value, label);

    this.fieldErrors.update(e => ({ ...e, [field]: error }));
  }
}