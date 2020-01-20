import { Routes, RouterModule } from '@angular/router'

import forIn from 'lodash-es/forIn';

import { ThemesComponent } from './themes.component';
import { NotFoundComponent } from './not-found.component';
import { MapViewComponent } from './components/common/map-view.component';
import { MapOptions } from './options';

let defaultThemesRoutes =  [];

function addDefaultRoutes() {
  forIn(MapOptions.themes, (layer) => {
    if (!layer.custom && layer.production ) {
			const id = layer.id;
      defaultThemesRoutes.push({ path: id, loadChildren: './themes/default/default-theme.module#DefaultThemeModule' })
    }
  });
};

addDefaultRoutes();

let mapRoutes: Routes = [
  { path: '', pathMatch: 'full', component: ThemesComponent },
  { path: '', component: MapViewComponent, children: [
		{ path: 'darzeliai', loadChildren: './themes/kindergartens/kindergartens.module#KindergartensModule' },
		{ path: 'projektai', loadChildren: './themes/projects/projects.module#ProjectsModule' },
		{ path: 'pastatai', loadChildren: './themes/buildings/buildings.module#BuildingsModule' },
    { path: 'kvartaline-renovacija', redirectTo: 'pastatai' }
  ]}
]; 

// add development routes
if (process.env.NODE_ENV !== 'production') {
  mapRoutes[1] = { 
    path: '', component: MapViewComponent, children: [
      ...mapRoutes[1].children,
      { path: 'atlieku-tvarkymas', loadChildren: './themes/waist/waist.module#WaistModule' }
      // { path: 'kvartaline-renovacija', loadChildren: './themes/quarters/quarters.module#QuartersModule' }
    ]
  };
 
}

// add rest routes
mapRoutes[1] = { 
  path: '', component: MapViewComponent, children: [
    ...mapRoutes[1].children,
    ...defaultThemesRoutes
  ]
};

mapRoutes = [
  ...mapRoutes,
  // add page not found component (only in development)
  // using expressjs in production mode and redirecting to home page
  { path: '**', component: NotFoundComponent } 
] 

export const Routing = RouterModule.forRoot(mapRoutes);
