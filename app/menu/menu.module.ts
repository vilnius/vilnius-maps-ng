import { NgModule }      from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }        from '@angular/forms';

import { MenuComponent }  from './menu.component';
import { MenuLayersItvComponent, MenuSubLayersComponent, MenuLayersComponent, MenuLegendItvComponent, MenuLegendComponent, MenuToolsComponent, MenuThemesComponent } from '../menu';
import { MenuService }  from './menu.service';

import { Draggable } from 'ng2draggable';

@NgModule({
  imports: [
    CommonModule, FormsModule
  ],
  declarations: [
    MenuComponent,
    MenuThemesComponent,
    MenuToolsComponent,
    MenuSubLayersComponent,
    MenuLayersItvComponent, MenuLayersComponent,
    MenuLegendItvComponent, MenuLegendComponent,
    //3rd party declarations
    Draggable
  ],
  exports: [MenuComponent],
  providers: [MenuService]
})
export class MenuModule { }
