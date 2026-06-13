import { Component, inject } from '@angular/core';
import { AlertService, AlertState } from '../../../core/services/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.html',
  styleUrl: './alert.css'
})
export class Alert {
  readonly alertService = inject(AlertService);

  onBackdropClick(alert: AlertState): void {
    if (alert.mode === 'alert') {
      this.alertService.dismiss();
    }
  }
}
