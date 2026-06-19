import { CommonModule } from '@angular/common';
import { Component, signal, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AlertService } from '../../core/services/alert.service';
import { ResumeService } from '../../core/services/resume.service';
import { PersonalInfo, WorkExperience, Education, Skill, SkillCategory, SkillLevel } from '../../core/types/resume.types';
import { createEmptyPersonalInfo, createEmptyWorkExperience, createEmptyEducation, createEmptySkill } from '../../core/utils/resume.factories';
import { AiResumeService, ExtractedResumeData, ExtractedWorkExperience, ExtractedEducation, ExtractedSkill, AiConfig } from '@app/core/services/ai-resume.service';
import { ResumeIcon } from "@app/shared/components/resume-icon/resume-icon";

@Component({
  selector: 'app-initial-input',
  imports: [CommonModule, FormsModule, ResumeIcon],
  templateUrl: './initial-input.html',
  styleUrl: './initial-input.css'
})
export class InitialInput implements OnInit {
  private aiResumeService = inject(AiResumeService);
  private alertService = inject(AlertService);
  private resumeService = inject(ResumeService);

  @Output() onComplete = new EventEmitter<void>();

  config = signal<AiConfig>({
    apiKey: '',
    endpoint: '/v1',
    model: ''
  });

  availableModels = signal<string[]>([]);
  isLoadingModels = signal<boolean>(false);

  rawInput = signal<string>('');
  isProcessing = signal<boolean>(false);
  extractedData = signal<ExtractedResumeData | null>(null);

  readonly minCharacterLength = 50;

  ngOnInit() {
    this.config.set({
      apiKey: localStorage.getItem('freellmapi_key') || '',
      endpoint: localStorage.getItem('freellmapi_endpoint') || 'v1',
      model: localStorage.getItem('freellmapi_model') || ''
    });
  }

  updateConfig(key: keyof AiConfig, value: string) {
    const cleanValue = value.trim();
    this.config.update(curr => ({ ...curr, [key]: cleanValue }));
    localStorage.setItem(`freellmapi_${key}`, cleanValue);
  }

  async fetchModels() {
    const currentConfig = this.config();
    if (!currentConfig.apiKey || !currentConfig.endpoint) {
       await this.alertService.error('لطفاً ابتدا آدرس سرور و کلید اتصال را وارد کنید.');
       return;
    }

    this.isLoadingModels.set(true);
    try {
      const models = await this.aiResumeService.fetchAvailableModels(currentConfig);
      this.availableModels.set(models);
      
      if (models.length > 0 && !models.includes(currentConfig.model)) {
        this.updateConfig('model', models[0]);
      }
      
      await this.alertService.success('لیست مدل‌ها با موفقیت دریافت شد.');
    } catch (error) {
       await this.alertService.error(error instanceof Error ? error.message : 'خطا در دریافت مدل‌ها');
    } finally {
      this.isLoadingModels.set(false);
    }
  }

  async processWithAi(): Promise<void> {
    const text = this.rawInput().trim();
    const currentConfig = this.config();

    if (!currentConfig.apiKey || !currentConfig.endpoint || !currentConfig.model) {
      await this.alertService.error('لطفاً تنظیمات سرور هوش مصنوعی (آدرس، کلید و انتخاب مدل) را کامل کنید.');
      return;
    }

    if (text.length < this.minCharacterLength) {
      await this.alertService.error(`لطفاً حداقل ${this.minCharacterLength} کاراکتر اطلاعات درباره خودتان وارد کنید تا هوش مصنوعی بتواند رزومه را بسازد.`);
      return;
    }

    this.isProcessing.set(true);

    try {
      const parsedData = await this.aiResumeService.extractResumeData(text, currentConfig);
      this.extractedData.set(parsedData);
      
      await this.applyToForm();
      await this.alertService.success('اطلاعات با موفقیت استخراج و اعمال شد!');
    } catch (error) {
      console.error('AI processing error:', error);
      await this.alertService.error('خطا در پردازش اطلاعات: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
    } finally {
      this.isProcessing.set(false);
    }
  }

  async applyToForm(): Promise<void> {
    const data = this.extractedData();
    if (!data) return;

    try {
      if (data.personalInfo) {
        const personalInfo: PersonalInfo = {
          ...createEmptyPersonalInfo(),
          ...data.personalInfo
        };
        this.resumeService.updatePersonalInfo(personalInfo);
      }

      if (data.workExperience && Array.isArray(data.workExperience)) {
        const workExp: WorkExperience[] = data.workExperience.map((exp: ExtractedWorkExperience) => ({
          ...createEmptyWorkExperience(),
          ...exp
        }));
        this.resumeService.setWorkExperience(workExp);
      }

      if (data.education && Array.isArray(data.education)) {
        const edu: Education[] = data.education.map((ed: ExtractedEducation) => ({
          ...createEmptyEducation(),
          ...ed
        }));
        this.resumeService.setEducation(edu);
      }

      if (data.skills && Array.isArray(data.skills)) {
        const skills: Skill[] = data.skills.map((sk: ExtractedSkill) => {
          const category: SkillCategory = sk.category === 'soft' ? 'soft' : 'technical';
          const level: SkillLevel = (sk.level >= 1 && sk.level <= 5) ? (Math.round(sk.level) as SkillLevel) : 3;

          return {
            ...createEmptySkill(category),
            name: sk.name || '',
            category,
            level
          };
        });
        this.resumeService.setSkills(skills);
      }

      if (data.summary) {
        this.resumeService.updateSummary(data.summary);
      }

      this.rawInput.set('');
      this.onComplete.emit();
    } catch (error) {
      console.error('Error applying to form:', error);
      throw error;
    }
  }

  reset(): void {
    this.rawInput.set('');
    this.extractedData.set(null);
  }
}