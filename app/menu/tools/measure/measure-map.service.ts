import { Injectable } from '@angular/core';

import { MapService } from '../../../map.service';
import { MenuToolsService } from '../../menu-tools.service';
import { MapOptions } from '../../../options';
import { Symbols } from '../../symbols';
import { AnalyzeParams } from './AnalyzeParams';

import Geoprocessor = require('esri/tasks/Geoprocessor');
import Draw = require('esri/views/2d/draw/Draw');
import Graphic = require('esri/Graphic');
import Polygon = require('esri/geometry/Polygon');
import geometryEngine = require('esri/geometry/geometryEngine');
import BufferParameters = require('esri/tasks/support/BufferParameters');

import * as Raven from 'raven-js';

@Injectable()
export class MeasureMapService {
  draw: Draw;
  view: any;
  polygon: Polygon;
  graphic: Graphic;
  //checkboxChecked: boolean;
  analyzeParams: AnalyzeParams;

  //final form inputs for building selection form
  themeLayers = [];

  //geomettry created by draw tools
  drawGeometry: any;

  //measurements geometric service, changed to VP service
  geometryService = this.menuToolsService.addGeometryService(MapOptions.mapOptions.staticServices.geometryUrl);

  //calculated result string
  calculatedUnits: string;

  //calculated feature number
  calculateCount: number | string;

  job: IPromise<any>
  geo: Geoprocessor;

  constructor(
    private mapService: MapService,
    private menuToolsService: MenuToolsService
  ) { }

  initDraw(view): Draw {
    this.view = view;
    this.draw = new Draw({
      view
    });
    return this.draw;
  }

  initGeoprocessor(view) {
    const url = MapOptions.mapOptions.staticServices.extract3DGP.url;
    this.geo = new Geoprocessor({
      url,
      outSpatialReference: view.spatialReference
    });
    return this.geo;
  }

  drawPolygon(evt, analyzeParams, ended = false, ) {
    let vertices = evt.vertices;
    this.analyzeParams = analyzeParams;

    //remove existing graphic
    this.view.graphics.removeAll();

    // create a new polygon
    let polygon = new Polygon({
      rings: vertices,
      spatialReference: this.view.spatialReference
    });

    // create a new graphic representing the polygon, add it to the view
    let graphic = new Graphic({
      geometry: polygon,
      symbol: Symbols.polygonSymbol
    });

    this.drawGeometry = graphic;
    this.view.graphics.add(graphic);

    // calculate the area of the polygon
    let area = geometryEngine.planarArea(polygon, "square-meters");
    if (area < 0) {
      area = - area;
    }

    // start displaying the area of the polygon
    this.labelAreas(polygon, area, ended);
  }

  // Label polyon with its area
  labelAreas(geom, area, ended) {
    this.calculatedUnits = area.toFixed(0) + " m²"
    const graphic = this.menuToolsService.createAreaLabelGraphic(geom, area, ended);
    this.view.graphics.add(graphic);
  }

  createPolylineGraphic(evt, analyzeParams, ended = false) {
    this.analyzeParams = analyzeParams;

    this.view.graphics.removeAll();
    const polyline = {
      type: "polyline", // autocasts as Polyline
      paths: evt.vertices,
      spatialReference: this.view.spatialReference
    };
    const graphic = this.menuToolsService.createGeometry(polyline, Symbols.lineSymbol);

    this.drawGeometry = graphic;

    this.view.graphics.add(graphic);

    // calculate the area of the polygon
    let line = geometryEngine.planarLength(graphic.geometry, "meters");
    const lastIndex = polyline.paths.length - 1;
    this.labelLinesAndPoints("line", polyline.paths[lastIndex], line, ended);
  }

  // Label text
  labelLinesAndPoints(geometryType: string, points, geometry = undefined, ended = false) {
    //this.calculatedUnits
    const endString = ended ? "" : " (užbaigti dvigubu paspaudimu)";
    let text: string;
    geometryType === "line" ? text = geometry.toFixed(0) + " m" + endString : text = `x: ${points[1].toFixed(2)}, y: ${points[0].toFixed(2)}`;
    geometryType === "line" ? this.calculatedUnits = geometry.toFixed(0) + " m" : this.calculatedUnits = `x: ${points[1].toFixed(2)}, <br>y: ${points[0].toFixed(2)}`
    const graphic = this.menuToolsService.createLineOrPointLabelGraphic(points, text, this.view);
    this.view.graphics.add(graphic);
  }

  createPointGraphic(evt, analyzeParams) {
    this.analyzeParams = analyzeParams;

    this.view.graphics.removeAll();
    let point = {
      type: "point", // autocasts as /Point
      x: evt.coordinates[0],
      y: evt.coordinates[1],
      spatialReference: this.view.spatialReference
    };

    let graphic = new Graphic({
      geometry: point,
      symbol: Symbols.pointSymbol
    });

    this.drawGeometry = graphic;

    this.view.graphics.add(graphic);

    //Add label
    this.labelLinesAndPoints("point", [point.x, point.y], point);
  }

  //create buffer inputs data
  createInputsData(view) {
    const rasterLayers = this.mapService.getRasterLayers();
    let themeLayerInputs = [];
    const currentThemelayers: any[] = view.layerViews.items.filter((item) => item.layer.id !== "allLayers");
    currentThemelayers.forEach(layer => {
      layer.layer.allSublayers.items.forEach(item => {
        if (!item.sublayers) {
          //check if  layer name is in rasterLayers array and do not add layer to inputs list
          const hasItem = rasterLayers.includes(item.title);
          if (!hasItem) {
            themeLayerInputs.push({ 'name': item.title, 'url': item.url });
          }
        }
      })
    })
    this.themeLayers = themeLayerInputs.reverse();
  }

  createBuffer(options: any, evt) {
    //add required options for buffer execution
    let parameters = new BufferParameters();
    let geometry = this.drawGeometry.geometry;
    parameters.distances = [options.bufferSize];
    parameters.unit = options.chosenUnit === "m" ? "meters" : "kilometers";
    parameters.geodesic = true;
    //options.bufferSpatialReference = new SpatialReference({wkid: 3346});
    parameters.bufferSpatialReference = this.view.spatialReference;
    //parameters.spatialReference = new SpatialReference({wkid: 2600});
    parameters.outSpatialReference = this.view.spatialReference;
    // if event csomes from point buffer it has coordinates,
    // to avoid mouse hover changes use last events' coordinates (same as point creation)
    if (evt.coordinates) {
      const finalGeometry = Object.create(geometry);
      // mutate finalGeometry
      geometry = Object.assign(finalGeometry, {
        x: evt.coordinates[0],
        y: evt.coordinates[1]
      }
      );
    }

    parameters.geometries = [geometry];
    return this.geometryService.buffer(parameters).then((results) => {
      const polyline = new Graphic({
        geometry: results[0],
        symbol: Symbols.bufferSymbol
      });

      //Add as graphic on view approach
      this.view.graphics.add(polyline);

      //add union if only input is selected
      if (options.inputlayer >= 0) {
        const input = this.themeLayers.find((el, i) => i === options.inputlayer);
        return this.createQuery(input, polyline);
      }
    });
  }

  getSymbol(feature) {
    //check geomtery type base on first result
    let graphicSymbol: any;
    if (feature.geometry.rings) {
      graphicSymbol = Symbols.selectionPolygon;
    } else if (feature.geometry.paths) {
      graphicSymbol = Symbols.selectionLine;
    } else {
      graphicSymbol = Symbols.selectionPoint;
    };
    return graphicSymbol;
  }

  //create buffer query and return results
  createQuery(input, polyline) {
    const query = this.mapService.addQuery();
    const queryTask = this.mapService.addQueryTask(input.url);

    query.returnGeometry = true;
    query.outFields = ["OBJECTID"];
    query.geometry = polyline.geometry;
    return queryTask.execute(query).then((result) => {
      if (result.features.length > 0) {
        const symbol = this.getSymbol(result.features[0]);

        const features = result.features.map((feature) => {
          feature.symbol = symbol;
          return feature;
        });

        this.calculateCount = features.length;

        features.forEach((graphic) => { this.view.graphics.add(graphic) });
      } else {
        this.calculateCount = 'Nerasta';
      }

      return;
    }).catch(function(err) {
      Raven.captureMessage('VP error ' + err, {
        level: 'error' // one of 'info', 'warning', or 'error'
      });
      console.error(err);
    });
  }

  resetCalculate(): void {
    this.calculateCount = null;
    this.calculatedUnits = null;
  }

}
