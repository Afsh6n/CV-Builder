import { Injectable } from '@angular/core';
import JSON5 from 'json5';

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

interface ApiResponseModel {
  id: string;
}

interface ApiResponseList {
  data: ApiResponseModel[];
}

interface ApiChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

@Injectable({ providedIn: 'root' })
export class AiResumeService {

  async fetchAvailableModels(config: AiConfig): Promise<string[]> {
    if (!config.apiKey || !config.endpoint) {
      throw new Error('لطفاً ابتدا کلید اتصال و آدرس سرور را وارد کنید.');
    }

    const baseUrl = config.endpoint.includes('/chat/completions')
      ? config.endpoint.replace('/chat/completions', '')
      : config.endpoint.replace(/\/$/, '');

    const url = `${baseUrl}/models`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`خطا در دریافت مدل‌ها: ${response.statusText}`);
      }

      const data: ApiResponseList = await response.json();
      if (data && Array.isArray(data.data)) {
        return data.data.map((m: ApiResponseModel) => m.id);
      } else {
        throw new Error('ساختار پاسخ سرور برای لیست مدل‌ها معتبر نیست.');
      }
    } catch {
      throw new Error('ارتباط با سرور برای دریافت مدل‌ها برقرار نشد.');
    }
  }

  async extractResumeData(text: string, config: AiConfig): Promise<ExtractedResumeData> {
    const prompt = this.generateExtractionPrompt(text);
    const response = await this.sendToFreeLLMAPI(prompt, config);
    const parsed = this.parseAiResponse(response);

    if (!parsed) {
      throw new Error('قالب داده‌های خروجی نامعتبر است.');
    }
    return parsed;
  }

  generateExtractionPrompt(text: string): string {
    return `You are a resume parser. Extract information from the input into a valid JSON object.
    User Raw Input: ${text}
    Return ONLY a raw JSON object. Do not include markdown, code blocks, or explanations.
    The content MUST be in Persian.
    Ensure all text values are properly escaped for JSON.`;
  }

  parseAiResponse(response: string): ExtractedResumeData | null {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON5.parse(jsonMatch[0]) as ExtractedResumeData;
      }
      return null;
    } catch {
      return null;
    }
  }

  private async sendToFreeLLMAPI(prompt: string, config: AiConfig): Promise<string> {
    const url = config.endpoint.endsWith('/chat/completions')
      ? config.endpoint
      : `${config.endpoint.replace(/\/$/, '')}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a JSON generator. Respond ONLY with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error(`خطای API (${response.status})`);
    }

    const data: ApiChatResponse = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
}