import { Component } from '@angular/core';
import { APP_FOOTER } from '../../core/constants/app.constants';
import { ResumeIcon } from '../../shared/components/resume-icon/resume-icon';

@Component({
  selector: 'app-footer',
  imports: [ResumeIcon],
  templateUrl: './app-footer.html',
  styleUrl: './app-footer.css'
})
export class AppFooter {
  readonly footer = APP_FOOTER;
  readonly year = new Date().getFullYear();
}