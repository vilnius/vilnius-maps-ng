import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapWaistComponent } from './map-waist.component';

const waistRoutes: Routes = [
  { path: '', component: MapWaistComponent }
];

export const WaistRouting: ModuleWithProviders = RouterModule.forChild(waistRoutes);
