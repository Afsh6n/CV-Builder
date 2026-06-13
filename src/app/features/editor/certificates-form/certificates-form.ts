import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersianDateInput } from '../persian-date-input/persian-date-input';
import { ResumeIcon } from '../../../shared/components/resume-icon/resume-icon';
import { FormField } from '../../../shared/components/form-field/form-field';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { OrderButtons } from '../../../shared/components/order-buttons/order-buttons';
import { moveItemInList } from '../../../shared/utils/array-order.util';
import { Certificate } from '../../../core/types/resume.types';
import { createEmptyCertificate } from '../../../core/utils/resume.factories';

@Component({
  selector: 'app-certificates-form',
  imports: [
    CommonModule,
    PersianDateInput,
    ResumeIcon,
    FormField,
    FormInput,
    OrderButtons
  ],
  templateUrl: './certificates-form.html',
  styleUrl: './certificates-form.css'
})
export class CertificatesForm {
  certificates = input<Certificate[]>([]);
  certificatesChanged = output<Certificate[]>();
  editingId = input<string | null>(null);
  editModeChanged = output<string | null>();

  addEntry(): void {
    const entry = createEmptyCertificate();
    this.certificatesChanged.emit([...this.certificates(), entry]);
    this.editModeChanged.emit(entry.id);
  }

  removeEntry(id: string): void {
    this.certificatesChanged.emit(this.certificates().filter(c => c.id !== id));
    if (this.editingId() === id) this.editModeChanged.emit(null);
  }

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
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => this.updateEntry(id, 'imageData', reader.result as string);
    reader.readAsDataURL(file);
  }

  moveEntry(id: string, direction: 'up' | 'down'): void {
    const next = moveItemInList(this.certificates(), id, direction);
    if (next) this.certificatesChanged.emit(next);
  }

  startEditing(id: string): void { this.editModeChanged.emit(id); }
  stopEditing(): void { this.editModeChanged.emit(null); }
  isEditing(id: string): boolean { return this.editingId() === id; }
}
