import {Routes, RouterModule} from '@angular/router'

import { MapDefaultComponent, MapBuildingsComponent } from './themes';
import { MapComponent } from './map.component';
import { ThemesComponent } from './themes.component';

const MAP_ROUTS: Routes = [
  { path: '', component: ThemesComponent },
  { path: 'projektai', component: MapComponent },
  { path: 'pastatai', component: MapBuildingsComponent },
  //add page not found component
  { path: '**', component: MapDefaultComponent }
  // ,
  // { path: '',  redirectTo: '/projektai', pathMatch: 'full' }
];

export const Routing = RouterModule.forRoot(MAP_ROUTS);
