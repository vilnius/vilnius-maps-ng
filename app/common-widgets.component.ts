import { Component, Input } from '@angular/core';

@Component({
  selector: 'common-widgets',
  template: `
    <div id="widgets" *ngIf="view">
			<ng-content></ng-content>
			<menu-map [view]="view"></menu-map>
      <scale-map [view]="view"></scale-map>
      <compass-map [view]="view"></compass-map>
      <credits-map></credits-map>
      <locate-center-map></locate-center-map>
      <basemap-toggle [view]="view"></basemap-toggle>
    </div>
    `
})

export class CommonWidgetsComponent {
  @Input() view: any;
};
