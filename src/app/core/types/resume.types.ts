import { FontFamilyId } from "../constants/font.constants";

export type MaritalStatus = 'مجرد' | 'متأهل' | '';
export type MilitaryStatus =
  | 'پایان خدمت'
  | 'معاف'
  | 'معافیت تحصیلی'
  | 'در حال خدمت'
  | 'مشمول'
  | '';

export type LanguageDisplayType = 'graphic' | 'text';
export type SocialPlatform = 'github' | 'gitlab' | 'linkedin' | 'telegram' | 'instagram' | 'twitter' | 'youtube' | 'website' | 'other';
export type SkillCategory = 'technical' | 'soft';
export type SkillDisplayType = 'cards' | 'bar' | 'radialBar' | 'radialIndividual' | 'column' | 'pie';
export type SkillLevel = 1 | 2 | 3 | 4 | 5;
export type ThemeId = 'blue' | 'teal' | 'purple' | 'rose';
export type LayoutId = 'default' | 'modern' | 'classic' | 'minimalist';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  maritalStatus: MaritalStatus;
  militaryStatus: MilitaryStatus;
  birthDate: string;
  email: string;
  mobile: string;
  phone: string;
  linkedin: string;
  website: string;
  country: string;
  province: string;
  city: string;
  profilePhoto?: string;
  photoOffsetY: number;
}

export interface WorkExperience {
  id: string;
  position: string;
  company: string;
  country: string;
  province: string;
  city: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  salary?: string;
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  specialization: string;
  institution: string;
  gpa: string;
  country: string;
  province: string;
  city: string;
  startDate: string;
  endDate: string;
  currentlyStudying: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
}

export interface Language {
  id: string;
  name: string;
  level: SkillLevel;
  displayType: LanguageDisplayType;
}

export interface Project {
  id: string;
  title: string;
  employer: string;
  link: string;
  date: string;
  description: string;
}

export interface SocialMedia {
  id: string;
  platform: SocialPlatform;
  username: string;
  url: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  current: boolean;
  imageData?: string;
  link?: string;
}

export interface CustomSectionEntry {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  link: string;
}

export interface CustomSection {
  id: string;
  title: string;
  icon: string;
  entries: CustomSectionEntry[];
}

export interface CareerInfo {
  expectedSalary: string;
  totalExperience: string;
}

export interface ResumeDisplayOptions {
  showLastUpdated: boolean;
  showQrCode: boolean;
  qrCodeContent: string;
  showCertificateThumbnails: boolean;
  showPersonalInfoLabels: boolean;
  showCareerInfo: boolean;
}

export interface ResumeSections {
  technicalSkills: boolean;
  softSkills: boolean;
  certificates: boolean;
  socialMedia: boolean;
  projects: boolean;
  languages: boolean;
  careerInfo: boolean;
}

export interface ResumeSettings {
  themeId: ThemeId;
  layoutId: LayoutId;
  fontFamilyId: FontFamilyId;
  technicalSkillsDisplay: SkillDisplayType;
  softSkillsDisplay: SkillDisplayType;
  sections: ResumeSections;
  display: ResumeDisplayOptions;
}

export interface Resume {
  personalInfo: PersonalInfo;
  summary: string;
  careerInfo: CareerInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  socialMedia: SocialMedia[];
  certificates: Certificate[];
  customSections: CustomSection[];
  settings: ResumeSettings;
  lastUpdatedAt: string;
}