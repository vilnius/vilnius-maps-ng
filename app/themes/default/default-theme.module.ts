import { NgModule } from '@angular/core';

//import { MapViewComponent } from '../../components/common/map-view.component';
import { MapDefaultComponent } from './map-default.component';
import { ShareModule } from '../../share.module';
import { DefaultThemeRouting } from './default-theme.routing';

@NgModule({
  imports: [
    ShareModule,
    DefaultThemeRouting
  ],
  declarations: [
		//MapViewComponent,
		MapDefaultComponent]
})
export class DefaultThemeModule { }
