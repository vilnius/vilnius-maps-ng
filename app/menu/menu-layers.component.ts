import { Component, OnInit } from '@angular/core';

import { MapService } from '../map.service';
import { MapOptions } from '../options';

@Component({
  selector: 'menu-layers',
  template: `
      <div>
        <p>Temos sluoksniai:</p>
        <a (click)="closeToggle()" class="button close animate" title="Uždaryti">✕</a>
        <div id="layer-list" class="inner">
        </div>
        <div id="sub-layers-list">
          <menu-sub-layers>
          </menu-sub-layers>
        </div>
      </div>
    `
})
export class MenuLayersComponent implements OnInit {
  name: string;
  isChecked: boolean = true;


  constructor(private _mapService: MapService) { }

  toggleLayerVisibility(event) {
    //or use [change]="isChecked" and (change)="toggleLayerVisibility($event)" with event.target.value instead
    this.isChecked = event;
    this.isChecked ? this._mapService.returnFeatureLayers().map(feature => { feature.visible = true }) : this._mapService.returnFeatureLayers().map(feature => { feature.visible = false; });
  }

  closeToggle() {
    window.location.hash = "#";
  }

  ngOnInit() {
    //add temp delay to get layers change to Observable
    setTimeout(() => {
      this.name = MapOptions.themes.itvTheme.name;
    }, 400);
    // init layers list widget
    let listWidget = this._mapService.initLayerListWidget();
    //console.log("listWidget", listWidget);
  }

}
