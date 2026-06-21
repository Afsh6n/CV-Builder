import { MaritalStatus, MilitaryStatus, SkillCategory, SkillLevel, LanguageDisplayType } from './resume.types';

export interface AiConfig {
  apiKey: string;
  endpoint: string;
  model: string;
}

export interface ExtractedPersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  mobile: string;
  phone: string;
  maritalStatus: MaritalStatus;
  militaryStatus: MilitaryStatus;
  birthDate: string;
  city: string;
  province: string;
  country: string;
  linkedin: string;
  website: string;
}

export interface ExtractedWorkExperience {
  position: string;
  company: string;
  city: string;
  province: string;
  country: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface ExtractedEducation {
  degree: string;
  field: string;
  institution: string;
  city: string;
  province: string;
  country: string;
  startDate: string;
  endDate: string;
  currentlyStudying: boolean;
}

export interface ExtractedSkill {
  name: string;
  category: SkillCategory;
  level: SkillLevel;
}

export interface ExtractedLanguage {
  name: string;
  level: SkillLevel;
  displayType: LanguageDisplayType;
}

export interface ExtractedProject {
  title: string;
  employer: string;
  link: string;
  date: string;
  description: string;
}

export interface ExtractedCertificate {
  title: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  current: boolean;
  link: string;
}

export interface ExtractedCareerInfo {
  expectedSalary: string;
  totalExperience: string;
}

export interface ExtractedResumeData {
  personalInfo: ExtractedPersonalInfo;
  summary: string;
  careerInfo: ExtractedCareerInfo;
  workExperience: ExtractedWorkExperience[];
  education: ExtractedEducation[];
  skills: ExtractedSkill[];
  languages: ExtractedLanguage[];
  projects: ExtractedProject[];
  certificates: ExtractedCertificate[];
}

export interface ApiResponseModel {
  id: string;
}

export interface ApiResponseList {
  data: ApiResponseModel[];
}

export interface ApiChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}