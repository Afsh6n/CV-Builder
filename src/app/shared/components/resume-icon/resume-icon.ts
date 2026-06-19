import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

export type ResumeIconName =
  | 'email'
  | 'mobile'
  | 'phone'
  | 'website'
  | 'location'
  | 'linkedin'
  | 'github'
  | 'gitlab'
  | 'instagram'
  | 'telegram'
  | 'twitter'
  | 'youtube'
  | 'education'
  | 'work'
  | 'skills'
  | 'projects'
  | 'languages'
  | 'social'
  | 'summary'
  | 'contact'
  | 'certificate'
  | 'user'
  | 'salary'
  | 'calendar'
  | 'edit'
  | 'delete'
  | 'experience';

@Component({
  selector: 'app-resume-icon',
  imports: [CommonModule],
  templateUrl: './resume-icon.html',
  styleUrl: './resume-icon.css'
})
export class ResumeIcon {
  name = input.required<ResumeIconName>();
  size = input<number>(16);
}
