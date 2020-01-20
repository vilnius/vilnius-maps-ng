import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapQuartersComponent } from './map-quarters.component';

const quartersRoutes: Routes = [
  { path: '', component: MapQuartersComponent }
];

export const QuartersRouting: ModuleWithProviders = RouterModule.forChild(quartersRoutes);
