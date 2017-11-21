import {Routes, RouterModule} from '@angular/router'

import { MapDefaultComponent } from './themes/default/map-default.component';
import { MapComponent } from './map.component';
import { ThemesComponent } from './themes.component';

const MAP_ROUTS: Routes = [
  { path: '', component: ThemesComponent },
  { path: 'projektai', component: MapComponent },
  //add page not found component
  { path: '**', component: MapDefaultComponent }
  // ,
  // { path: '',  redirectTo: '/projektai', pathMatch: 'full' }
];

export const Routing = RouterModule.forRoot(MAP_ROUTS);
