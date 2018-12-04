import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapDefaultComponent } from './map-default.component';

const defaultThemeRoutes: Routes = [
	{ path: '', component: MapDefaultComponent }
];

export const DefaultThemeRouting: ModuleWithProviders = RouterModule.forChild(defaultThemeRoutes);
