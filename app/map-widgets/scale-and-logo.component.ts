import { Component, Input, OnInit } from '@angular/core';

import ScaleBar = require ("esri/widgets/ScaleBar");

@Component({
    selector: 'scale-map',
    template: `
      <div id="vilnius-logo"><img src="/app/img/vilnius_logo_r.png" border="0"></div>
      <div id="scale-map">

      </div>
    `
})

export class ScaleAndLogoComponent implements OnInit {
  @Input() view: any;

  ngOnInit() {
    let scaleBar = new ScaleBar({
      view: this.view,
      unit: 'dual'
    });

    this.view.ui.add(scaleBar, {
      position: "bottom-left"
    });
  }
}
