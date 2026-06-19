import { CommonModule } from '@angular/common';
import { Component, signal, inject, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AlertService } from '../../core/services/alert.service';
import { ResumeService } from '../../core/services/resume.service';
import { PersonalInfo, WorkExperience, Education, Skill, SkillCategory, SkillLevel } from '../../core/types/resume.types';
import { createEmptyPersonalInfo, createEmptyWorkExperience, createEmptyEducation, createEmptySkill } from '../../core/utils/resume.factories';
import { AiResumeService } from '@app/core/services/ai-resume.service';
import { ResumeIcon } from "@app/shared/components/resume-icon/resume-icon";

export interface ExtractedPersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  mobile: string;
  city: string;
  province: string;
  country: string;
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
  category: string;
  level: number;
}

export interface ExtractedResumeData {
  personalInfo: ExtractedPersonalInfo;
  summary: string;
  workExperience: ExtractedWorkExperience[];
  education: ExtractedEducation[];
  skills: ExtractedSkill[];
}

@Component({
  selector: 'app-initial-input',
  imports: [CommonModule, FormsModule, ResumeIcon],
  templateUrl: './initial-input.html',
  styleUrl: './initial-input.css'
})
export class InitialInput {
  private aiResumeService = inject(AiResumeService);
  private alertService = inject(AlertService);
  private resumeService = inject(ResumeService);

  @Output() onComplete = new EventEmitter<void>();

  customApiKey = signal<string>(localStorage.getItem('openrouter_api_key') || '');
  rawInput = signal<string>('');
  isProcessing = signal<boolean>(false);
  extractedData = signal<ExtractedResumeData | null>(null);

  readonly minCharacterLength = 50;

  onApiKeyChange(value: string): void {
    const cleanKey = value.trim();
    this.customApiKey.set(cleanKey);
    localStorage.setItem('openrouter_api_key', cleanKey);
  }

  async processWithAi(): Promise<void> {
    const text = this.rawInput().trim();
    const apiKey = this.customApiKey().trim();

    if (!apiKey) {
      await this.alertService.error('لطفاً ابتدا OpenRouter API Key خود را وارد کنید.');
      return;
    }

    if (text.length < this.minCharacterLength) {
      await this.alertService.error(`لطفاً حداقل ${this.minCharacterLength} کاراکتر اطلاعات درباره خودتان وارد کنید تا هوش مصنوعی بتواند رزومه را بسازد.`);
      return;
    }

    this.aiResumeService.setApiKey(apiKey);
    this.isProcessing.set(true);

    try {
      const prompt = this.generateExtractionPrompt(text);
      const response = await this.aiResumeService.sendToAiApi(prompt);
      const parsedData = this.parseAiResponse(response);

      if (parsedData) {
        this.extractedData.set(parsedData);
        await this.alertService.success('اطلاعات با موفقیت استخراج و بهینه شد! لطفاً داده‌ها را بررسی و تأیید کنید.');
      } else {
        throw new Error('قالب داده‌های خروجی نامعتبر است.');
      }
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

  private generateExtractionPrompt(text: string): string {
    return `You are an elite Resume Writer, ATS Optimization Expert, Technical Recruiter, Career Consultant, and Professional Career Branding Specialist.

Your mission is to transform raw, unstructured, incomplete, or poorly written user profile data into a world-class, ATS-optimized, recruiter-friendly professional resume.

User Raw Input:
${text}

PRIMARY OBJECTIVE

Analyze all provided information and convert it into a highly polished, achievement-oriented, globally standardized resume structure that maximizes interview potential while remaining truthful to the user's background.

CORE RESPONSIBILITIES

1. PERSONAL INFORMATION ENHANCEMENT
* Extract and normalize all personal information.
* Correct formatting inconsistencies.
* Standardize phone numbers, locations, and contact information.
* Remove redundant or irrelevant personal details.
* Preserve only professional and resume-relevant information.

2. PROFESSIONAL SUMMARY GENERATION
* Generate a powerful executive summary (3–6 sentences).
* Clearly communicate:
  * Professional identity
  * Years of experience (when inferable)
  * Core expertise
  * Industry specialization
  * Technical strengths
  * Key achievements
  * Career value proposition
* Make the summary ATS-friendly and recruiter-focused.
* Avoid generic phrases such as "hardworking" or "motivated" unless supported by evidence.

3. WORK EXPERIENCE OPTIMIZATION
   For each position:
* Rewrite responsibilities using strong action verbs.
* Emphasize measurable impact whenever possible.
* Highlight:
  * Achievements
  * Results
  * Leadership
  * Ownership
  * Process improvements
  * Technical contributions
  * Business outcomes
* Convert weak descriptions into professional accomplishment statements.
* Use concise, professional resume language.
* Remove repetitive wording.
* Improve readability and ATS compatibility.

Examples of preferred action verbs:
Developed, Engineered, Designed, Implemented, Architected, Led, Optimized, Automated, Improved, Scaled, Delivered, Collaborated, Analyzed, Reduced, Increased, Streamlined, Built, Integrated, Maintained, Managed.

4. ACHIEVEMENT EXTRACTION
   Whenever possible:
* Extract measurable accomplishments.
* Infer impact from context when reasonable.
* Prioritize:
  * Revenue growth
  * Cost reduction
  * Performance improvements
  * Scalability
  * User growth
  * Productivity gains
  * System reliability
  * Process optimization
  * Team leadership
  * Project success

5. EDUCATION STANDARDIZATION
* Normalize educational records.
* Identify:
  * Degree
  * Field of study
  * Institution
  * Location
  * Study period
* Mark ongoing education correctly.
* Maintain internationally recognized naming conventions.

6. SKILLS ANALYSIS AND CLASSIFICATION
   Identify and categorize skills into appropriate groups:
Technical Skills
Programming Languages
Frameworks & Libraries
Frontend Technologies
Backend Technologies
Databases
Cloud & DevOps
Tools & Platforms
Testing & QA
Design & UI/UX
Data & Analytics
AI & Machine Learning
Soft Skills

For each skill:
* Estimate proficiency level from 1–5.
* Use contextual evidence from experience.
* Avoid unrealistic expert ratings.

Skill Levels:
1 = Beginner
2 = Basic
3 = Intermediate
4 = Advanced
5 = Expert

7. ATS OPTIMIZATION
* Improve keyword relevance.
* Use industry-standard terminology.
* Ensure ATS parsing compatibility.
* Avoid tables, icons, emojis, special characters, and decorative formatting.
* Use globally recognized job titles when appropriate.
* Maintain semantic clarity.

8. DATA QUALITY RULES
* Never fabricate employment history.
* Never invent companies, degrees, certifications, dates, or achievements.
* If information is missing, leave fields empty.
* Infer only when highly probable from context.
* Maintain factual consistency.

9. DATE NORMALIZATION
* Convert dates into standardized formats.
* Handle ongoing positions and education correctly.
* Preserve chronological accuracy.

10. PROFESSIONAL QUALITY STANDARDS
    The final resume data should resemble the quality produced by:
* Top international recruiting firms
* Executive resume writers
* Fortune 500 hiring standards
* Modern ATS systems

OUTPUT REQUIREMENTS

Return ONLY a valid raw JSON object.
Do NOT include:
* Markdown
* Explanations
* Notes
* Comments
* Code blocks
* Additional text

Required JSON Schema:
{
"personalInfo": {
"firstName": "",
"lastName": "",
"title": "",
"email": "",
"mobile": "",
"city": "",
"province": "",
"country": "",
"linkedin": "",
"github": "",
"portfolio": ""
},
"summary": "",
"workExperience": [
{
"position": "",
"company": "",
"city": "",
"province": "",
"country": "",
"startDate": "",
"endDate": "",
"current": false,
"description": "",
"achievements": [
""
]
}
],
"education": [
{
"degree": "",
"field": "",
"institution": "",
"city": "",
"province": "",
"country": "",
"startDate": "",
"endDate": "",
"currentlyStudying": false
}
],
"skills": [
{
"name": "",
"category": "",
"level": 3
}
],
"certifications": [
{
"name": "",
"issuer": "",
"issueDate": "",
"expirationDate": ""
}
],
"languages": [
{
"language": "",
"level": ""
}
],
"projects": [
{
"name": "",
"role": "",
"description": "",
"technologies": []
}
]
}

FINAL RULE
The generated content inside all textual fields (summary, experience descriptions, achievements, project descriptions, and any narrative text) MUST be written entirely in Persian (Farsi).
All JSON keys must remain in English.`;
  }

  private parseAiResponse(response: string): ExtractedResumeData | null {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ExtractedResumeData;
      }
      throw new Error('No JSON object found.');
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return null;
    }
  }

  reset(): void {
    this.rawInput.set('');
    this.extractedData.set(null);
  }
}