import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ResumeIcon } from '../resume-icon/resume-icon';

@Component({
  selector: 'app-editor-item-actions',
  imports: [ResumeIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="view-mode-actions">
      <button
        type="button"
        class="action-btn"
        (click)="edit.emit()"
        [attr.title]="editLabel()"
        [attr.aria-label]="editLabel()"
      >
        <app-resume-icon name="edit" [size]="16" />
      </button>
      <button
        type="button"
        class="action-btn delete"
        (click)="delete.emit()"
        [attr.title]="deleteLabel()"
        [attr.aria-label]="deleteLabel()"
      >
        <app-resume-icon name="delete" [size]="16" />
      </button>
    </div>
  `
})
export class EditorItemActions {
  editLabel = input('ویرایش');
  deleteLabel = input('حذف');
  edit = output<void>();
  delete = output<void>();
}
