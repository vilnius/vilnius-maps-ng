import { Component, Input, OnInit } from '@angular/core';

import Compass = require("esri/widgets/Compass");

import { MapService } from '../map.service';

@Component({
  selector: 'compass-map',
  template: `
    <ng-content></ng-content>
    `
})

export class CompassComponent implements OnInit {
  @Input() view: any;

  constructor(private mapService: MapService) { };

  ngOnInit() {
    const compass = new Compass({
      view: this.view
    });

    // adds the compass to the top left corner of the MapView
    this.view.ui.add(compass, "top-left");
  }

}
