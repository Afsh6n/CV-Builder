import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SKILL_LEVEL_PERCENT } from '../../../core/constants/resume.constants';
import { SkillLevel } from '../../../core/types/resume.types';
import { ResumeIcon } from '../../../shared/components/resume-icon/resume-icon';

@Component({
  selector: 'app-skill-card',
  imports: [CommonModule, ResumeIcon],
  templateUrl: './skill-card.html',
  styleUrl: './skill-card.css'
})
export class SkillCard {
  name = input.required<string>();
  level = input.required<SkillLevel>();
  accentColor = input<string>('#3b82f6');

  percent = computed(() => SKILL_LEVEL_PERCENT[this.level()]);
  initial = computed(() => (this.name()?.trim()?.charAt(0) || '?').toUpperCase());
}