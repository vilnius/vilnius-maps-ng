import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { CommonWidgetsComponent } from './common-widgets.component';
import { ShareModule } from './share.module';
import { MenuModule } from './menu/menu.module';

import { Routing } from './app.routing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemesComponent } from './themes.component';
import { MapViewComponent } from './components/common/map-view.component';
import { NotFoundComponent } from './not-found.component';
import { ViewService } from './themes/default/view.service';
import { MenuService } from './menu/menu.service';
import { MapService } from './map.service';
import { MapOptions } from './options';
import { BasemapsService } from './map-widgets/basemaps.service';

import { environment } from '../environments/environment';

import * as Raven from 'raven-js';

if (environment.production) {
  console.log('environment prod', environment.production);
}

// set prodcution builds on build time usin env
if (process.env.NODE_ENV === 'production') {
  Raven
    .config(process.env.SENTRY_DSN)
    .install();
}

export class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Raven.captureException(err);
  }
}

export function VilniusMapsErrorHandler() {
  if (process.env.NODE_ENV === 'production') {
    return new RavenErrorHandler();
  } else {
    return new ErrorHandler();
  }
}


@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    Routing,
    ShareModule.forRoot(),
    MenuModule,
    BrowserAnimationsModule
  ],
  declarations: [
    AppComponent,
    CommonWidgetsComponent,
    ThemesComponent,
    MapViewComponent,
    NotFoundComponent
  ],
  providers: [
    { provide: ErrorHandler, useFactory: VilniusMapsErrorHandler },
    ViewService,
    MenuService,
    MapService,
    BasemapsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
