import { Injectable } from '@angular/core';

import { MapOptions } from '../options';

import Print = require('esri/widgets/Print');
import Graphic = require('esri/Graphic');
import Point = require('esri/geometry/Point');
import GeometryService = require('esri/tasks/GeometryService');
import TextSymbol = require('esri/symbols/TextSymbol');

@Injectable()
export class MenuToolsService {

	// current selected tool containing draw feature
	currentDrawTool = '';

  constructor() { }

	setCurrentDrawTool(tool: string) {
		return this.currentDrawTool = tool;
	}

  initPrint(view) {
    return new Print({
      view: view,
      printServiceUrl: MapOptions.mapOptions.staticServices.printServiceUrl,
      container: "print-menu"
    });
  }

  createGeometry(geometry, symbol) {
    return new Graphic({
      geometry: geometry,
      symbol: symbol
    });
  }

  createAreaLabelGraphic(geometry, area: number, ended, units = 'm²') {
    const endString = ended ? "" : " (užbaigti dvigubu paspaudimu)";
    const areaValue = Math.floor(area + 0.5);
    return new Graphic({
      geometry: geometry.centroid,
      symbol: {
        type: "text",
        color: "white",
        haloColor: "black",
        haloSize: "1px",
        text: `${areaValue} ${units} ${endString}`,
        xoffset: 3,
        yoffset: 3,
        font: { // autocast as Font
          size: 10,
          family: "sans-serif"
        }
      } as any as TextSymbol
    });
  }

  createLineOrPointLabelGraphic(points, text, view) {
    return new Graphic({
      geometry: {
        type: "point", // autocasts as /Point
        x: points[0],
        y: points[1],
        spatialReference: view.spatialReference
      } as Point,
      symbol: {
        type: "text",
        color: "white",
        haloColor: "black",
        haloSize: 6,
        text: text,
        xoffset: 3,
        yoffset: 12,
        font: { // autocast as Font
          size: 10,
          family: "sans-serif"
        }
      } as any as TextSymbol
    });
  }

  addGeometryService(url) {
    return new GeometryService(url);
  }
}
