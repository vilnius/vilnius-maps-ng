import { Injectable } from '@angular/core';

import {Subject} from 'rxjs/Subject';

import { MapService } from '../map.service';

@Injectable()
export class MenuService {

  private subLayersActive: boolean = false;

  private subLayersObs = new Subject();

  subLayersActivation = this.subLayersObs.asObservable();

  toggleNumber: number = 1;
  subListWidget: any;
  queryParams: any

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

  setSubLayersState() {
    this.subLayersState = true;
  }

  //fetch sublayers arrray to allLayers layer group
  fetchSublayersToLayer() {

  }

  //update Sub layr list state after toggle button click
  updateSubState() {
    this.subLayersActive = !this.subLayersActive;
    this.subLayersObs.next(this.subLayersActive);
    return this.subLayersActive;
  }

  //just subscribe to current state / not using anymore
  sentSubState() {
    this.subLayersObs.next(this.subLayersActive);
  }

  addSubList() {
    let view = this.mapService.getView();
    let map = this.mapService.returnMap();
    //UPDATE hide dom instead
    //map.layers.items = this.listModeSelection("allLayers", map.layers.items);
    //this.subLayersActive ? this.subListWidget = this.mapService.initSubLayerListWidget(view, map) : "";
    if (this.subListModeOff && this.subLayersActive) {
      //alert("wrking 1")
      view.then((viewMap) => {
        this.subListWidget = this.mapService.initSubLayerListWidget(view, map);
      });
      //this.subListWidget = this.mapService.initSubLayerListWidget(view, map);
      //console.log("SublayerLISTWIDGET", this.subListWidget);
      this.subListModeOff = false;

      //this.queryParams = this.mapService.returnQueryParams();
      //console.log("this.queryParams", this.queryParams);

      setTimeout(() => {
        //open main item
        this.subListWidget.operationalItems.items["0"].open = true;
        this.subListWidget.operationalItems.items["0"].children.forEach(child => {
          //console.log("child", child);
          child.children.items.map(item => {
            if (item.visible) {
              if (item.children.items.length > 0) {
                item.children.items.map(subItem => {
                  if (subItem.visible) {
                    item.open = true;
                    child.open = true;
                  }
                });
              } else {
                child.open = true;
                item.open = true;
              }
            }
          });
        });
      }, 500);

    }
  }

  toggleSubListState() {
    this.subLayersActive = this.updateSubState();
    //console.log("SUB", this.subLayersActive)
    if (this.toggleNumber % 2) {
      //console.log('create');
      setTimeout(() => {
        this.addSubList();
        this.toggleNumber += 1;
      }, 500);
    } else if (!(this.toggleNumber % 2) && (this.toggleNumber > 1)) {
      //console.log('destroy');
      //not using destroy method to avoid Memory leak (as destroy method doesn't remove events lsiteners completely)
      //this.subListWidget.destroy();
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
      //console.log("NEW ITEMS", newItems);
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
      //console.log("NEW ITEMS", newItems);
      return newItems;
    }
  }
}
