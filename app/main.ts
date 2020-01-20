import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
//import { environment } from '../environments/environment';
import { AppModule } from './app.module';

import './styles/@angular/material/prebuilt-themes/indigo-pink.css';
import './styles/page.css';
import './styles/sass/styles.scss';

// using process.env.NODE_ENV, can use environment const instead
// if (environment.production) {
if (process.env.NODE_ENV === 'production') {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
