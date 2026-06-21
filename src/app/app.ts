import { CommonModule } from '@angular/common';
import { Component, signal, computed, inject, ElementRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PhotoUploader } from './features/editor/photo-uploader/photo-uploader';
import { PersonalDetailsForm } from './features/editor/personal-details-form/personal-details-form';
import { WorkExperienceForm } from './features/editor/work-experience-form/work-experience-form';
import { EducationForm } from './features/editor/education-form/education-form';
import { SkillsForm } from './features/editor/skills-form/skills-form';
import { LanguagesForm } from './features/editor/languages-form/languages-form';
import { ProjectsForm } from './features/editor/projects-form/projects-form';
import { SocialMediaForm } from './features/editor/social-media-form/social-media-form';
import { CertificatesForm } from './features/editor/certificates-form/certificates-form';
import { CareerInfoForm } from './features/editor/career-info-form/career-info-form';
import { CustomSectionForm } from './features/custom-section/custom-section-form';
import { ResumeSettingsPanel } from './features/editor/resume-settings-panel/resume-settings-panel';
import { ResumePreview } from './features/resume-preview/resume-preview';
import { AppFooter } from './layout/app-footer/app-footer';
import { AppHeader } from './layout/app-header/app-header';
import { Alert } from './shared/components/alert/alert';
import { InitialInput } from './features/initial-input/initial-input';
import { ResumeIcon } from './shared/components/resume-icon/resume-icon';
import { ResumeService } from './core/services/resume.service';
import { ExportService } from './core/services/export.service';
import { FontLoaderService } from './core/services/font-loader.service';
import { AlertService } from './core/services/alert.service';
import { countFilledFields, isEnoughDataForPreview } from './core/utils/resume.utils';
import { CareerInfo, Certificate, CustomSection, Education, Language, PersonalInfo, Project, ResumeSettings, Skill, SocialMedia, WorkExperience } from './core/types/resume.types';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    PhotoUploader,
    PersonalDetailsForm,
    WorkExperienceForm,
    EducationForm,
    SkillsForm,
    LanguagesForm,
    ProjectsForm,
    SocialMediaForm,
    CertificatesForm,
    CareerInfoForm,
    CustomSectionForm,
    ResumeSettingsPanel,
    ResumePreview,
    AppFooter,
    AppHeader,
    Alert,
    InitialInput,
    ResumeIcon
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private resumeService = inject(ResumeService);
  private exportService = inject(ExportService);
  private fontLoader = inject(FontLoaderService);
  private alertService = inject(AlertService);

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  resume = computed(() => this.resumeService.getResume());
  previewResume = computed(() => this.resume());

  filledFieldsCount = computed(() => countFilledFields(this.resume()));
  isEnoughDataFilled = computed(() => isEnoughDataForPreview(this.resume()));

  editingSection = signal<string | null>(null);
  isGeneratingPdf = signal<boolean>(false);
  showPdfDialog = signal<boolean>(false);
  pdfFilename = signal<string>('');
  summary = signal<string>('');
  showInitialInput = signal<boolean>(true);

  constructor() {
    this.summary.set(this.resume().summary);
  }

  onPersonalInfoChanged(personalInfo: PersonalInfo): void {
    this.resumeService.updatePersonalInfo(personalInfo);
  }

  onSummaryChanged(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.summary.set(value);
    this.resumeService.updateSummary(value);
  }

  onSettingsChanged(settings: ResumeSettings): void {
    this.resumeService.updateSettings(settings);
  }

  onCareerInfoChanged(careerInfo: CareerInfo): void {
    this.resumeService.updateCareerInfo(careerInfo);
  }

  onWorkExperienceChanged(workExperience: WorkExperience[]): void {
    this.resumeService.setWorkExperience(workExperience);
  }

  onEducationChanged(education: Education[]): void {
    this.resumeService.setEducation(education);
  }

  onSkillsChanged(skills: Skill[]): void {
    this.resumeService.setSkills(skills);
  }

  onLanguagesChanged(languages: Language[]): void {
    this.resumeService.setLanguages(languages);
  }

  onProjectsChanged(projects: Project[]): void {
    this.resumeService.setProjects(projects);
  }

  onSocialMediaChanged(socialMedia: SocialMedia[]): void {
    this.resumeService.setSocialMedia(socialMedia);
  }

  onCertificatesChanged(certificates: Certificate[]): void {
    this.resumeService.setCertificates(certificates);
  }

  onCustomSectionsChanged(sections: CustomSection[]): void {
    this.resumeService.setCustomSections(sections);
  }

  onPhotoChanged(photoData: string): void {
    this.resumeService.updateProfilePhoto(photoData);
  }

  onSectionToggle(section: string | null): void {
    if (!section) {
      this.editingSection.set(null);
      return;
    }
    if (this.editingSection() === section) {
      this.editingSection.set(null);
    } else {
      this.editingSection.set(section);
    }
  }

  suggestedPdfFilename(): string {
    const info = this.resume().personalInfo;
    const name = `${info.firstName || ''} ${info.lastName || ''}`.trim().replace(/\s+/g, '_');
    return name || 'resume';
  }

  openPdfDialog(): void {
    this.pdfFilename.set(this.suggestedPdfFilename());
    this.showPdfDialog.set(true);
  }

  closePdfDialog(): void {
    if (!this.isGeneratingPdf()) {
      this.showPdfDialog.set(false);
    }
  }

  async confirmPdfDownload(): Promise<void> {
    const el = document.getElementById('resume-preview');
    const currentResume = this.resume();

    if (!el) {
      await this.alertService.error('پیش‌نمایش رزومه یافت نشد.');
      return;
    }

    let name = this.pdfFilename().trim() || this.suggestedPdfFilename();
    const baseName = name.replace(/\.(pdf|png)$/i, '');

    this.isGeneratingPdf.set(true);
    try {
      const fontId = currentResume.settings.fontFamilyId;
      await this.fontLoader.ensureLoaded(fontId);
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 400));

      if (name.toLowerCase().endsWith('.png')) {
        await this.exportService.exportToImage(el, currentResume, `${baseName}.png`);
      } else {
        if (!name.toLowerCase().endsWith('.pdf')) name += '.pdf';
        await this.exportService.exportToPdf(el, currentResume, name);
      }

      this.showPdfDialog.set(false);
      await this.alertService.success(
        'فایل رزومه با موفقیت دانلود شد!',
        'دانلود موفق',
        false,
        'https://daramet.com/Afsh5n'
      );
    } catch (error) {
      console.error('Export failed:', error);
      const detail = error instanceof Error ? error.message : '';
      await this.alertService.error(`خطا در تولید فایل: ${detail}`);
    } finally {
      this.isGeneratingPdf.set(false);
    }
  }

  async resetResume(): Promise<void> {
    const ok = await this.alertService.confirm('آیا مطمئن هستید که می‌خواهید همه داده‌ها را پاک کنید؟');
    if (ok) {
      this.resumeService.resetResume();
      this.summary.set('');
      this.editingSection.set(null);
    }
  }

  showEditor(): void {
    this.summary.set(this.resume().summary);
    this.showInitialInput.set(false);
  }

  showInitialInputScreen(): void {
    this.showInitialInput.set(true);
  }
}
