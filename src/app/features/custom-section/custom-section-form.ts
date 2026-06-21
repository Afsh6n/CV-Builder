import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CUSTOM_SECTION_ICON_OPTIONS } from '@app/core/constants/app.constants';
import { CustomSection, CustomSectionEntry } from '@app/core/types/resume.types';
import { createEmptyCustomSection, createEmptyCustomSectionEntry } from '@app/core/utils/resume.factories';
import { EditorAddButton } from '@app/shared/components/editor-add-button/editor-add-button';
import { EditorFormActions } from '@app/shared/components/editor-form-actions/editor-form-actions';
import { EditorItemActions } from '@app/shared/components/editor-item-actions/editor-item-actions';
import { OrderButtons } from '@app/shared/components/order-buttons/order-buttons';
import { ResumeIcon, ResumeIconName } from '@app/shared/components/resume-icon/resume-icon';
import { SegmentedControl } from '@app/shared/components/segmented-control/segmented-control';
import { moveItemInList } from '@app/shared/utils/array-order.util';
import { ListEditController } from '@app/shared/utils/list-edit.controller';

@Component({
  selector: 'app-custom-section-form',
  imports: [
    FormsModule,
    SegmentedControl,
    ResumeIcon,
    OrderButtons,
    EditorItemActions,
    EditorFormActions,
    EditorAddButton
  ],
  templateUrl: './custom-section-form.html',
  styleUrl: './custom-section-form.css'
})
export class CustomSectionForm {
  sections = input<CustomSection[]>([]);
  sectionsChanged = output<CustomSection[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  iconOptions = CUSTOM_SECTION_ICON_OPTIONS;
  private newlyAddedEntryIds = new Map<string, Set<string>>();

  private readonly editCtrl = new ListEditController<CustomSection>(
    () => this.sections(),
    items => this.sectionsChanged.emit(items),
    () => this.editingId(),
    id => this.editModeChanged.emit(id),
    createEmptyCustomSection
  );

  addSection = (): void => { this.editCtrl.add(); };

  removeSection(id: string): void {
    this.editCtrl.remove(id);
    this.newlyAddedEntryIds.delete(id);
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
    const set = this.newlyAddedEntryIds.get(sectionId) ?? new Set<string>();
    set.add(entry.id);
    this.newlyAddedEntryIds.set(sectionId, set);
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
          ? { ...s, entries: s.entries.map(e => (e.id === entryId ? { ...e, [field]: value } : e)) }
          : s
      )
    );
  }

  moveSection(id: string, direction: 'up' | 'down'): void {
    const next = moveItemInList(this.sections(), id, direction);
    if (next) this.sectionsChanged.emit(next);
  }

  startEditing = (id: string): void => { this.editCtrl.startEditing(id); };
  isEditing = (id: string): boolean => this.editCtrl.isEditing(id);

  saveEditing(sectionId: string): void {
    this.newlyAddedEntryIds.delete(sectionId);
    this.editCtrl.completeSave(sectionId);
  }

  cancelEditing(sectionId: string): void {
    const addedEntries = this.newlyAddedEntryIds.get(sectionId);
    if (addedEntries?.size) {
      this.sectionsChanged.emit(
        this.sections().map(s =>
          s.id === sectionId
            ? { ...s, entries: s.entries.filter(e => !addedEntries.has(e.id)) }
            : s
        )
      );
    }
    this.newlyAddedEntryIds.delete(sectionId);
    this.editCtrl.cancel(sectionId);
  }

  iconSegments() {
    return this.iconOptions.map(o => ({ value: o.value, label: o.label }));
  }

  onIconChange(sectionId: string, icon: string): void {
    this.updateSection(sectionId, 'icon', icon as ResumeIconName);
  }
}
