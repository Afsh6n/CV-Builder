import { Injectable } from '@angular/core';
import JSON5 from 'json5';
import {
  AiConfig,
  ExtractedResumeData,
  ApiResponseList,
  ApiResponseModel,
  ApiChatResponse
} from '../types/ai-resume.types';

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

      const data = await response.json() as ApiResponseList;
      if (data && Array.isArray(data.data)) {
        const uniqueModels = Array.from(new Set(data.data.map((m: ApiResponseModel) => m.id)));
        return uniqueModels;
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
    return `You are an expert Resume Writer and ATS Optimizer. Extract information from the raw input and map it STRICTLY to the following JSON structure.
    
    CRITICAL INSTRUCTIONS:
    1. Language: Write all content in highly professional Persian.
    2. ATS Optimization: Use industry-standard keywords related to the user's profession.
    3. Action Verbs: Begin bullet points in the 'description' fields with strong Persian action verbs (e.g., طراحی، توسعه، مدیریت، بهینه‌سازی).
    4. Quantify Achievements: Wherever possible, infer or format numbers to show impact (e.g., افزایش ۲۰ درصدی کارایی).
    5. Summary: Write a concise, impactful summary highlighting core strengths, years of experience, and key professional values.
    6. Strict Typing: The "maritalStatus" MUST be either "مجرد", "متأهل", or "". The "militaryStatus" MUST be exactly one of: "پایان خدمت", "معاف", "معافیت تحصیلی", "در حال خدمت", "مشمول", or "". "category" MUST be "technical" or "soft".
    7. Levels: Skill and Language levels MUST be an integer between 1 and 5.
    
    Expected JSON Structure:
    {
      "personalInfo": {
        "firstName": "",
        "lastName": "",
        "title": "",
        "email": "",
        "mobile": "",
        "phone": "",
        "maritalStatus": "",
        "militaryStatus": "",
        "birthDate": "",
        "city": "",
        "province": "",
        "country": "",
        "linkedin": "",
        "website": ""
      },
      "summary": "",
      "careerInfo": {
        "expectedSalary": "",
        "totalExperience": ""
      },
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
          "description": ""
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
          "category": "technical",
          "level": 4
        }
      ],
      "languages": [
        {
          "name": "",
          "level": 3,
          "displayType": "graphic"
        }
      ],
      "projects": [
        {
          "title": "",
          "employer": "",
          "link": "",
          "date": "",
          "description": ""
        }
      ],
      "certificates": [
        {
          "title": "",
          "issuer": "",
          "validFrom": "",
          "validTo": "",
          "current": true,
          "link": ""
        }
      ]
    }
    
    User Raw Input: ${text}
    
    Return ONLY a raw JSON object. Do not include markdown, code blocks, or explanations.
    Ensure all text values are properly escaped for JSON.`;
  }

  parseAiResponse(response: string): ExtractedResumeData | null {
    try {
      if (!response) return null;
      const startIndex = response.indexOf('{');
      const endIndex = response.lastIndexOf('}');

      if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
        console.error("ساختار JSON در پاسخ هوش مصنوعی یافت نشد.");
        return null;
      }

      const jsonString = response.substring(startIndex, endIndex + 1);

      const parsedData = JSON5.parse(jsonString);

      return parsedData as ExtractedResumeData;
    } catch (error) {
      console.error("خطا در پارس کردن پاسخ هوش مصنوعی:", error);
      return null;
    }
  }

  private async sendToFreeLLMAPI(prompt: string, config: AiConfig): Promise<string> {
    const url = config.endpoint.endsWith('/chat/completions')
      ? config.endpoint
      : `${config.endpoint.replace(/\/$/, '')}/chat/completions`;

    const systemInstruction = `You are an expert resume builder. 
    Output ONLY a raw JSON object based on the provided schema.
    Do not include any preamble, markdown code blocks (like \`\`\`json), or conversational text.
    Ensure the JSON is valid.`;

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
        max_tokens: 8192
      })
    });

    if (!response.ok) {
      throw new Error(`خطای API (${response.status})`);
    }

    const data = await response.json() as ApiChatResponse;
    return data.choices?.[0]?.message?.content || '';
  }
}