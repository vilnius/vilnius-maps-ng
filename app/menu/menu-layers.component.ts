import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { MapService } from '../map.service';
import { ToolsNameService } from './tools-name.service';
import { MapOptions } from '../options';

@Component({
  selector: 'menu-layers',
  template: `
   <div class="menu-header">
			 <p>Temos sluoksniai:</p>
    <a (click)="closeToggle()" class="button close animate" title="Uždaryti">✕</a>
		</div>
		<perfect-scrollbar>
			<div class="layers-wrapper">
				<div id="layer-list" #list class="inner menu-nav-content">
				</div>
				<div id="sub-layers-list">
					<menu-sub-layers>
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

  constructor(
    private mapService: MapService,
    private toolsNameService: ToolsNameService
  ) { }

  toggleLayerVisibility(event) {
    //or use [change]="isChecked" and (change)="toggleLayerVisibility($event)" with event.target.value instead
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
    const view = this.mapService.getView();
    const map = this.mapService.returnMap();
    //console.log('OnInit Layers')
    view.then(() => {
      // reorder layers in map and view
      // allLayers layer must be always last in map array,
      // as we are hiding layer list manualy with css
      // TODO remove event on destroy
      view.on("layerview-create", (event) => {
        //console.log('ONN', this.listWidget)
        const index = map.layers.items.length - 1;
        // reorder only if allLayers layer comes before theme layers
        if (event.layer.id !== "allLayers" && index > 0) {
          const subLayer = map.findLayerById("allLayers");
          map.reorder(subLayer, index)
          //console.log('%c LOADED', "color: red; font-size: 22px", event.layer.id)
        }

        // set tool name Obs, to close tools boxes if opened
        this.toolsNameService.setCurentToolName('');
        //this.cdr.detectChanges();
      });

      this.listWidget = this.mapService.initLayerListWidget(view, this.list.nativeElement);

      // TODO remove event on destroy
      this.listWidget.on('trigger-action', (event) => {
        this.mapService.updateOpacity(event);
      });
    });
  }

  ngDoCheck() {
    //console.log("do check")
  }

  ngOnDestroy() {
    //console.log('Destroy Layers');
    this.listWidget.destroy();
  }
}
