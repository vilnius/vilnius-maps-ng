import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';

import { MapOptions } from '../options';
import { SearchService } from '../search/search.service';
import { MapWidgetsService } from './map-widgets.service';
import { MapService } from '../map.service';
import on = require("dojo/on");

@Component({
  selector: 'search-kindergartens',
  template: `
    <div #searchWidgetDOM id="gartens-search-widget" class="gartens-search"></div>
  `,
  styles: [`
    .gartens-search .esri-widget-button,
    .gartens-search .esri-search .esri-search__container .esri-widget-button {
      display: none;
    }
    `]

})

export class SearchKindergartensComponent implements OnInit {
  @ViewChild('searchWidgetDOM') searchWidgetDOM: ElementRef;
  @Input() analyzeParams;

  searchWidget: any;

  constructor(private mapWidgetsService: MapWidgetsService, private mapService: MapService, private searchService: SearchService) { }

  returnSerch() {
    return this.searchWidget;
  }

  ngOnInit() {
      this.searchWidget = this.searchService.kindergartensSearchWidget(this.mapService.getView(), MapOptions.search.addressLocator, this.searchWidgetDOM.nativeElement, "Adresas, pvz.: Konstitucijos pr. 3");

      // on(this.searchWidget, 'search-complete', (e) => {
      //   //console.log(e, this.analyzeParams, this.searchWidget);
  		// });
      on(this.searchWidget, 'search-focus', (e) => {
        //after each search block key enter search
        this.searchWidget.autoSelect = false;
  		});
      // on(this.searchWidget, 'select-result', (e) => {
      //   //console.log('select-result', e);
  		// });
  }
}
