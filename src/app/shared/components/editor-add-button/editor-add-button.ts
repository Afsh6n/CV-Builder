import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-editor-add-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="btn btn-add" (click)="clicked.emit()">
      + {{ label() }}
    </button>
  `
})
export class EditorAddButton {
  label = input.required<string>();
  clicked = output<void>();
}
