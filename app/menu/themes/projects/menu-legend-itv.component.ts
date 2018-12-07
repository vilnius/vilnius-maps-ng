import { Component, OnInit, OnDestroy } from '@angular/core';

import { MapService } from '../../../map.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'menu-legend-itv',
  template: `
      <div>
        <p>Sutartiniai ženklai:</p>
        <a (click)="closeToggle()" class="button close animate" title="Uždaryti">✕</a>
        <div id="legend-list" class="inner esri-widget">
          <div class="layer-group one-service">
            <p>Investicinių projektų būsena</p>
          </div>

          <div *ngIf="!status" id="legend-list_msg" class="esri-legend__message">Legendos nėra</div>
          <div *ngIf="status">
          <div  id="legend-list_15e9ee4caa0-object-38" class="esri-legend__service"><p class="esri-legend__service-label"></p><div class="esri-legend__layer"><div class="esri-legend__layer-table"><div class="esri-legend__layer-body"><div class="esri-legend__layer-row"><div class="esri-legend__layer-cell esri-legend__layer-cell--symbols"><div class="esri-legend__symbol"><svg overflow="hidden" width="14" height="14" style="touch-action: none;"><defs></defs><g transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,7.00000000,7.00000000)"><circle fill="rgb(0, 0, 0)" fill-opacity="0" stroke="rgb(255, 170, 0)" stroke-opacity="1" stroke-width="1.6" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" cx="0" cy="0" r="5.333333333333333" fill-rule="evenodd" stroke-dasharray="none" dojoGfxStrokeStyle="solid"></circle></g></svg></div></div><div class="esri-legend__layer-cell esri-legend__layer-cell--info">Nepradėti projektai</div></div></div></div></div>
          </div>
          <div id="legend-list_15e9ee4ca9f-object-36" class="esri-legend__service"><p class="esri-legend__service-label"></p><div class="esri-legend__layer"><div class="esri-legend__layer-table"><div class="esri-legend__layer-body"><div class="esri-legend__layer-row"><div class="esri-legend__layer-cell esri-legend__layer-cell--symbols"><div class="esri-legend__symbol"><svg overflow="hidden" width="14" height="14" style="touch-action: none;"><defs></defs><g transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,7.00000000,7.00000000)"><circle fill="rgb(0, 0, 0)" fill-opacity="0" stroke="rgb(0, 112, 255)" stroke-opacity="1" stroke-width="1.6" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" cx="0" cy="0" r="5.333333333333333" fill-rule="evenodd" stroke-dasharray="none" dojoGfxStrokeStyle="solid"></circle></g></svg></div></div><div class="esri-legend__layer-cell esri-legend__layer-cell--info">Vykdomi projektai</div></div></div></div></div>
          </div>
          <div id="legend-list_15e9ee4ca9e-object-34" class="esri-legend__service"><p class="esri-legend__service-label"></p><div class="esri-legend__layer"><div class="esri-legend__layer-table"><div class="esri-legend__layer-body"><div class="esri-legend__layer-row"><div class="esri-legend__layer-cell esri-legend__layer-cell--symbols"><div class="esri-legend__symbol"><svg overflow="hidden" width="14" height="14" style="touch-action: none;"><defs></defs><g transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,7.00000000,7.00000000)"><circle fill="rgb(0, 0, 0)" fill-opacity="0" stroke="rgb(3, 255, 77)" stroke-opacity="1" stroke-width="1.6" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" cx="0" cy="0" r="5.333333333333333" fill-rule="evenodd" stroke-dasharray="none" dojoGfxStrokeStyle="solid"></circle></g></svg></div></div><div class="esri-legend__layer-cell esri-legend__layer-cell--info">Baigti projektai</div></div></div></div></div>
          </div>
          </div>
          </div>
        </div>
    `
})
export class MenuLegendItvComponent implements OnInit, OnDestroy {
  itvLayers: any;

  subscription: Subscription;
  //layerlists checkbox status (on or off)
  //status is Subject<boolean>
  status: any = true;

  constructor(private _mapService: MapService) { }

  closeToggle() {
    window.location.hash = "#";
  }

  ngOnInit() {
    this.subscription = this._mapService.layersStatus.subscribe(status => {
      this.status = status;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
