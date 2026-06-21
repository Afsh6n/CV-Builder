import { Component, input, output } from '@angular/core';
import { FormField } from '@app/shared/components/form-field/form-field';
import { FormInput } from '@app/shared/components/form-input/form-input';
import { PersianDateInput } from '../persian-date-input/persian-date-input';
import { OrderButtons } from '@app/shared/components/order-buttons/order-buttons';
import { ResumeIcon } from '@app/shared/components/resume-icon/resume-icon';
import { EditorItemActions } from '@app/shared/components/editor-item-actions/editor-item-actions';
import { EditorFormActions } from '@app/shared/components/editor-form-actions/editor-form-actions';
import { EditorAddButton } from '@app/shared/components/editor-add-button/editor-add-button';
import { Project } from '@app/core/types/resume.types';
import { ListEditController } from '@app/shared/utils/list-edit.controller';
import { createEmptyProject } from '@app/core/utils/resume.factories';
import { moveItemInList } from '@app/shared/utils/array-order.util';


@Component({
  selector: 'app-projects-form',
  imports: [
    FormField,
    FormInput,
    PersianDateInput,
    OrderButtons,
    ResumeIcon,
    EditorItemActions,
    EditorFormActions,
    EditorAddButton
  ],
  templateUrl: './projects-form.html',
  styleUrl: './projects-form.css'
})
export class ProjectsForm {
  projects = input<Project[]>([]);
  projectsChanged = output<Project[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  private readonly editCtrl = new ListEditController<Project>(
    () => this.projects(),
    items => this.projectsChanged.emit(items),
    () => this.editingId(),
    id => this.editModeChanged.emit(id),
    createEmptyProject
  );

  addEntry = (): void => { this.editCtrl.add(); };
  removeEntry = (id: string): void => { this.editCtrl.remove(id); };
  startEditing = (id: string): void => { this.editCtrl.startEditing(id); };
  isEditing = (id: string): boolean => this.editCtrl.isEditing(id);

  updateEntry(id: string, field: keyof Project, value: unknown): void {
    const updated = this.projects().map(p => (p.id === id ? { ...p, [field]: value } : p));
    this.projectsChanged.emit(updated);
  }

  moveEntry(id: string, direction: 'up' | 'down'): void {
    const next = moveItemInList(this.projects(), id, direction);
    if (next) this.projectsChanged.emit(next);
  }

  stopEditing(id: string): void {
    const project = this.projects().find(p => p.id === id);
    if (project && !project.title.trim()) return;
    this.editCtrl.completeSave(id);
  }

  cancelEditing(id: string): void {
    this.editCtrl.cancel(id);
  }
}
