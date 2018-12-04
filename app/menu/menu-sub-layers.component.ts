import { Component } from '@angular/core';

import { MapService } from '../map.service';
import { MenuService } from './menu.service';

@Component({
  selector: 'menu-sub-layers',
  template: `
      <div>
        <div id="filters-button">
          <button class="animate" name="button" type="button" (click)="toggleSubState()">
            <svg class="animate" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 42 42">
            <polygon points="42,19 23,19 23,0 19,0 19,19 0,19 0,23 19,23 19,42 23,42 23,23 42,23 "></polygon>
            </svg>
						Papildomi sluoksniai
          </button>
        </div>
      </div>
    `
})

export class MenuSubLayersComponent {

  state = false;

  constructor(
    private mapService: MapService,
    private menuService: MenuService
  ) { }

  toggleSubState() {
    const subLayersSate = this.menuService.getSubLayersState();

    //add sublayers if allLayers group layer is not full defined
    if (!subLayersSate) {
      //change subLayersState (only on first init)
      this.menuService.setSubLayersState();
      const allLayerGroup = this.mapService.getAllLayers();
      const map = this.mapService.returnMap();
      const layer = map.findLayerById("allLayers");

      //!this.state ? layer.sublayers = allLayerGroup : '';
      layer.sublayers.addMany(allLayerGroup);
    }

    this.menuService.toggleSubListState();
    //open help box if it was closed
    if (this.menuService.getVisibleSubLayerNumberState()) {
      this.menuService.setVisibleSubLayerNumberState(1);
    }

    this.state = this.menuService.getSubState();
  }

}
