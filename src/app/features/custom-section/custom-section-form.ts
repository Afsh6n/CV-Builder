import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CUSTOM_SECTION_ICON_OPTIONS } from '../../core/constants/app.constants';
import { SegmentedControl } from '../../shared/components/segmented-control/segmented-control';
import { ResumeIcon, ResumeIconName } from '../../shared/components/resume-icon/resume-icon';
import { OrderButtons } from '../../shared/components/order-buttons/order-buttons';
import { moveItemInList } from '../../shared/utils/array-order.util';
import { CustomSection, CustomSectionEntry } from '../../core/types/resume.types';
import { createEmptyCustomSection, createEmptyCustomSectionEntry } from '../../core/utils/resume.factories';

@Component({
  selector: 'app-custom-section-form',
  imports: [CommonModule, FormsModule, SegmentedControl, ResumeIcon, OrderButtons],
  templateUrl: './custom-section-form.html',
  styleUrl: './custom-section-form.css'
})
export class CustomSectionForm {
  sections = input<CustomSection[]>([]);
  sectionsChanged = output<CustomSection[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  iconOptions = CUSTOM_SECTION_ICON_OPTIONS;

  addSection(): void {
    const section = createEmptyCustomSection();
    this.sectionsChanged.emit([...this.sections(), section]);
    this.editModeChanged.emit(section.id);
  }

  removeSection(id: string): void {
    this.sectionsChanged.emit(this.sections().filter(s => s.id !== id));
    if (this.editingId() === id) this.editModeChanged.emit(null);
  }

  updateSection(id: string, field: keyof CustomSection, value: unknown): void {
    this.sectionsChanged.emit(
      this.sections().map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  addEntry(sectionId: string): void {
    const entry = createEmptyCustomSectionEntry();
    this.sectionsChanged.emit(
      this.sections().map(s =>
        s.id === sectionId ? { ...s, entries: [...s.entries, entry] } : s
      )
    );
  }

  removeEntry(sectionId: string, entryId: string): void {
    this.sectionsChanged.emit(
      this.sections().map(s =>
        s.id === sectionId ? { ...s, entries: s.entries.filter(e => e.id !== entryId) } : s
      )
    );
  }

  updateEntry(sectionId: string, entryId: string, field: keyof CustomSectionEntry, value: unknown): void {
    this.sectionsChanged.emit(
      this.sections().map(s =>
        s.id === sectionId
          ? {
              ...s,
              entries: s.entries.map(e => (e.id === entryId ? { ...e, [field]: value } : e))
            }
          : s
      )
    );
  }

  moveSection(id: string, direction: 'up' | 'down'): void {
    const next = moveItemInList(this.sections(), id, direction);
    if (next) this.sectionsChanged.emit(next);
  }

  moveEntry(sectionId: string, entryId: string, direction: 'up' | 'down'): void {
    this.sectionsChanged.emit(
      this.sections().map(s => {
        if (s.id !== sectionId) return s;
        const next = moveItemInList(s.entries, entryId, direction);
        return next ? { ...s, entries: next } : s;
      })
    );
  }

  startEditing(id: string): void { this.editModeChanged.emit(id); }
  stopEditing(): void { this.editModeChanged.emit(null); }
  isEditing(id: string): boolean { return this.editingId() === id; }

  iconSegments(section: CustomSection) {
    return this.iconOptions.map(o => ({ value: o.value, label: o.label }));
  }

  onIconChange(sectionId: string, icon: string): void {
    this.updateSection(sectionId, 'icon', icon as ResumeIconName);
  }
}
