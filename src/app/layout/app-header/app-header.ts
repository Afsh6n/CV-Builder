import { Component, input, output } from '@angular/core';
import { APP_META } from '../../core/constants/app.constants';
import { ResumeIcon } from '../../shared/components/resume-icon/resume-icon';

@Component({
  selector: 'app-header',
  imports: [ResumeIcon],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css'
})
export class AppHeader {
  readonly meta = APP_META;
}
