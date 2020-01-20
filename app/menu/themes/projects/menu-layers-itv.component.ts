import { Component, OnInit } from '@angular/core';

import { MapService } from '../../../map.service';
import { MapOptions } from '../../../options';
import { ToolsNameService } from '../../tools-name.service';
import { Utils } from '../../../services/utils/utils';

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
  viewCreateEvent: any;

  constructor(
    private mapService: MapService,
    private toolsNameService: ToolsNameService
  ) { }

  toggleLayerVisibility(event) {
    //or use [change]="isChecked" and (change)="toggleLayerVisibility($event)" with event.target.value instead
    this.isChecked = event;
    this.mapService.setLayersStatus(this.isChecked);
    //this.isChecked ? this._mapService.returnFeatureLayers().map(feature => {feature.visible = true}) : this._mapService.returnFeatureLayers().map(feature => {feature.visible = false;});

    //NEW approach
    let map = this.mapService.returnMap();
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

    // TODO remove boilerplate in menu-layers-itv and menu-layers
    // init layers list widget
    const view = this.mapService.getView();
    const map = this.mapService.returnMap();
    let initialLoad = true;
    //console.log('OnInit Layers')
    view.then(() => {
      // reorder layers in map and view
      // allLayers layer must be always last in map array,
      // as we are hiding layer list manualy with css
      // as we will be using static component in theme
      this.viewCreateEvent = view.on("layerview-create", (event) => {
        //console.log('ONN', this.listWidget)
        const index = map.layers.items.length - 1;
        // reorder only if allLayers layer comes before theme layers
        if (index > 0) {
          const subLayer = map.findLayerById("allLayers");
          if (typeof subLayer !== undefined) {
            map.reorder(subLayer, index);
            // simply activate :target speudo class with location href
            Utils.setMenuLayersAnchor();
          }

        }
        if (index > 0 && initialLoad) {
          Utils.setMenuLayersAnchorOnPageLoad();
          initialLoad = false;
        }

        // set tool name Obs, to close tools boxes if opened
        this.toolsNameService.setCurentToolName('');
      });

    });
  }

  ngOnDestroy() {
    this.viewCreateEvent.remove();
  }

}
