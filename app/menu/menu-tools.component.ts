import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MenuToolsService } from './menu-tools.service';

import { ToolsList } from './tools.list';

@Component({
  selector: 'menu-tools',
  templateUrl: './app/menu/menu-tools.component.html',
  styles: [`
    a, a:hover {
      color: inherit;
    }
  `],
  providers: [MenuToolsService]
})

export class MenuToolsComponent {
	@Input() currentTheme: string;
  // set  toolsActive to false in parent component and get back menu wrapper for mobile
  @Output() close: EventEmitter<any> = new EventEmitter();

  toolList = ToolsList;

  closeToggle() {
    window.location.hash = "#";
    // emit close event
    this.close.emit(false);
  }

}
