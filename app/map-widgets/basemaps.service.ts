import { Injectable } from '@angular/core';

import { MapOptions } from '../options';
import { BASEMAPS, Basemap } from './basemaps'
import { MapService } from '../map.service';

@Injectable()
export class BasemapsService {
  // DEFAULT basemap
  activeBasemap = "base-dark";

  constructor(private mapService: MapService) { }

  returnBasemaps(): Basemap[] {
    return BASEMAPS;
  }

  setActiveBasemap(name: string) {
    this.activeBasemap = name;
  }

  toggleBasemap(id: string, view: any) {
    this.activeBasemap = id;
    this.filterBasemap(id, view);
  }

  returnActiveBasemap() {
    return this.activeBasemap;
  }

  // iniatiate basemaps
  initBasemaps(map, queryParams = { basemap: null }) {
    // add  basemap layer
    const basemaps = [];

    BASEMAPS.forEach(basemap => {
      const baseMapRestEndpoint = MapOptions.mapOptions.staticServices[basemap.serviceName];
      if (queryParams.basemap === basemap.id) {
        this.setActiveBasemap(basemap.id);
        const visibleBaseMap = this.mapService.initTiledLayer(baseMapRestEndpoint, basemap.id);
        basemaps.push(visibleBaseMap);
      } else {
        const hiddenBaseMap = this.mapService.initTiledLayer(baseMapRestEndpoint, basemap.id, false);
        basemaps.push(hiddenBaseMap);
      }

    });
    map.basemap = this.mapService.customBasemaps(basemaps);
    return basemaps;
  }

  // add current basemap visibilty
  filterBasemap(activeBasemMapId: string, view: any) {
    view.map.basemap.baseLayers.items.map((item) => {
      if (item.id === activeBasemMapId) {
        item.visible = true;
        activeBasemMapId === "base-dark"
          ? document.getElementsByClassName("container-fluid")[0].className += " dark"
          : document.getElementsByClassName("container-fluid")[0].classList.remove("dark");
      } else {
        item.visible = false;
        // if active base map is basemapEngineeringUrl, add  another  basemap as well ("base-dark" for example)
        ((this.activeBasemap === "base-en-t") && (item.id === "base-dark"))
          ? item.visible = true
          : void (0);

        ((this.activeBasemap === "base-en-s") && (item.id === "base-map"))
          ? item.visible = true
          : void (0);
      }

    })
  }

}
