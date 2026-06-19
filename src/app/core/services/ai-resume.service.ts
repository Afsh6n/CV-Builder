import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Resume } from '../types/resume.types';

@Injectable({ providedIn: 'root' })
export class AiResumeService {
  private apiKey = environment.aiApiKey !== 'X' ? environment.aiApiKey : '';
  private aiProvider = environment.aiProvider;
  private apiEndpoint = environment.aiApiEndpoint;

  setApiKey(key: string): void {
    this.apiKey = key;
  }

  generateResumeOptimizationPrompt(userData: Resume): string {
    const prompt = `
شما یک متخصص رزومه‌نویسی، مشاور شغلی و کارشناس بهینه‌سازی ATS هستید.

لطفاً اطلاعات رزومه زیر را تحلیل کرده و بهینه‌سازی‌های لازم را انجام دهید:

## اطلاعات فردی:
- نام: ${userData.personalInfo.firstName} ${userData.personalInfo.lastName}
- عنوان شغلی: ${userData.personalInfo.title}
- وضعیت تأهل: ${userData.personalInfo.maritalStatus}
- وضعیت سربازی: ${userData.personalInfo.militaryStatus}
- تاریخ تولد: ${userData.personalInfo.birthDate}
- ایمیل: ${userData.personalInfo.email}
- موبایل: ${userData.personalInfo.mobile}
- شهر: ${userData.personalInfo.city}، ${userData.personalInfo.province}، ${userData.personalInfo.country}

## خلاصه رزومه:
${userData.summary || 'وارد نشده'}

## اطلاعات شغلی:
- حقوق درخواستی: ${userData.careerInfo.expectedSalary || 'وارد نشده'}
- سابقه کار کل: ${userData.careerInfo.totalExperience || 'وارد نشده'}

## سوابق شغلی:
${userData.workExperience.map((exp, index) => `
${index + 1}. ${exp.position}
   شرکت: ${exp.company}
   محل: ${exp.city}، ${exp.province}، ${exp.country}
   از ${exp.startDate} تا ${exp.current ? 'اکنون' : exp.endDate}
   توضیحات: ${exp.description}
`).join('\n')}

## تحصیلات:
${userData.education.map((edu, index) => `
${index + 1}. ${edu.degree} در ${edu.field}
   گرایش: ${edu.specialization || 'وارد نشده'}
   موسسه: ${edu.institution}
   معدل: ${edu.gpa || 'وارد نشده'}
   محل: ${edu.city}، ${edu.province}، ${edu.country}
   از ${edu.startDate} تا ${edu.currentlyStudying ? 'اکنون' : edu.endDate}
`).join('\n')}

## مهارت‌های فنی:
${userData.skills.filter(s => s.category === 'technical').map((skill, index) => `
${index + 1}. ${skill.name} - سطح: ${skill.level}/5
`).join('\n')}

## مهارت‌های نرم:
${userData.skills.filter(s => s.category === 'soft').map((skill, index) => `
${index + 1}. ${skill.name} - سطح: ${skill.level}/5
`).join('\n')}

## زبان‌ها:
${userData.languages.map((lang, index) => `
${index + 1}. ${lang.name} - سطح: ${lang.level}/5
`).join('\n')}

## پروژه‌ها:
${userData.projects.map((proj, index) => `
${index + 1}. ${proj.title}
   کارفرما: ${proj.employer}
   تاریخ: ${proj.date}
   لینک: ${proj.link || 'وارد نشده'}
   توضیحات: ${proj.description}
`).join('\n')}

## گواهینامه‌ها:
${userData.certificates.map((cert, index) => `
${index + 1}. ${cert.title}
   صادرکننده: ${cert.issuer}
   اعتبار: از ${cert.validFrom} تا ${cert.current ? 'اکنون' : cert.validTo}
`).join('\n')}

## شبکه‌های اجتماعی:
${userData.socialMedia.map((social, index) => `
${index + 1}. ${social.platform}: ${social.username || social.url}
`).join('\n')}

---

### دستورالعمل‌ها:

1. **تحلیل و ارزیابی**: رزومه را از نظر ساختار، محتوا و تأثیرگذاری تحلیل کنید.
2. **بهینه‌سازی ATS**: کلمات کلیدی مناسب برای موقعیت‌های شغلی مرتبط با ${userData.personalInfo.title} را پیشنهاد دهید.
3. **بازنویسی حرفه‌ای**: متن‌های ضعیف را به متن‌های حرفه‌ای‌تر و تأثیرگذارتر بازنویسی کنید.
4. **برجسته کردن دستاوردها**: نقاط قوت و دستاوردها را با اعداد و ارقام مشخص برجسته سازید.
5. **ساختار بهینه**: بهترین ساختار رزومه برای این سطح سابقه کار و تخصص را پیشنهاد دهید.
6. **پیشنهادات بهبود**: پیشنهادات مشخص برای بهبود هر بخش از رزومه ارائه دهید.

### خروجی مورد انتظار:

لطفاً پاسخ خود را به صورت ساختاریافته با بخش‌های زیر ارائه دهید:

1. **تحلیل کلی**: ارزیابی کوتاه از وضعیت فعلی رزومه
2. **پیشنهادات ATS**: لیست کلمات کلیدی و عبارات پیشنهادی
3. **بازنویسی بخش‌ها**: متن‌های بازنویسی شده برای هر بخش
4. **دستاوردها**: نقاط قوت و دستاوردهای برجسته
5. **پیشنهادات نهایی**: لیست اقدامات پیشنهادی برای بهبود رزومه
`;

    return prompt;
  }

  getUserDataJson(userData: Resume): string {
    return JSON.stringify(userData, null, 2);
  }

  generateSummaryOptimizationPrompt(userData: Resume): string {
    return `
بر اساس اطلاعات رزومه زیر، یک خلاصه حرفه‌ای و تأثیرگذار بنویسید که:
- در 3-4 جمله باشد
- نقاط قوت اصلی را برجسته کند
- برای ATS بهینه باشد
- حرفه‌ای و جذاب باشد

اطلاعات:
- نام: ${userData.personalInfo.firstName} ${userData.personalInfo.lastName}
- عنوان شغلی: ${userData.personalInfo.title}
- سابقه کار کل: ${userData.careerInfo.totalExperience}
- مهارت‌های اصلی: ${userData.skills.filter(s => s.category === 'technical').slice(0, 5).map(s => s.name).join('، ')}
- سوابق شغلی: ${userData.workExperience.map(w => w.position).join('، ')}

خلاصه فعلی:
${userData.summary || 'وارد نشده'}

لطفاً خلاصه بهینه‌شده را ارائه دهید.
`;
  }

  async sendToAiApi(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('کلید اتصال (API Key) یافت نشد. لطفاً ابتدا کلید خود را در کادر مربوطه وارد کنید.');
    }

    try {
       if (this.aiProvider === 'openai') {
        return await this.sendToOpenRouterAi(prompt);
      }  else if (this.aiProvider === 'custom' && this.apiEndpoint) {
        return await this.sendToCustomEndpoint(prompt);
      } else {
        throw new Error('تنظیمات سرویس دهنده هوش مصنوعی نامعتبر است.');
      }
    } catch (error) {
      console.error('AI API Error:', error);
      throw error;
    }
  }

  isApiKeyConfigured(): boolean {
    return !!this.apiKey;
  }

  private async sendToOpenRouterAi(prompt: string): Promise<string> {
    const url = this.apiEndpoint || 'https://openrouter.ai/api/v1/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://myresumeapp.com',
        'X-OpenRouter-Title': 'Resume Builder'
      },
      body: JSON.stringify({
        model: 'z-ai/glm-5.2',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('OpenRouter Error:', responseText);
      throw new Error(`OpenRouter API error (${response.status}): ${responseText.substring(0, 200)}`);
    }

    try {
      const data = JSON.parse(responseText);
      return data.choices?.[0]?.message?.content || '';
    } catch {
      console.error('Invalid JSON from OpenRouter:');
      throw new Error('پاسخ دریافتی از سرور معتبر نیست (JSON نامعتبر).');
    }
  }

  private async sendToCustomEndpoint(prompt: string): Promise<string> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || data.message || '';
  }
}