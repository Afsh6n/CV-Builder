import { CommonModule } from '@angular/common';
import { Component, signal, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiResumeService } from '@app/core/services/ai-resume.service';
import { AlertService } from '@app/core/services/alert.service';
import { ResumeService } from '@app/core/services/resume.service';
import { AiConfig, ExtractedCertificate, ExtractedEducation, ExtractedLanguage, ExtractedProject, ExtractedResumeData, ExtractedSkill, ExtractedWorkExperience } from '@app/core/types/ai-resume.types';
import { CareerInfo, Certificate, Education, Language, LanguageDisplayType, PersonalInfo, Project, Skill, SkillCategory, SkillLevel, WorkExperience } from '@app/core/types/resume.types';
import { createEmptyCareerInfo, createEmptyCertificate, createEmptyEducation, createEmptyLanguage, createEmptyPersonalInfo, createEmptyProject, createEmptySkill, createEmptyWorkExperience } from '@app/core/utils/resume.factories';
import { ResumeIcon } from '@app/shared/components/resume-icon/resume-icon';


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

  ngOnInit(): void {
    this.config.set({
      apiKey: localStorage.getItem('freellmapi_key') || '',
      endpoint: localStorage.getItem('freellmapi_endpoint') || '/v1',
      model: localStorage.getItem('freellmapi_model') || ''
    });
  }

  updateConfig(key: keyof AiConfig, value: string): void {
    const cleanValue = value.trim();
    this.config.update(curr => ({ ...curr, [key]: cleanValue }));
    localStorage.setItem(`freellmapi_${key}`, cleanValue);
  }

  async fetchModels(): Promise<void> {
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
    const rawData = this.extractedData();
    if (!rawData) return;

    try {
      const personalInfo: PersonalInfo = {
        ...createEmptyPersonalInfo(),
        firstName: rawData.personalInfo?.firstName || '',
        lastName: rawData.personalInfo?.lastName || '',
        title: rawData.personalInfo?.title || '',
        email: rawData.personalInfo?.email || '',
        mobile: rawData.personalInfo?.mobile || '',
        phone: rawData.personalInfo?.phone || '',
        maritalStatus: rawData.personalInfo?.maritalStatus || '',
        militaryStatus: rawData.personalInfo?.militaryStatus || '',
        birthDate: rawData.personalInfo?.birthDate || '',
        city: rawData.personalInfo?.city || '',
        province: rawData.personalInfo?.province || '',
        country: rawData.personalInfo?.country || '',
        linkedin: rawData.personalInfo?.linkedin || '',
        website: rawData.personalInfo?.website || ''
      };
      this.resumeService.updatePersonalInfo(personalInfo);

      if (rawData.careerInfo) {
        const careerInfo: CareerInfo = {
          ...createEmptyCareerInfo(),
          expectedSalary: rawData.careerInfo.expectedSalary || '',
          totalExperience: rawData.careerInfo.totalExperience || ''
        };
        this.resumeService.updateCareerInfo(careerInfo);
      }

      const finalWorkExp: WorkExperience[] = (rawData.workExperience || []).map((exp: ExtractedWorkExperience) => ({
        ...createEmptyWorkExperience(),
        position: exp.position || '',
        company: exp.company || '',
        city: exp.city || '',
        province: exp.province || '',
        country: exp.country || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: typeof exp.current === 'boolean' ? exp.current : false,
        description: exp.description || ''
      }));
      if (finalWorkExp.length > 0) {
        this.resumeService.setWorkExperience(finalWorkExp);
      }

      const finalEducation: Education[] = (rawData.education || []).map((edu: ExtractedEducation) => ({
        ...createEmptyEducation(),
        degree: edu.degree || '',
        field: edu.field || '',
        institution: edu.institution || '',
        city: edu.city || '',
        province: edu.province || '',
        country: edu.country || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        currentlyStudying: typeof edu.currentlyStudying === 'boolean' ? edu.currentlyStudying : false
      }));
      if (finalEducation.length > 0) {
        this.resumeService.setEducation(finalEducation);
      }

      const finalSkills: Skill[] = (rawData.skills || []).map((skill: ExtractedSkill) => {
        const category: SkillCategory = skill.category === 'soft' ? 'soft' : 'technical';
        const level: SkillLevel = (skill.level >= 1 && skill.level <= 5) ? (Math.round(skill.level) as SkillLevel) : 3;
        return {
          ...createEmptySkill(category),
          name: skill.name || '',
          category,
          level
        };
      });
      if (finalSkills.length > 0) {
        this.resumeService.setSkills(finalSkills);
      }

      const finalLanguages: Language[] = (rawData.languages || []).map((lang: ExtractedLanguage) => {
        const level: SkillLevel = (lang.level >= 1 && lang.level <= 5) ? (Math.round(lang.level) as SkillLevel) : 3;
        const displayType: LanguageDisplayType = lang.displayType === 'text' ? 'text' : 'graphic';
        return {
          ...createEmptyLanguage(),
          name: lang.name || '',
          level,
          displayType
        };
      });
      if (finalLanguages.length > 0) {
        this.resumeService.setLanguages(finalLanguages);
      }

      const finalProjects: Project[] = (rawData.projects || []).map((proj: ExtractedProject) => ({
        ...createEmptyProject(),
        title: proj.title || '',
        employer: proj.employer || '',
        link: proj.link || '',
        date: proj.date || '',
        description: proj.description || ''
      }));
      if (finalProjects.length > 0) {
        this.resumeService.setProjects(finalProjects);
      }

      const finalCertificates: Certificate[] = (rawData.certificates || []).map((cert: ExtractedCertificate) => ({
        ...createEmptyCertificate(),
        title: cert.title || '',
        issuer: cert.issuer || '',
        validFrom: cert.validFrom || '',
        validTo: cert.validTo || '',
        current: typeof cert.current === 'boolean' ? cert.current : true,
        link: cert.link || ''
      }));
      if (finalCertificates.length > 0) {
        this.resumeService.setCertificates(finalCertificates);
      }

      if (rawData.summary) {
        this.resumeService.updateSummary(rawData.summary);
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