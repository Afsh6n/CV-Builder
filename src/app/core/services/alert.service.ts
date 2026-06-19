import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertState {
  message: string;
  type: AlertType;
  title?: string;
  mode: 'alert' | 'confirm';
  resolve: (value: boolean) => void;
  html?: boolean;
  donationLink?: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  readonly state = signal<AlertState | null>(null);

  show(message: string, type: AlertType = 'info', title?: string, html?: boolean, donationLink?: string): Promise<void> {
    return new Promise(resolve => {
      this.state.set({
        message,
        type,
        title,
        mode: 'alert',
        html,
        donationLink,
        resolve: () => {
          this.state.set(null);
          resolve();
        }
      });
    });
  }

  success(message: string, title?: string, html?: boolean, donationLink?: string): Promise<void> {
    return this.show(message, 'success', title, html, donationLink);
  }

  error(message: string, title?: string, html?: boolean): Promise<void> {
    return this.show(message, 'error', title, html);
  }

  warning(message: string, title?: string, html?: boolean): Promise<void> {
    return this.show(message, 'warning', title, html);
  }

  confirm(message: string, title?: string): Promise<boolean> {
    return new Promise(resolve => {
      this.state.set({
        message,
        type: 'warning',
        title,
        mode: 'confirm',
        resolve: (ok: boolean) => {
          this.state.set(null);
          resolve(ok);
        }
      });
    });
  }

  dismiss(ok = true): void {
    this.state()?.resolve(ok);
  }
}
