import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { PersianDateInput } from '../persian-date-input/persian-date-input';
import { OrderButtons } from '../../../shared/components/order-buttons/order-buttons';
import { ResumeIcon } from '../../../shared/components/resume-icon/resume-icon';
import { moveItemInList } from '../../../shared/utils/array-order.util';
import { Project } from '../../../core/types/resume.types';
import { createEmptyProject } from '../../../core/utils/resume.factories';
@Component({
  selector: 'app-projects-form',
  imports: [
    CommonModule,
    FormField,
    FormInput,
    PersianDateInput,
    OrderButtons,
    ResumeIcon
  ],
  templateUrl: './projects-form.html',
  styleUrl: './projects-form.css'
})
export class ProjectsForm {
  projects = input<Project[]>([]);
  projectsChanged = output<Project[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  addEntry(): void {
    const entry = createEmptyProject();
    this.projectsChanged.emit([...this.projects(), entry]);
    this.editModeChanged.emit(entry.id);
  }

  removeEntry(id: string): void {
    this.projectsChanged.emit(this.projects().filter(p => p.id !== id));
    if (this.editingId() === id) this.editModeChanged.emit(null);
  }

  updateEntry(id: string, field: keyof Project, value: unknown): void {
    const updated = this.projects().map(p => (p.id === id ? { ...p, [field]: value } : p));
    this.projectsChanged.emit(updated);
  }

  moveEntry(id: string, direction: 'up' | 'down'): void {
    const next = moveItemInList(this.projects(), id, direction);
    if (next) this.projectsChanged.emit(next);
  }

  startEditing(id: string): void {
    this.editModeChanged.emit(id);
  }

  stopEditing(id: string): void {
    const p = this.projects().find(x => x.id === id);
    if (p && !p.title.trim()) return;
    this.editModeChanged.emit(null);
  }

  isEditing(id: string): boolean {
    return this.editingId() === id;
  }
}
