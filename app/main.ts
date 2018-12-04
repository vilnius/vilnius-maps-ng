import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
//import { environment } from '../environments/environment';
import { AppModule } from './app.module';

// using process.env.NODE_ENV, can use environment const instead
// if (environment.production) {
if (process.env.NODE_ENV === 'production') {
  require("./styles/page.css");
  require("./styles/main.css");
  require("./styles/normalize.css");
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
