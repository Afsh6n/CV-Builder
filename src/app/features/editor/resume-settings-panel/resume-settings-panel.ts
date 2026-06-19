import { CommonModule } from '@angular/common';
import { Component, input, output, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FONT_PRESETS, FontFamilyId } from '../../../core/constants/font.constants';
import { LAYOUT_PRESETS, SKILL_DISPLAY_OPTIONS, THEME_PRESETS } from '../../../core/constants/resume.constants';
import { ResumeDisplayOptions, ResumeSettings } from '../../../core/types/resume.types';
import { LayoutId, SkillDisplayType, ThemeId } from '../../../core/types/resume.types';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { FormSelect } from '../../../shared/components/form-select/form-select';

@Component({
  selector: 'app-resume-settings-panel',
  imports: [CommonModule, FormsModule, FormField, FormSelect, FormInput],
  templateUrl: './resume-settings-panel.html',
  styleUrl: './resume-settings-panel.css'
})
export class ResumeSettingsPanel {
  settings = input<ResumeSettings>({
    themeId: 'blue',
    layoutId: 'default',
    fontFamilyId: 'vazirmatn',
    technicalSkillsDisplay: 'cards',
    softSkillsDisplay: 'radialBar',
    sections: {
      technicalSkills: true,
      softSkills: true,
      certificates: true,
      socialMedia: true,
      projects: true,
      languages: true,
      careerInfo: false
    },
    display: {
      showLastUpdated: false,
      showQrCode: false,
      qrCodeContent: '',
      showCertificateThumbnails: true,
      showPersonalInfoLabels: true,
      showCareerInfo: false
    }
  });

  settingsChanged = output<ResumeSettings>();

  themes = Object.entries(THEME_PRESETS).map(([id, t]) => ({ id: id as ThemeId, ...t }));
  layouts = Object.entries(LAYOUT_PRESETS).map(([id, l]) => ({ id: id as LayoutId, ...l }));
  fontOptions = computed(() => FONT_PRESETS.map(f => ({ value: f.id, label: f.name })));
  layoutOptions = computed(() => this.layouts.map(l => ({ value: l.id, label: `${l.name} — ${l.description}` })));
  skillDisplayOptions = SKILL_DISPLAY_OPTIONS;

  update(partial: Partial<ResumeSettings>): void {
    this.settingsChanged.emit({ ...this.settings(), ...partial });
  }

  updateDisplay(partial: Partial<ResumeDisplayOptions>): void {
    this.settingsChanged.emit({
      ...this.settings(),
      display: { ...this.settings().display, ...partial }
    });
  }

  toggleSection(key: keyof ResumeSettings['sections']): void {
    this.settingsChanged.emit({
      ...this.settings(),
      sections: { ...this.settings().sections, [key]: !this.settings().sections[key] }
    });
  }

  isSectionEnabled(key: keyof ResumeSettings['sections']): boolean {
    return this.settings().sections[key];
  }

  onFontChange(id: FontFamilyId | ''): void {
    if (id) this.update({ fontFamilyId: id });
  }

  onLayoutChange(id: LayoutId | ''): void {
    if (id) this.update({ layoutId: id });
  }

  onSkillDisplayChange(field: 'technicalSkillsDisplay' | 'softSkillsDisplay', value: SkillDisplayType | ''): void {
    if (value) this.update({ [field]: value });
  }
}
