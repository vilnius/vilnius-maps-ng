import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { MenuService } from './menu.service';

@Component({
  selector: 'menu-legend',
  template: `
		<div class="menu-header">
    	<p>Sutartiniai ženklai:</p>
    	<a (click)=closeToggle() class="button close animate" title="Uždaryti">✕</a>
		</div>
		<perfect-scrollbar>
			<div id="legend-list" #legend class="inner menu-nav-content"></div>
		</perfect-scrollbar>
    `
})
export class MenuLegendComponent implements OnInit, OnDestroy {
  @ViewChild('legend') legend: ElementRef;
  legendWidget: any;

  constructor(private menuService: MenuService) { }

  initLegend() {
    return this.menuService.fetchLegend(this.legend.nativeElement);
  }

  closeToggle() {
    window.location.hash = "#";
  }

  ngOnInit() {
    this.legendWidget = this.initLegend();
    //console.log('LEGEND', 	this.legendWidget)
  }

  ngOnDestroy() {
    //console.log('Destroy Legend');
    this.legendWidget.destroy();
  }

}
