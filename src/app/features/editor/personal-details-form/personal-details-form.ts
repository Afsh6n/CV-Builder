import { CommonModule } from '@angular/common';
import { Component, input, output, effect, signal, computed, untracked, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MILITARY_OPTIONS } from '../../../core/constants/resume.constants';
import { SuggestionService } from '../../../core/services/suggestion.service';
import { MaritalStatus, PersonalInfo } from '../../../core/types/resume.types';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormSelect } from '../../../shared/components/form-select/form-select';
import { SegmentedControl, SegmentOption } from '../../../shared/components/segmented-control/segmented-control';
import {
  emailError,
  mobileError,
  phoneError,
  urlError,
  requiredError
} from '../../../shared/validators/field.validators';
import { PersianDateInput } from '../persian-date-input/persian-date-input';

type ModelFields = Pick<
  PersonalInfo,
  | 'firstName'
  | 'lastName'
  | 'title'
  | 'maritalStatus'
  | 'militaryStatus'
  | 'birthDate'
  | 'email'
  | 'mobile'
  | 'phone'
  | 'linkedin'
  | 'website'
  | 'country'
  | 'province'
  | 'city'
>;

@Component({
  selector: 'app-personal-details-form',
  imports: [
    CommonModule,
    FormsModule,
    FormField,
    PersianDateInput,
    SegmentedControl,
    FormSelect
  ],
  templateUrl: './personal-details-form.html',
  styleUrl: './personal-details-form.css'
})
export class PersonalDetailsForm {
  private suggestionService = inject(SuggestionService);

  personalInfo = input<PersonalInfo>({
    firstName: '',
    lastName: '',
    title: '',
    maritalStatus: '',
    militaryStatus: '',
    birthDate: '',
    email: '',
    mobile: '',
    phone: '',
    linkedin: '',
    website: '',
    country: '',
    province: '',
    city: '',
    profilePhoto: '',
    photoOffsetY: 50
  });

  personalInfoChanged = output<PersonalInfo>();

  maritalSegments: SegmentOption<MaritalStatus>[] = [
    { value: 'مجرد', label: 'مجرد' },
    { value: 'متأهل', label: 'متأهل' }
  ];

  militaryOptions = MILITARY_OPTIONS.map(o => ({ value: o, label: o }));

  touched = signal<Record<string, boolean>>({});

  model = signal<ModelFields>({
    firstName: '',
    lastName: '',
    title: '',
    maritalStatus: '',
    militaryStatus: '',
    birthDate: '',
    email: '',
    mobile: '',
    phone: '',
    linkedin: '',
    website: '',
    country: '',
    province: '',
    city: ''
  });

  errors = computed(() => {
    const m = this.model();
    const t = this.touched();
    const show = (key: string) => t[key];
    return {
      firstName: show('firstName') ? requiredError(m.firstName, 'نام') : '',
      lastName: show('lastName') ? requiredError(m.lastName, 'نام خانوادگی') : '',
      title: show('title') ? requiredError(m.title, 'عنوان شغلی') : '',
      email: show('email') && m.email?.trim() ? emailError(m.email) : '',
      mobile: show('mobile') && m.mobile?.trim() ? mobileError(m.mobile) : '',
      phone: show('phone') && m.phone?.trim() ? phoneError(m.phone) : '',
      linkedin: show('linkedin') && m.linkedin?.trim() ? urlError(m.linkedin) : '',
      website: show('website') && m.website?.trim() ? urlError(m.website) : ''
    };
  });

  titleSuggestions = computed(() => this.suggestionService.getSuggestions('personal_title'));
  countrySuggestions = computed(() => this.suggestionService.getSuggestions('country'));
  provinceSuggestions = computed(() => this.suggestionService.getSuggestions('province'));
  citySuggestions = computed(() => this.suggestionService.getSuggestions('city'));

  constructor() {
    effect(() => {
      const info = this.personalInfo();
      untracked(() => {
        const currentModel = this.model();
        const nextFields = this.extractFields(info);
        if (!this.fieldsEqual(currentModel, nextFields)) {
          this.model.set(nextFields);
        }
      });
    });
  }

  updateField(key: keyof ModelFields, value: string): void {
    this.model.update(m => ({ ...m, [key]: value }));
    this.emitChange();
  }

  onMaritalChange(value: MaritalStatus): void {
    this.model.update(m => ({ ...m, maritalStatus: value }));
    this.emitChange();
  }

  onMilitaryChange(value: string): void {
    this.model.update(m => ({ ...m, militaryStatus: value as PersonalInfo['militaryStatus'] }));
    this.emitChange();
  }

  onBirthDateChange(value: string): void {
    this.model.update(m => ({ ...m, birthDate: value }));
    this.emitChange();
  }

  private emitChange(): void {
    const m = this.model();
    const currentInfo = this.personalInfo();
    const nextInfo = this.mergeInfo(m, currentInfo);
    if (!this.personalInfoEquals(currentInfo, nextInfo)) {
      this.personalInfoChanged.emit(nextInfo);
    }
  }

  private extractFields(info: PersonalInfo): ModelFields {
    return {
      firstName: info.firstName || '',
      lastName: info.lastName || '',
      title: info.title || '',
      maritalStatus: info.maritalStatus || '',
      militaryStatus: info.militaryStatus || '',
      birthDate: info.birthDate || '',
      email: info.email || '',
      mobile: info.mobile || '',
      phone: info.phone || '',
      linkedin: info.linkedin || '',
      website: info.website || '',
      country: info.country || '',
      province: info.province || '',
      city: info.city || ''
    };
  }

  private mergeInfo(m: ModelFields, info: PersonalInfo): PersonalInfo {
    return {
      ...m,
      profilePhoto: info.profilePhoto,
      photoOffsetY: info.photoOffsetY
    };
  }

  private fieldsEqual(a: ModelFields, b: ModelFields): boolean {
    return (
      a.firstName === b.firstName &&
      a.lastName === b.lastName &&
      a.title === b.title &&
      a.maritalStatus === b.maritalStatus &&
      a.militaryStatus === b.militaryStatus &&
      a.birthDate === b.birthDate &&
      a.email === b.email &&
      a.mobile === b.mobile &&
      a.phone === b.phone &&
      a.linkedin === b.linkedin &&
      a.website === b.website &&
      a.country === b.country &&
      a.province === b.province &&
      a.city === b.city
    );
  }

  private personalInfoEquals(a: PersonalInfo, b: PersonalInfo): boolean {
    return (
      this.fieldsEqual(this.extractFields(a), this.extractFields(b)) &&
      a.profilePhoto === b.profilePhoto &&
      a.photoOffsetY === b.photoOffsetY
    );
  }

  touch(key: string): void {
    this.touched.update(t => ({ ...t, [key]: true }));
  }
}
