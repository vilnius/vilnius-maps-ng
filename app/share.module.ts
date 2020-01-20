import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { FormsModule } from '@angular/forms';

import { HideElementseDirective } from './directives/hideElement.directive';
import { MetaService } from './services/meta.service';
import { MapDefaultService } from './themes/default/map-default.service';
import { ProjectsListService } from './projects-list/projects-list.service';
import { ProjectsFilterService } from './projects-list/projects-filter.service';
import { SearchService } from './search/search.service';
import { SelectorsService } from './selectors/selectors.service';
import { MapWidgetsService } from './map-widgets/map-widgets.service';
import { IdentifyService } from './services/identify/identify.service';
import { FeatureQueryService } from './query/feature-query.service';
import { ShareButtonService } from './services/share-button.service';
import { ThemeNameService } from './services/theme-name.service';
import { PointAddRemoveService } from './query/point-add-remove.service';
import { ScaleAndLogoComponent, BasemapToggle, CreditsCompponent, CompassComponent, MaintenanceComponent, LocateCenterComponent } from './map-widgets';

import { RgbaColorDirective } from './map-widgets';


import 'hammerjs';
import { NgxPopperModule } from 'ngx-popper';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MapStreamService } from './services/streams/map-stream.service';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PerfectScrollbarModule,
    //3rd party imports
    MaterialModule,
    NgxPopperModule
  ],
  declarations: [
    HideElementseDirective,
    RgbaColorDirective,
    ScaleAndLogoComponent,
    BasemapToggle,
    CreditsCompponent,
    CompassComponent,
    MaintenanceComponent,
    LocateCenterComponent
  ],
  exports: [
    HideElementseDirective,
    RgbaColorDirective,
    CommonModule,
    FormsModule,
    PerfectScrollbarModule,
    MaterialModule,
    NgxPopperModule,
    ScaleAndLogoComponent,
    BasemapToggle,
    CreditsCompponent,
    CompassComponent,
    MaintenanceComponent,
    LocateCenterComponent
  ]
})
export class ShareModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ShareModule,
      providers: [
        MetaService,
        MapDefaultService,
        ProjectsListService,
        ProjectsFilterService,
        SearchService,
        SelectorsService,
        MapWidgetsService,
        FeatureQueryService,
        IdentifyService,
        ShareButtonService,
        ThemeNameService,
        PointAddRemoveService,
        MapStreamService,
        {
          provide: PERFECT_SCROLLBAR_CONFIG,
          useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
        }
      ]
    }
  }
}
