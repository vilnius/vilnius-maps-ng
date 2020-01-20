import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { MapService } from '../map.service';
import { ToolsNameService } from './tools-name.service';
import { MapOptions } from '../options';
import { Utils } from '../services/utils/utils';
import { EventEmitter } from 'events';
import { MenuService } from './menu.service';

@Component({
  selector: 'menu-layers',
  template: `
   <div class="menu-header">
			 <p>Temos sluoksniai:</p>
    <a (click)="closeToggle()" class="button close animate" title="Uždaryti">✕</a>
		</div>
		<perfect-scrollbar>
			<div class="layers-wrapper">
				<div id="layer-list" #list class="inner menu-nav-content" [ngClass]="{'hide-first-layer': hideFirstLayer}">
				</div>
				<div id="sub-layers-list">
					<menu-sub-layers (hideFirstLayer)="onHideFirstLayer($event)">
					</menu-sub-layers>
				</div>
			</div>
		</perfect-scrollbar>
  `
})
export class MenuLayersComponent implements OnInit, OnDestroy {
  @ViewChild('list') list: ElementRef;
  name: string;
  isChecked = true;
  listWidget: any;
  viewCreateEvent: any;
  listEvent: any;
  hideFirstLayer = false;

  constructor(
    private mapService: MapService,   
    private menuService: MenuService ,
    private toolsNameService: ToolsNameService
  ) { }

  onHideFirstLayer(event: boolean) {
    this.hideFirstLayer = event;
  }

  toggleLayerVisibility(event) {
    this.isChecked = event;
    this.isChecked ? this.mapService.returnFeatureLayers().map(feature => { feature.visible = true }) : this.mapService.returnFeatureLayers().map(feature => { feature.visible = false; });
  }

  closeToggle() {
    window.location.hash = "#";
  }

  ngOnInit() {
    // add temp delay to get layers change to Observable
    setTimeout(() => {
      this.name = MapOptions.themes.itvTheme.name;
    }, 400);

    // init layers list widget
    const mapView = this.mapService.getView();
    const map = this.mapService.returnMap();
    let initialLoad = true;
    let timeId;
    mapView.then((view) => {
      // reorder layers in map and view
      // allLayers layer must be always last in map array,
      // as we are hiding layer list manualy with css
      // as we will be using static component in theme
      this.viewCreateEvent = view.on("layerview-create", (event) => {
        const index = map.layers.items.length - 1;

        // reorder only if allLayers layer arrives before theme layers
        if (index > 0) {
          // const subLayer = map.findLayerById("allLayers");
          if  (event.layer.id === 'allLayers') {
            event.layer.listMode = 'hide';
            this.hideFirstLayer = false;
          }

          // reorder stream layer if exist
          if (event.layer.type === 'stream') {
            map.reorder.layer(event.layer, index)
          }

          if (timeId) {
            clearTimeout(timeId);
            timeId = null;
          }

          // simply activate :target speudo class with location href
          // calling on every event
          timeId = setTimeout(() => {
            Utils.setMenuLayersAnchor();
          }, 600);

          // if (typeof subLayer !== undefined) {
            // Hiding instead of reorrdering
            // reordering only if sublayer button has been activated
            // check menu-sub-layers component
            // map.reorder(subLayer, index);

          // }
    
        }

        if (index > 0 && initialLoad) {
          Utils.setMenuLayersAnchorOnPageLoad();
          initialLoad = false;
        }

        // set tool name Obs, to close tools boxes if opened
        this.toolsNameService.setCurentToolName('');
      });

      this.listWidget = this.mapService.initLayerListWidget(view, this.list.nativeElement);
      this.listEvent = this.listWidget.on('trigger-action', (event) => {
        this.mapService.updateOpacity(event);
      });
    });

  }

  ngOnDestroy() {
    this.listWidget.destroy();
    this.viewCreateEvent.remove();
    this.listEvent.remove();
  }

}
