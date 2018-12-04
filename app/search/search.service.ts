import { Injectable } from '@angular/core';

import Search = require("esri/widgets/Search");
import Locator = require("esri/tasks/Locator");
import PictureMarkerSymbol = require("esri/symbols/PictureMarkerSymbol");
import Collection = require("esri/core/Collection");

import { MapOptions } from '../options';

@Injectable()
export class SearchService {

  gartensSearchWidget: Search;

  returnGartensSearchWidget() {
    return this.gartensSearchWidget;
  }

  defaultSearchWidget(view: Object, url = MapOptions.search.locator) {
    return new Search({
      view: view,
			includeDefaultSources: false,
			allPlaceholder: 'Vietos paieška',
			locationEnabled: false,
      sources: [{
        locator: new Locator({ url: url }),
        singleLineFieldName: "SingleLine", //AG name of 'Single Line Address Field:'
        outFields: ["*"],
        enableSuggestions: true, //AG only with 10.3 version
        name: "Paieška",
        enableHighlight: true, //highlight symbol
        enableLabel: false,
        //distance: 20, //search distance
        //enableButtonMode: true,
        //expanded: true,
        localSearchOptions: {
          minScale: 300000,
          distance: 50000
        },
        locationToAddressDistance: 10000,
        placeholder: "Vietos paieška",
        zoomScale: 6,
        resultSymbol: new PictureMarkerSymbol({
          url: window.location.origin + "/app/img/map_marker.png",
          width: 28,
          height: 28,
          xoffset: 0,
          yoffset: 12
        })
      }] as any as Collection
    });
  }

  kindergartensSearchWidget(view: any, container: string, placeholder = "Adreso Paieška") {
    this.gartensSearchWidget = new Search({
      autoSelect: false, //autoselect to false, selection will be based on only button click event
      view,
      container,
			includeDefaultSources: false,
			allPlaceholder: "Adreso paieška",
			locationEnabled: false,
      sources: [{
        locator: new Locator({ url: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Lokatoriai/PAIESKA_COMPOSITE/GeocodeServer" }),
        singleLineFieldName: "SingleLine", //AG name of 'Single Line Address Field:'
        outFields: ["*"],
        enableSuggestions: true, //AG only with 10.3 version
        name: "Adreso Paieška",
        enableHighlight: true, //highlight symbol
        enableLabel: false,
        //distance: 20, //search distance
        //enableButtonMode: true,
        //expanded: true,
        localSearchOptions: {
          minScale: 300000,
          distance: 50000
        },
        locationToAddressDistance: 10000,
        placeholder,
        zoomScale: 6,
        resultSymbol: new PictureMarkerSymbol({
          url: window.location.origin + "/app/img/map_marker.png",
          width: 28,
          height: 28,
          xoffset: 0,
          yoffset: 12
        })
      }] as any as Collection
    });
    return this.gartensSearchWidget;
  }
}
