import { Component, Output, EventEmitter } from '@angular/core';

import { MenuToolsService } from './menu-tools.service';

@Component({
  selector: 'menu-tools',
  templateUrl: './app/menu/menu-tools.component.html',
  providers: [MenuToolsService]
})

export class MenuToolsComponent {
  // set  toolsActive to false in parent component and get back menu wrapper for mobile
  @Output() close: EventEmitter<any> = new EventEmitter();

  closeToggle() {
    window.location.hash = "#";
    // emit close event
    this.close.emit(false);
  }

}
