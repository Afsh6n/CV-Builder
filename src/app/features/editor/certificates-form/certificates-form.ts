import { Component, input, output } from '@angular/core';

import { Certificate } from '../../../core/types/resume.types';
import { createEmptyCertificate } from '../../../core/utils/resume.factories';
import { EditorAddButton } from '../../../shared/components/editor-add-button/editor-add-button';
import { EditorFormActions } from '../../../shared/components/editor-form-actions/editor-form-actions';
import { EditorItemActions } from '../../../shared/components/editor-item-actions/editor-item-actions';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { OrderButtons } from '../../../shared/components/order-buttons/order-buttons';
import { ResumeIcon } from '../../../shared/components/resume-icon/resume-icon';
import { moveItemInList } from '../../../shared/utils/array-order.util';
import { ListEditController } from '../../../shared/utils/list-edit.controller';
import { PersianDateInput } from '../persian-date-input/persian-date-input';

@Component({
  selector: 'app-certificates-form',
  imports: [
    PersianDateInput,
    ResumeIcon,
    FormField,
    FormInput,
    OrderButtons,
    EditorItemActions,
    EditorFormActions,
    EditorAddButton
  ],
  templateUrl: './certificates-form.html',
  styleUrl: './certificates-form.css'
})
export class CertificatesForm {
  certificates = input<Certificate[]>([]);
  certificatesChanged = output<Certificate[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  private readonly editCtrl = new ListEditController<Certificate>(
    () => this.certificates(),
    items => this.certificatesChanged.emit(items),
    () => this.editingId(),
    id => this.editModeChanged.emit(id),
    createEmptyCertificate
  );

  addEntry = (): void => { this.editCtrl.add(); };
  removeEntry = (id: string): void => { this.editCtrl.remove(id); };
  startEditing = (id: string): void => { this.editCtrl.startEditing(id); };
  saveEditing = (id: string): void => { this.editCtrl.completeSave(id); };
  cancelEditing = (id: string): void => { this.editCtrl.cancel(id); };
  isEditing = (id: string): boolean => this.editCtrl.isEditing(id);

  updateEntry(id: string, field: keyof Certificate, value: unknown): void {
    const updated = this.certificates().map(c => (c.id === id ? { ...c, [field]: value } : c));
    this.certificatesChanged.emit(updated);
  }

  toggleCurrent(id: string): void {
    const updated = this.certificates().map(c =>
      c.id === id ? { ...c, current: !c.current, validTo: '' } : c
    );
    this.certificatesChanged.emit(updated);
  }

  onImageSelected(id: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => this.updateEntry(id, 'imageData', reader.result as string);
    reader.readAsDataURL(file);
  }

  moveEntry(id: string, direction: 'up' | 'down'): void {
    const next = moveItemInList(this.certificates(), id, direction);
    if (next) this.certificatesChanged.emit(next);
  }
}
