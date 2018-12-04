import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';

import { MapKindergartensComponent } from './map-kindergartens.component';
import { ShareModule } from '../../share.module';
import { KindergartensRouting } from './kindergartens.routing';
import { SidebarKindergartensComponent } from '../../map-widgets';
import { SearchKindergartensComponent } from '../../map-widgets/search-kindergartens.component';
import { MapKindergartensService } from './map-kindergartens.service';
import { KindergartensTooltipService } from './kindergartens-tooltip.service';
import { KindergartensLayersService } from './kindergartens-layers.service';

@NgModule({
  imports: [
    ShareModule,
    MatCheckboxModule,
    MatExpansionModule,
    KindergartensRouting
  ],
  declarations: [
    MapKindergartensComponent,
    SidebarKindergartensComponent,
    SearchKindergartensComponent
  ],
  providers: [MapKindergartensService, KindergartensTooltipService, KindergartensLayersService]
})
export class KindergartensModule {}
