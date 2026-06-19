import { bootstrapApplication } from '@angular/platform-browser';
import { injectSpeedInsights } from '@vercel/speed-insights';

import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig)
  .then(() => {
    // Initialize Vercel Speed Insights after the app is bootstrapped
    injectSpeedInsights();
  })
  .catch((err) => console.error(err));
