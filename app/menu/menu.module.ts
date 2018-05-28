import { NgModule }      from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }        from '@angular/forms';

import { MenuService }  from './menu.service';
import { MenuToolsService }  from './menu-tools.service';
import { MenuComponent }  from './menu.component';
import { MenuLayersItvComponent, MenuSubLayersComponent, MenuLayersComponent, MenuLegendItvComponent, MenuLegendComponent, MenuToolsComponent, MenuThemesComponent } from '../menu';

import { NgDraggableModule } from 'angular-draggable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    //3rd party declarations
    NgDraggableModule
  ],
  declarations: [
    MenuComponent,
    MenuThemesComponent,
    MenuToolsComponent,
    MenuSubLayersComponent,
    MenuLayersItvComponent, MenuLayersComponent,
    MenuLegendItvComponent, MenuLegendComponent
  ],
  exports: [MenuComponent],
  providers: [MenuService, MenuToolsService]
})
export class MenuModule { }
