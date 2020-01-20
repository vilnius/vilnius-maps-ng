import { NgModule } from '@angular/core';

import { MapWaistComponent } from './map-waist.component';
import { WaistStatisticComponent } from './waist-statistic.component';
import { WaistLayersService } from './waist-layers.service';
import { ShareModule } from '../../share.module';
import { WaistRouting } from './waist.routing';

import { CountUpModule } from 'countup.js-angular2';

@NgModule({
  imports: [
    ShareModule,
    WaistRouting,
    CountUpModule
  ],
  declarations: [MapWaistComponent,WaistStatisticComponent],
  providers: [WaistLayersService]
})
export class WaistModule { }
