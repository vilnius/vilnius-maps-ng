import { Component, EventEmitter, Output } from '@angular/core';

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
  @Output() hideFirstLayer = new EventEmitter<boolean>();
  state = false;

  constructor(
    private mapService: MapService,
    private menuService: MenuService
  ) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.menuService.subLayersActivation.subscribe((isActivated) => {
      this.reorder(isActivated);
    });
  }


  reorder(isActivated: boolean) {
      // kind of hackish, wee need to reorder layers because we hiding first layer in main layers menu
      // and showing first layer in sublayers menu
      const map = this.mapService.returnMap();
      const index = map.layers.items.length - 1;
      const layer = map.findLayerById("allLayers");
      map.reorder(layer, 0);

      if (map) {
        const layer = map.findLayerById("allLayers");
        if (isActivated) {
          layer.listMode = 'show';
          this.hideFirstLayer.emit(true)
  
        } else {
          layer.listMode = 'hide';
          this.hideFirstLayer.emit(false)
        }
    
  
      }

  }

  toggleSubState() {
    const subLayersSate = this.menuService.getSubLayersState();

    //add sublayers if allLayers group layer is not fully defined
    if (!subLayersSate) {
      //change subLayersState (only on first init)
      this.menuService.setSubLayersState();
      this.reorder(subLayersSate);

      const map = this.mapService.returnMap();
      const allLayerGroup = this.mapService.getAllLayers();
      const layer = map.findLayerById("allLayers");
      layer.sublayers.removeAll();
      layer.sublayers.addMany(allLayerGroup);

    } else {
      this.hideFirstLayer.emit(false)
    }

    this.menuService.toggleSubListState();
    //open help box if it was closed
    if (this.menuService.getVisibleSubLayerNumberState()) {
      this.menuService.setVisibleSubLayerNumberState(1);
    }

    this.state = this.menuService.getSubState();
  }

}
