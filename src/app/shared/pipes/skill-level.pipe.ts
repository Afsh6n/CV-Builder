import { Pipe, PipeTransform } from '@angular/core';
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_PERCENT } from '@app/core/constants/resume.constants';
import { SkillLevel } from '@app/core/types/resume.types';


@Pipe({ name: 'skillLevel'})
export class SkillLevelPipe implements PipeTransform {
  transform(level: SkillLevel, mode: 'label' | 'percent' = 'label'): string | number {
    return mode === 'percent' ? SKILL_LEVEL_PERCENT[level] : SKILL_LEVEL_LABELS[level];
  }
}
