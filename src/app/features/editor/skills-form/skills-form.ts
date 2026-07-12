import { Component, input, output, signal, inject, computed } from '@angular/core';
import { SKILL_LEVEL_LABELS } from '@app/core/constants/resume.constants';
import { SuggestionService } from '@app/core/services/suggestion.service';
import { Skill, SkillCategory, SkillLevel } from '@app/core/types/resume.types';
import { createEmptySkill } from '@app/core/utils/resume.factories';
import { EditorAddButton } from '@app/shared/components/editor-add-button/editor-add-button';
import { EditorFormActions } from '@app/shared/components/editor-form-actions/editor-form-actions';
import { EditorItemActions } from '@app/shared/components/editor-item-actions/editor-item-actions';
import { FormField } from '@app/shared/components/form-field/form-field';
import { FormInput } from '@app/shared/components/form-input/form-input';
import { OrderButtons } from '@app/shared/components/order-buttons/order-buttons';
import { SegmentedControl, SegmentOption } from '@app/shared/components/segmented-control/segmented-control';
import { ListEditController } from '@app/shared/utils/list-edit.controller';
import { requiredError } from '@app/shared/validators/field.validators';
import { NgApexchartsModule } from 'ng-apexcharts';
import type { ApexOptions } from 'ng-apexcharts';


@Component({
  selector: 'app-skills-form',
  imports: [
    NgApexchartsModule,
    SegmentedControl,
    FormField,
    FormInput,
    OrderButtons,
    EditorItemActions,
    EditorFormActions,
    EditorAddButton
  ],
  templateUrl: './skills-form.html',
  styleUrl: './skills-form.css'
})
export class SkillsForm {
  private suggestionService = inject(SuggestionService);

  skills = input<Skill[]>([]);
  showSoftSkills = input<boolean>(true);
  skillsChanged = output<Skill[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  levelLabels = SKILL_LEVEL_LABELS;
  levels: SkillLevel[] = [1, 2, 3, 4, 5];
  levelOptions: SegmentOption<SkillLevel>[] = this.levels.map(lvl => ({
    value: lvl,
    label: `${lvl}`,
    description: SKILL_LEVEL_LABELS[lvl]
  }));

  skillSuggestions = computed(() => this.suggestionService.getSuggestions('skill_name'));
  nameErrors = signal<Record<string, string>>({});

  private readonly editCtrl = new ListEditController<Skill>(
    () => this.skills(),
    items => this.skillsChanged.emit(items),
    () => this.editingId(),
    id => this.editModeChanged.emit(id),
    () => createEmptySkill('technical')
  );

  technicalSkills = () => this.skills().filter(s => s.category === 'technical');
  softSkills = () => this.skills().filter(s => s.category === 'soft');

  addSkill(category: SkillCategory): void {
    this.editCtrl.addItem(createEmptySkill(category));
  }

  removeSkill(id: string): void {
    const updated = this.skills().filter(s => s.id !== id);
    this.skillsChanged.emit(updated);
    if (this.editingId() === id) {
      this.editModeChanged.emit(null);
    }
    this.nameErrors.update(m => {
      const next = { ...m };
      delete next[id];
      return next;
    });
  }

  updateSkill(id: string, field: keyof Skill, value: unknown): void {
    this.skillsChanged.emit(
      this.skills().map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  getPercent(level: SkillLevel): number {
    const map: Record<SkillLevel, number> = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
    return map[level];
  }

  getChartOptions(level: SkillLevel): ApexOptions {
    const percent = this.getPercent(level);
    return {
      series: [percent],
      chart: { height: 80, type: 'radialBar', sparkline: { enabled: true } },
      plotOptions: {
        radialBar: {
          hollow: { size: '50%' },
          dataLabels: {
            name: { show: false },
            value: {
              show: true,
              fontSize: '12px',
              fontWeight: 600,
              offsetY: 0,
              formatter: (val: number) => val + '%'
            }
          }
        }
      },
      colors: ['#3b82f6'],
      stroke: { lineCap: 'round' },
      labels: ['Progress']
    };
  }

  moveSkill(id: string, direction: 'up' | 'down'): void {
    const list = [...this.skills()];
    const i = list.findIndex(s => s.id === id);
    if (i < 0) return;
    const j = direction === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= list.length || list[j].category !== list[i].category) return;
    [list[i], list[j]] = [list[j], list[i]];
    this.skillsChanged.emit(list);
  }

  skillCountInCategory(category: SkillCategory): number {
    return this.skills().filter(s => s.category === category).length;
  }

  nameError(id: string): string {
    return this.nameErrors()[id] ?? '';
  }

  startEditing(id: string): void {
    this.editCtrl.startEditing(id);
  }

  stopEditing(id: string): void {
    const skill = this.skills().find(s => s.id === id);
    if (skill) {
      const err = requiredError(skill.name, 'نام مهارت');
      if (err) {
        this.nameErrors.update(m => ({ ...m, [id]: err }));
        return;
      }
      this.suggestionService.addSuggestion('skill_name', skill.name);
      this.nameErrors.update(m => {
        const next = { ...m };
        delete next[id];
        return next;
      });
    }
    this.editCtrl.completeSave(id);
  }

  cancelEditing(id: string): void {
    this.editCtrl.cancel(id);
    this.nameErrors.update(m => {
      const next = { ...m };
      delete next[id];
      return next;
    });
  }

  isEditing(id: string): boolean {
    return this.editCtrl.isEditing(id);
  }

  skillGroups(): { cat: SkillCategory; title: string }[] {
    const groups: { cat: SkillCategory; title: string }[] = [
      { cat: 'technical', title: 'مهارت‌های فنی' }
    ];
    if (this.showSoftSkills()) {
      groups.push({ cat: 'soft', title: 'مهارت‌های نرم' });
    }
    return groups;
  }
}