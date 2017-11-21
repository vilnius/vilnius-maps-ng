import { Injectable } from '@angular/core';

import Search = require ("esri/widgets/Search");
import Locator = require ("esri/tasks/Locator");
import PictureMarkerSymbol = require ("esri/symbols/PictureMarkerSymbol");
import SimpleRenderer = require ("esri/renderers/SimpleRenderer");

@Injectable()
export class SearchService {
  defaultSearchWidget(view: Object) {
    return new Search({
        view: view,
        sources: [{
    			locator: new Locator("https://zemelapiai.vplanas.lt/arcgis/rest/services/Lokatoriai/PAIESKA_COMPOSITE/GeocodeServer"),
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
          locationToAddressDistance:10000,
    			placeholder: "Vietos paieška",
          zoomScale: 6,
          resultSymbol: new PictureMarkerSymbol({
           url: window.location.origin  + "/app/img/map_marker.png",
           size: 28,
           width: 28,
           height: 28,
           xoffset: 0,
           yoffset: 12
         })
  		}],
    });
  }
}