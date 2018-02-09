import { Component, Input } from '@angular/core';

@Component({
  selector: 'common-widgets',
  template: `
    <div id="widgets" *ngIf="view">
      <menu-map [view]="view"></menu-map>
      <scale-map [view]="view"></scale-map>
      <compass-map [view]="view"></compass-map>
      <credits-map></credits-map>
      <basemap-toggle [view]="view"></basemap-toggle>
      <ng-content></ng-content>
    </div>
    `
})

export class CommonWidgetsComponent {
  @Input() view: any;
};
