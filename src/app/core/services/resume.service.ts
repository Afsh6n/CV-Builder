import { Injectable, signal, computed, effect } from '@angular/core';
import { DEFAULT_FONT_ID, FONT_PRESETS, FontFamilyId } from '../constants/font.constants';
import { CareerInfo, Certificate, CustomSection, Education, Language, PersonalInfo, Project, Resume, ResumeSettings, Skill, SkillCategory, SkillLevel, SocialMedia, WorkExperience } from '../types/resume.types';
import { createEmptyCareerInfo, createEmptyCertificate, createEmptyEducation, createEmptyLanguage, createEmptyResume, createEmptySkill, createEmptyWorkExperience } from '../utils/resume.factories';
import { DEFAULT_DISPLAY, DEFAULT_SECTIONS, DEFAULT_SETTINGS } from '../constants/resume.constants';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private resumeSignal = signal<Resume>(createEmptyResume());

  personalInfo = computed(() => this.resumeSignal().personalInfo);
  summary = computed(() => this.resumeSignal().summary);
  workExperience = computed(() => this.resumeSignal().workExperience);
  education = computed(() => this.resumeSignal().education);
  skills = computed(() => this.resumeSignal().skills);
  languages = computed(() => this.resumeSignal().languages);
  projects = computed(() => this.resumeSignal().projects);
  socialMedia = computed(() => this.resumeSignal().socialMedia);
  certificates = computed(() => this.resumeSignal().certificates);
  customSections = computed(() => this.resumeSignal().customSections);
  careerInfo = computed(() => this.resumeSignal().careerInfo);
  settings = computed(() => this.resumeSignal().settings);

  constructor() {
    this.loadFromLocalStorage();
    effect(() => this.saveToLocalStorage(this.resumeSignal()));
  }

  getResume(): Resume {
    return this.resumeSignal();
  }

  setResume(resume: Resume): void {
    this.resumeSignal.set(resume);
  }

  updateCareerInfo(careerInfo: CareerInfo): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, careerInfo }));
  }

  updatePersonalInfo(personalInfo: PersonalInfo): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, personalInfo }));
  }

  updateSummary(summary: string): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, summary }));
  }

  updateSettings(settings: ResumeSettings): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, settings }));
  }

  setWorkExperience(workExperience: WorkExperience[]): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, workExperience }));
  }

  setEducation(education: Education[]): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, education }));
  }

  setSkills(skills: Skill[]): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, skills }));
  }

  setLanguages(languages: Language[]): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, languages }));
  }

  setProjects(projects: Project[]): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, projects }));
  }

  setSocialMedia(socialMedia: SocialMedia[]): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, socialMedia }));
  }

  setCertificates(certificates: Certificate[]): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, certificates }));
  }

  setCustomSections(customSections: CustomSection[]): void {
    this.resumeSignal.update(c => this.withTimestamp({ ...c, customSections }));
  }

  moveLanguage(id: string, direction: 'up' | 'down'): void {
    this.resumeSignal.update(current => {
      const list = [...current.languages];
      const index = list.findIndex(l => l.id === id);
      if (index === -1) return current;
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= list.length) return current;
      [list[index], list[newIndex]] = [list[newIndex], list[index]];
      return { ...current, languages: list };
    });
  }

  updateProfilePhoto(photoData: string): void {
    this.resumeSignal.update(c =>
      this.withTimestamp({
        ...c,
        personalInfo: { ...c.personalInfo, profilePhoto: photoData }
      })
    );
  }

  updatePhotoOffset(offsetY: number): void {
    this.resumeSignal.update(c =>
      this.withTimestamp({
        ...c,
        personalInfo: { ...c.personalInfo, photoOffsetY: offsetY }
      })
    );
  }

  private withTimestamp(resume: Resume): Resume {
    return { ...resume, lastUpdatedAt: new Date().toISOString() };
  }

  resetResume(): void {
    this.resumeSignal.set(createEmptyResume());
  }

  private saveToLocalStorage(resume: Resume): void {
    try {
      localStorage.setItem('resumeData', JSON.stringify(resume));
    } catch {}
  }

  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('resumeData');
      if (saved) {
        this.resumeSignal.set(this.migrateResume(JSON.parse(saved)));
      }
    } catch {}
  }

  private migrateResume(data: Partial<Resume>): Resume {
    const empty = createEmptyResume();
    const oldPersonal = data.personalInfo as Record<string, unknown> | undefined;

    return {
      personalInfo: {
        ...empty.personalInfo,
        ...oldPersonal,
        mobile: (oldPersonal?.['mobile'] as string) || (oldPersonal?.['phone'] as string) || '',
        phone: (oldPersonal?.['phone'] as string) || '',
        photoOffsetY: (oldPersonal?.['photoOffsetY'] as number) ?? 50
      } as PersonalInfo,
      summary: data.summary || '',
      workExperience: (data.workExperience || []).map(exp => ({
        ...createEmptyWorkExperience(),
        ...exp,
        country: exp.country || '',
        province: exp.province || '',
        city: exp.city || ''
      })),
      education: (data.education || []).map(edu => ({
        ...createEmptyEducation(),
        ...edu,
        specialization: edu.specialization || '',
        country: edu.country || '',
        province: edu.province || '',
        city: edu.city || '',
        currentlyStudying: edu.currentlyStudying || false
      })),
      skills: (data.skills || []).map(skill => this.migrateSkill(skill)),
      languages: this.ensureDefaultLanguages(data.languages),
      projects: data.projects || [],
      socialMedia: data.socialMedia || [],
      certificates: (data.certificates || []).map(cert => ({
        ...createEmptyCertificate(),
        ...cert
      })),
      customSections: (data.customSections || []).map(section => ({
        ...section,
        entries: section.entries || []
      })),
      careerInfo: { ...createEmptyCareerInfo(), ...data.careerInfo },
      lastUpdatedAt: data.lastUpdatedAt || new Date().toISOString(),
      settings: this.mergeSettings(data.settings)
    };
  }

  private migrateSkill(skill: Partial<Skill> & { level?: number | string }): Skill {
    const rawLevel = skill.level;
    let level: SkillLevel = 3;
    if (typeof rawLevel === 'number') {
      if (rawLevel >= 1 && rawLevel <= 5) {
        level = rawLevel as SkillLevel;
      } else {
        if (rawLevel <= 20) level = 1;
        else if (rawLevel <= 40) level = 2;
        else if (rawLevel <= 60) level = 3;
        else if (rawLevel <= 80) level = 4;
        else level = 5;
      }
    }
    return {
      ...createEmptySkill((skill.category as SkillCategory) || 'technical'),
      ...skill,
      category: (skill.category as SkillCategory) || 'technical',
      level
    };
  }

  private normalizeLevel(level: unknown): SkillLevel {
    const n = Number(level);
    if (n >= 1 && n <= 5) return n as SkillLevel;
    return 3;
  }

  private mergeSettings(saved?: Partial<ResumeSettings>): ResumeSettings {
    const s = saved ?? {};
    return {
      themeId: (s.themeId as ResumeSettings['themeId']) ?? DEFAULT_SETTINGS.themeId,
      layoutId: (s.layoutId as ResumeSettings['layoutId']) ?? DEFAULT_SETTINGS.layoutId,
      fontFamilyId: this.migrateFontFamilyId(s.fontFamilyId),
      technicalSkillsDisplay: s.technicalSkillsDisplay
        ? this.migrateSkillDisplay(String(s.technicalSkillsDisplay))
        : DEFAULT_SETTINGS.technicalSkillsDisplay,
      softSkillsDisplay: s.softSkillsDisplay
        ? this.migrateSkillDisplay(String(s.softSkillsDisplay))
        : DEFAULT_SETTINGS.softSkillsDisplay,
      sections: {
        ...DEFAULT_SECTIONS,
        ...(s.sections ?? {}),
        technicalSkills: true
      },
      display: {
        ...DEFAULT_DISPLAY,
        ...(s.display ?? {})
      }
    };
  }

  private migrateSkillDisplay(value?: string): 'cards' | 'bar' | 'radialBar' | 'column' {
    if (value === 'circle') return 'radialBar';
    if (value === 'cards' || value === 'column' || value === 'radialBar' || value === 'bar') return value;
    return 'cards';
  }

  private migrateFontFamilyId(value?: string): FontFamilyId {
    const valid = FONT_PRESETS.some(f => f.id === value);
    return valid ? (value as FontFamilyId) : DEFAULT_FONT_ID;
  }

  private ensureDefaultLanguages(langs?: Language[]): Language[] {
    return (langs ?? []).map(lang => ({
      ...createEmptyLanguage(),
      ...lang,
      level: this.normalizeLevel(lang.level)
    }));
  }
}
