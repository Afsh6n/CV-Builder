import { bootstrapApplication } from '@angular/platform-browser';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig)
  .then(() => {
    // Initialize Vercel Speed Insights after the app is bootstrapped
    injectSpeedInsights();
    // Initialize Vercel Web Analytics after the app is bootstrapped
    inject();
  })
  .catch((err) => console.error(err));
