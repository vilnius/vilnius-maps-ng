import { Injectable } from '@angular/core';

import { MapService } from '../map.service';
import { ProjectsListService } from '../projects-list/projects-list.service';
import { MapOptions } from '../options';
import { IdentifyService } from '../services/identify/identify.service';

import Extent = require("esri/geometry/Extent");
import Point = require("esri/geometry/Point");

import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable()
export class PointAddRemoveService {
  view: any;
  featureLayers: any;
  map: any;
  identifyPointCoordinates: any;

  private pointObs = new Subject();
  pointItem = this.pointObs.asObservable()
		.pipe(
			first()
		);

  constructor(private _mapService: MapService, private projectsListService: ProjectsListService, private identifyService: IdentifyService) { }

  //identify list item
  identifyItem(map: any, view: any, features: any, e: any, project = null) {
    this.map = map;
    this.view = view;
    this.featureLayers = features;
    //start idenfify, pass project
    this.identifyAttributes(e);
  }

  removeSelectionLayers(): void {
    //find layer and remove it, max 4 layers: polygon, polyline, point, and additional point if scale is set from point to point in mxd
    this._mapService.removeSelectionLayers();
  }

  //NEW method selection on point
  showSelectionGraphicOnPoint(feature, map, view, projectsLayer, number) {
    //console.log("projectsLayer", projectsLayer);
    let layer = projectsLayer.sublayers.items.filter(layer => {
      if (layer.id === feature.subLayerId) {
        return layer;
      }
    });
    //do not need to call queryResultsToGraphic, call selectionResultsToGraphic instead
    this._mapService.selectionResultsToGraphic(map, feature, layer["0"].maxScale, layer["0"].minScale, layer, number);
  }

  //selection on point, polygon or polyline
  showSelectionGraphicCommon(feature, map, view, projectsLayer, number, geometryTypes) {
    projectsLayer.sublayers.items.filter(layer => {
      if (layer.id === feature.subLayerId) {
        return layer;
      }
    });
    return this.searchProjects(feature, map, view, projectsLayer, geometryTypes, number);
  }

  getPointCoordinates() {
    return this.identifyPointCoordinates;
  }

  //search point for selection graphics
  searchProjects(feature: any, map, view, projectsLayer, geometryTypes, number) {
    let identify = this.identifyService.identify(projectsLayer.url);
    let identifyParams = this.identifyService.identifyParams();
    identifyParams.geometry = feature.geometry;
    identifyParams.mapExtent = view.extent;
    identifyParams.tolerance = 10;
    identifyParams.width = view.width;
    identifyParams.height = view.height;
    identifyParams.layerOption = 'all';
    identifyParams.returnGeometry = true;

    return identify.execute(identifyParams).then((response) => {
      //console.log("searchProjects", response);
      let results = response.results;
      return results.map((result, i) => {
        let newFeature = result.feature;
        if (((newFeature.geometry.type === "point") && (newFeature.attributes.UNIKALUS_NR === feature.attributes.UNIKALUS_NR)) || ((newFeature.geometry.paths) && (newFeature.attributes.UNIKALUS_NR === feature.attributes.UNIKALUS_NR)) || ((newFeature.geometry.rings) && (newFeature.attributes.UNIKALUS_NR === feature.attributes.UNIKALUS_NR))) {

          //newFeature.geometry.type === "point" ? this.identifyPointCoordinates = { "x": newFeature.geometry.x, "y": newFeature.geometry.y } : "";
          newFeature.geometry.type === "point" ? this.pointObs.next(newFeature.geometry) : "";
          //result.layerId
          let layer = projectsLayer.sublayers.items.filter(layer => {
            if (layer.id === result.layerId) {
              return layer;
            }
          });
          this._mapService.selectionResultsToGraphic(map, newFeature, layer["0"].maxScale, layer["0"].minScale, layer, number + i);
          if (newFeature.geometry.type === "point") {  return newFeature.geometry; }
        }
      });
  }).then(function(response) {

    return response.filter(item=>item)[0];
  }, (error) => { console.error(error); });
  }

showOnlySlectionGraphic(id, map, view, features) {
  let query = this.projectsListService.Query();
  let number: number = 0;
  this.map = map;
  this.view = view;
  this.featureLayers = features;
  //remove any selection layers
  this.removeSelectionLayers();
  //TODO remove old graphic if exists
  this.view.graphics.items = [];
  query.where = "UNIKALUS_NR=" + id;
  query.outFields = ["*"];
  query.returnGeometry = true;
  //get point coordinates from points layer
  this.featureLayers.map(layer => {
    //console.log("featureLayers :", layer)
    return layer.queryFeatures(query).then((results) => {
      if (results.features.length > 0) {
        this.queryResultsToGraphic(this.map, results, layer, number);
        // + 1 after queryResultsToGraphic()
        number += 1;
      }
    }, (err) => console.log(err)), (err) => console.log(err);

  });
}

identifyAttributesByID(id) {
  let query = this.projectsListService.Query();
  let number: number = 0;

  //remove any selection layers
  this.removeSelectionLayers();

  //TODO remove old graphic if exists
  this.view.graphics.items = [];

  query.where = "UNIKALUS_NR=" + id;

  query.outFields = ["*"];
  query.returnGeometry = true;

  //get point coordinates from points layer
  this.featureLayers.map(layer => layer.queryFeatures(query).then((results) => {
    if (results.features.length > 0) {
      let pointXY: number[];
      //execute query to get selection geometry only after point coordinates has been asigned to let pointXY, and only on first point element (number = 0)
      if ((results.geometryType === "point")) {
        pointXY = this.getPointXY(results);
        //this.view.popup =  "undefined";
        //clear popup
        this.view.popup.clear()
        this.view.popup.visible = false;
        //change popup position
        this.view.popup.dockEnabled = true;
        this.view.popup.position = 'bottom-center';
        this.initPopup(results, pointXY);
      }
      this.queryResultsToGraphic(this.map, results, layer, number);
      // + 1 after queryResultsToGraphic()
      number += 1;
    }
  }, (err) => console.log(err)));
}

//list item identify
identifyAttributes(e: any) {
  let query = this.projectsListService.Query();
  let number: number = 0;
  //first graphics unique id
  let uniqueId: number;
  //add padding to point feature and get featureset attributes
  let pxWidth = this.view.extent.width / this.view.width;
  let padding = 10 * pxWidth;
  //let padding = 0;
  let qGeom;
  //TODO remove old graphic if exists
  this.view.graphics.items = [];
  const geometry = e.mapPoint;
  qGeom = new Extent({
    "xmin": geometry.x - padding,
    "ymin": geometry.y - padding,
    "xmax": geometry.x + padding,
    "ymax": geometry.y + padding,
    "spatialReference": this.view.extent.spatialReference
  });
  // use the extent for the query geometry
  query.geometry = qGeom;

  query.outFields = ["*"];
  query.returnGeometry = true;

  //get point coordinates from points layer
  this.featureLayers.map(layer => layer.queryFeatures(query).then((results) => {
    //get only first graphic number = 0, TODO changeExpressionge to promise
    if ((results.features.length > 0) && (number === 0)) {
      uniqueId = results.features["0"].attributes.UNIKALUS_NR;
      this.identifyAttributesByID(uniqueId);
      number += 1;
    }
  }, (err) => console.log(err))
  );
}

getPointXY(results: any) {
  //get only point coordinates
  let pointX, pointY;
  pointX = results.features[0].geometry.x;
  pointY = results.features[0].geometry.y;
  //return x and y in array
  return [pointX, pointY]
}

//selection results to graphic by creating new graphic layer
queryResultsToGraphic(map: any, results: any, layer: any, number: number): void {
  this._mapService.selectionResultsToGraphic(map, results.features[0], results.features[0].layer.maxScale, results.features[0].layer.minScale, layer, number);
}

//init Popup only on point for all geomtry type based on scale
initPopup(results: any, pointXY) {
  //console.log("XY", pointXY)
  let pt = new Point({
    x: pointXY[0],
    y: pointXY[1],
    spatialReference: {
      "wkid": 3346
    }
  });
  this.openPopUp(results, pt);
}

openPopUp(results: any, point: any) {
  this.view.popup.open({
    location: point,
    title: results.features[0].attributes.Pavadinimas,
    content: this.projectsListService.getPopUpContent(results.features[0].attributes)
  });
  this.view.goTo({
    target: point
  }, MapOptions.animation.options);
}
}
