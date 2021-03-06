import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ShareModule } from '../share.module';
import { MenuToolsService } from './menu-tools.service';
import { ThreeDExtractService } from "./tools/threed-extract/threed-extract.service";
import { MeasureMapService } from './tools/measure/measure-map.service'; // re-export the named thing
import { ProfileToolService } from './tools/profile/profile-tool.service'; // re-export the named thing
import { SwipeToolService } from './tools/swipe/swipe-tool.service'; // re-export the named thing
import { ToolsNameService } from './tools-name.service'; // re-export the named thing
// import { DwgService } from "./tools/dwg/dwg.service";
import { MenuComponent } from './menu.component';
import {
  MenuLayersItvComponent,
  MenuSubLayersComponent,
  MenuLayersComponent,
  MenuLegendItvComponent,
  MenuLegendComponent,
  MenuToolsComponent,
  MenuThemesComponent,
  ThreeDExtractComponent,
  MeasureMapComponent,
  MeasureContainerComponent,
  ExtractContainerComponent,
  ProfileToolComponent,
  ProfileToolContainerComponent,
  ProfileContainerComponent,
  ProfileElevationComponent,
  //PrintMapComponent,
	SwipeToolComponent,
	SwipeToolContainerComponent,
  SwipeContainerComponent,
  DwgComponent,
  DwgContainerComponent
} from '../menu';

import { NgDraggableModule } from 'angular-draggable';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ShareModule,
    //3rd party declarations
    PerfectScrollbarModule,
    NgDraggableModule
  ],
  declarations: [
    MenuComponent,
    MenuThemesComponent,
    MenuToolsComponent,
    MenuSubLayersComponent,
    MenuLayersItvComponent, MenuLayersComponent,
    MenuLegendItvComponent, MenuLegendComponent,
    ThreeDExtractComponent, ExtractContainerComponent,
    MeasureMapComponent, MeasureContainerComponent,
    ProfileToolComponent, ProfileToolContainerComponent, ProfileContainerComponent, ProfileElevationComponent,
    //PrintMapComponent,
    SwipeToolComponent, SwipeToolContainerComponent, SwipeContainerComponent,
    DwgComponent, DwgContainerComponent
  ],
  exports: [MenuComponent, MenuThemesComponent],
  providers: [
    MenuToolsService,
    ThreeDExtractService,
    MeasureMapService,
    ProfileToolService,
    SwipeToolService,
    ToolsNameService,
    // DwgService
  ]
})
export class MenuModule { }
