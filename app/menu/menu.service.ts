import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import Legend = require('esri/widgets/Legend');

import { MapService } from '../map.service';

@Injectable()
export class MenuService {

  private subLayersActive: boolean = false;

  private subLayersObs = new Subject<boolean>();

  subLayersActivation = this.subLayersObs.asObservable();

  toggleNumber: number = 1;
  subListWidget: any;
  queryParams: any;

  //add boolean property to add subListWidget only once // TODO refactor logic
  subListModeOff: boolean = true;

  //  //state if we want to disable help box in menu.component
  visibleSubLayerNumberState: number = 1;

  //state when sublayers are inittialised, changed only once (on first init)
  subLayersState = false;

  constructor(private mapService: MapService) {}

  getSubState(): boolean {
    return this.subLayersActive;
  }

  //state indicating if sublayers are inittialised, changed only once (on first init "setSubLayersState")
  getSubLayersState() {
    return this.subLayersState;
  }

	// remove sublayers layers on routing
	removeSublayersLayer() {
		// change to false only when routing to new theme
		// TODO remove sublayers completely
		//this.subLayersState = false;

		// do not show sublayers sidebar
		this.subLayersActive = false;
		this.subLayersObs.next(this.subLayersActive);

		// remove layers
		const map = this.mapService.returnMap();
		const layer = map.findLayerById("allLayers");
		//console.log('%c layer', 'color: green; font-size:20px', layer, map)
		//layer.sublayers.removeAll();
		layer.allSublayers.items.forEach(layer =>  {
			if (!layer.sublayers) {
				layer.visible = false;
			}
		});
	}

  setSubLayersState() {
    this.subLayersState = true;
  }

  //fetch sublayers arrray to allLayers layer group
  fetchSublayersToLayer() {

  }

  //update Sub layer list state after toggle button click
  updateSubState() {
    this.subLayersActive = !this.subLayersActive;
    this.subLayersObs.next(this.subLayersActive);
    return this.subLayersActive;
  }

  addSubList() {
    let view = this.mapService.getView();
    let map = this.mapService.returnMap();
    //UPDATE hide dom instead
    if (this.subListModeOff && this.subLayersActive) {
      view.then(() => {
        this.subListWidget = this.mapService.initSubLayerListWidget(view, map);
      });
      this.subListModeOff = false;
    }
  }

  toggleSubListState() {
    this.subLayersActive = this.updateSubState();
    if (this.toggleNumber % 2) {
      setTimeout(() => {
        this.addSubList();
        this.toggleNumber += 1;
      }, 0);
    } else if (!(this.toggleNumber % 2) && (this.toggleNumber > 1)) {
      this.toggleNumber += 1;
    }
  }

  getVisibleSubLayerNumberState() {
    return this.visibleSubLayerNumberState;
  }

  setVisibleSubLayerNumberState(state: number = 0) {
    return this.visibleSubLayerNumberState = state;
  }

  //set listMode valueto "show" based whether you showing
  //theme layers or sub layers list
  //layersType: "theme" (main theme layers) or  "allLayers" (sub list layers)
  listModeSelection(layersType: string = "theme", items: any) {
    let newItems;
    //console.log(items)
    if (layersType === "theme") {
       newItems = items.map((item)=>{
         if (item.id == "allLayers")  {
           item.listMode = "hide";
           return item;
         } else {
           item.listMode = "show";
           return item;
         }
      });
      return newItems;
    } else if (layersType ==="allLayers" ) {
      newItems =  items.map((item)=>{
        if (item.id == "allLayers")  {
          item.listMode = "show";
          return item;
        } else {
          item.listMode = "hide";
          return item;
        }
      });
      return newItems;
    }
  }

	// fetchLegend
	fetchLegend(container: HTMLElement) {
		const view = this.mapService.getView()
	  return new Legend({
	    view,
	    container
	  });
	}

}
