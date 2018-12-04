import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
 import { MapKindergartensComponent } from './map-kindergartens.component';

const kindergartensRoutes: Routes = [
  { path: '', component: MapKindergartensComponent }
];

export const KindergartensRouting: ModuleWithProviders = RouterModule.forChild(kindergartensRoutes);
