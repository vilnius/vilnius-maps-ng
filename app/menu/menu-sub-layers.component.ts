import { Component, OnInit } from '@angular/core';

import { MapService } from '../map.service';
import { MapDefaultService } from '../themes/default/map-default.service';
import { MenuService } from './menu.service';
import { IdentifyService } from '../services/identify/identify.service';
import { MapOptions } from '../options';

@Component({
  selector: 'menu-sub-layers',
  template: `
      <div>
        <p>Papildomi sluoksniai:</p>
        <div id="filters-button">
          <button class="animate" name="button" type="button" (click)="toggleSubState()">
            <svg class="animate" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 42 42">
            <polygon points="42,19 23,19 23,0 19,0 19,19 0,19 0,23 19,23 19,42 23,42 23,23 42,23 "></polygon>
            </svg>
            Visų temų sluoksniai
            <!---->
          </button>
        </div>
      </div>
    `
})

export class MenuSubLayersComponent implements OnInit {

  state: boolean = false;

  constructor(private mapService: MapService, private mapDefaultService: MapDefaultService, private menuService: MenuService, private identify: IdentifyService) {

  }

  toggleSubState() {
    const subLayersSate = this.menuService.getSubLayersState();

    //add sublayers if allLayers group layer is not full defined
    if (!subLayersSate) {
      //change subLayersState (only on first init)
      this.menuService.setSubLayersState();

      const allLayerGroup = this.mapService.getAllLayers();
      console.log(subLayersSate);
      const map = this.mapService.returnMap();
      const layer = map.findLayerById("allLayers");
      console.log(layer);
      console.log(layer);
      layer.sublayers = allLayerGroup;
    }

    this.menuService.toggleSubListState();
    //open help box if it was closed
    if (this.menuService.getVisibleSubLayerNumberState()) {
      this.menuService.setVisibleSubLayerNumberState(1);
      //init subscribe
      this.menuService.sentSubState();
    }

    this.state = this.menuService.getSubState();
    //console.log(this.state);
    console.log("view", this.mapService.getView());

    //remove allLayers with following built in eventHandlers
    // if (!this.state) {
    //   //empty sublayers
    //   layer.sublayers = [];
    //   layer.suspended = true;
    //   //map.removeAll();
    // }
  }

  ngOnInit() {
    //let map = this.mapService.returnMap();
    //don't show all layers ir main layerlist
    //UPDATE hide dom instead
    //map.layers.items = this.menuService.listModeSelection("theme", map.layers.items);
  }
}
