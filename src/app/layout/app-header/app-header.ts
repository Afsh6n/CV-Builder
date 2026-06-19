import { Component} from '@angular/core';

import { APP_META } from '../../core/constants/app.constants';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css'
})
export class AppHeader {
  readonly meta = APP_META;
}
