import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { MapService } from '../map.service';
import { MapOptions } from '../options';

import  Legend = require ('esri/widgets/Legend');

@Component({
    selector: 'menu-legend',
    template: `
      <div>
        <p>Sutartiniai ženklai:</p>
        <a (click)=closeToggle() class="button close animate" title="Uždaryti">✕</a>
        <div id="legend-list" class="inner">
        </div>
      </div>
    `
})
export class MenuLegendComponent  implements OnInit, OnDestroy {

  @Input() viewLegend: any;

  constructor(private _mapService: MapService) {}

  initLegend() {
    return this.fetchLegend();
  }

  closeToggle() {
    window.location.hash = "#";
  }

  //fetchLegend after subscribtion
  fetchLegend() {
    return new Legend({
        view: this.viewLegend,
        container: "legend-list"
    });
  }

  ngOnInit() {
    this.initLegend();
  }

  ngOnDestroy() {
    //this.subscription.unsubscribe();
  }

}
