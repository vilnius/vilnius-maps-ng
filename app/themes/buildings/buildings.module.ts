import { NgModule } from '@angular/core';

import { MapBuildingsComponent } from './map-buildings.component';
import { ShareModule } from '../../share.module';
import { SidebarBuildingsComponent } from '../../map-widgets';
import { BuildingsRouting } from './buildings.routing';
import { BuildingsTooltipService } from './buildings-tooltip.service';
import { BuildingsLayersService } from './buildings-layers.service';

@NgModule({
  imports: [
    ShareModule,
    BuildingsRouting
  ],
  declarations: [MapBuildingsComponent, SidebarBuildingsComponent],
	providers: [BuildingsTooltipService, BuildingsLayersService]
})
export class BuildingsModule { }
