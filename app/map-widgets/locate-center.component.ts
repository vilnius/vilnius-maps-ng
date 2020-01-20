import { Component } from '@angular/core';

import { MapService } from '../map.service';

@Component({
  selector: 'locate-center-map',
  template: `
    <div class="center-map-icon" (click)="centerMap()">
      <span class="esri-icon-locate" aria-label="locate icon" title="Centruoti"></span>
    </div>
  `,
  styles: [`
    .center-map-icon {
      position: absolute;
      right: 132px;
      top: 100px;
      background: #fff;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      font-size: 20px;
      text-align: center;
      z-index: 0;
    }

    .center-map-icon:hover {
      cursor: pointer;
    }

    .esri-icon-locate {
      position: relative;
      top: 1px;
    }

    @media only screen and (min-width: 740px) {
      .center-map-icon {
        right: 186px;
        top: 95px;
      }

    }

    @media only screen and (min-width: 840px) {
      .center-map-icon {
        right: 168px;
      }

    }


  `]
})

export class LocateCenterComponent {

  constructor(private mapService: MapService) { };

  centerMap() {
    this.mapService.centerMapWithCompass();
  }

}
