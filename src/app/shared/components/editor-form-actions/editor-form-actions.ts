import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-editor-form-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" (click)="cancel.emit()">
        {{ cancelLabel() }}
      </button>
      @if (showDanger()) {
        <button type="button" class="btn btn-danger" (click)="danger.emit()">
          {{ dangerLabel() }}
        </button>
      }
      <button type="button" class="btn btn-primary" (click)="save.emit()">
        {{ saveLabel() }}
      </button>
    </div>
  `
})
export class EditorFormActions {
  cancelLabel = input('انصراف');
  saveLabel = input('ذخیره');
  dangerLabel = input('حذف');
  showDanger = input(false);
  cancel = output<void>();
  save = output<void>();
  danger = output<void>();
}
