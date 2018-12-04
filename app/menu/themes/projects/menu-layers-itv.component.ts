import { Component, OnInit } from '@angular/core';

import { MapService } from '../../../map.service';
import { MapOptions } from '../../../options';

@Component({
  selector: 'menu-layers-itv',
  template: `
      <div>
        <p>Temos sluoksniai:</p>
        <a (click)="closeToggle()" class="button close animate" title="Uždaryti">✕</a>
        <div id="layer-list" class="inner">
          <div class="layer-group" *ngIf="name">
            <p>{{name}}:</p>
          </div>
          <div class="checkbox">
            <input type="checkbox" [ngModel]="isChecked" value id="projects" (ngModelChange)="toggleLayerVisibility($event)">
            <label class="animate" for="projects">
              Investiciniai projektai
            </label>
          </div>
        </div>

        <div id="sub-layers-list" style="display: none">
          <menu-sub-layers>
          </menu-sub-layers>
        </div>
      </div>
    `
})
export class MenuLayersItvComponent implements OnInit {
  name: string;
  isChecked: boolean = true;

  constructor(private _mapService: MapService) { }

  toggleLayerVisibility(event) {
    //or use [change]="isChecked" and (change)="toggleLayerVisibility($event)" with event.target.value instead
    this.isChecked = event;
    this._mapService.setLayersStatus(this.isChecked);
    //this.isChecked ? this._mapService.returnFeatureLayers().map(feature => {feature.visible = true}) : this._mapService.returnFeatureLayers().map(feature => {feature.visible = false;});

    //NEW approach
    let map = this._mapService.returnMap();
    this.isChecked ? map.findLayerById("itv-projects").visible = true : map.findLayerById("itv-projects").visible = false;
  }

  closeToggle() {
    window.location.hash = "#";
  }

  ngOnInit() {
    //add temp delay to get layers chnage to Observable
    setTimeout(() => {
      this.name = MapOptions.themes.itvTheme.name;
    }, 400)

  }

}
