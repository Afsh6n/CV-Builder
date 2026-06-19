import {
  DEFAULT_SETTINGS
} from '../constants/resume.constants';
import { CareerInfo, Certificate, CustomSection, CustomSectionEntry, Education, Language, PersonalInfo, Project, Resume, Skill, SocialMedia, WorkExperience } from "../types/resume.types";

export const createEmptyPersonalInfo = (): PersonalInfo => ({
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

export const createEmptyCareerInfo = (): CareerInfo => ({
  expectedSalary: '',
  totalExperience: ''
});

export const createEmptyResume = (): Resume => ({
  personalInfo: createEmptyPersonalInfo(),
  summary: '',
  careerInfo: createEmptyCareerInfo(),
  workExperience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  socialMedia: [],
  certificates: [],
  customSections: [],
  settings: { ...DEFAULT_SETTINGS },
  lastUpdatedAt: new Date().toISOString()
});

export const createEmptyWorkExperience = (): WorkExperience => ({
  id: Date.now().toString(),
  position: '',
  company: '',
  country: '',
  province: '',
  city: '',
  startDate: '',
  endDate: '',
  current: false,
  description: ''
});

export const createEmptyEducation = (): Education => ({
  id: Date.now().toString(),
  degree: '',
  field: '',
  specialization: '',
  institution: '',
  gpa: '',
  country: '',
  province: '',
  city: '',
  startDate: '',
  endDate: '',
  currentlyStudying: false
});

export const createEmptySkill = (category: 'technical' | 'soft' = 'technical'): Skill => ({
  id: Date.now().toString(),
  name: '',
  category,
  level: 3
});

export const createEmptyLanguage = (): Language => ({
  id: Date.now().toString(),
  name: '',
  level: 3,
  displayType: 'graphic'
});

export const createEmptyProject = (): Project => ({
  id: Date.now().toString(),
  title: '',
  employer: '',
  link: '',
  date: '',
  description: ''
});

export const createEmptySocialMedia = (): SocialMedia => ({
  id: Date.now().toString(),
  platform: 'github',
  username: '',
  url: ''
});

export const createEmptyCertificate = (): Certificate => ({
  id: Date.now().toString(),
  title: '',
  issuer: '',
  validFrom: '',
  validTo: '',
  current: false,
  imageData: '',
  link: ''
});

export const createEmptyCustomSectionEntry = (): CustomSectionEntry => ({
  id: Date.now().toString(),
  title: '',
  subtitle: '',
  date: '',
  description: '',
  link: ''
});

export const createEmptyCustomSection = (): CustomSection => ({
  id: Date.now().toString(),
  title: '',
  icon: 'projects',
  entries: []
});

export const createDefaultLanguages = (): Language[] => [
  {
    id: 'native-farsi',
    name: 'فارسی (زبان مادری)',
    level: 4,
    displayType: 'text'
  }
];