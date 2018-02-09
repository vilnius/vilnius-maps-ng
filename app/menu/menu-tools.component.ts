import { Component, OnInit, AfterViewInit, ViewChild, Input, Output, EventEmitter, ElementRef, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';

import { MapOptions } from '../options';
import { Symbols } from './symbols';
import { MapService } from '../map.service';
import { MenuToolsService } from './menu-tools.service';

import Print = require('esri/widgets/Print');
import Draw = require('esri/views/2d/draw/Draw');
import Graphic = require('esri/Graphic');
import Polygon = require('esri/geometry/Polygon');
import geometryEngine = require('esri/geometry/geometryEngine');
import BufferParameters = require('esri/tasks/support/BufferParameters');
import SpatialReference = require('esri/geometry/SpatialReference');


import { forOwn } from 'lodash';

@Component({
  selector: 'menu-tools',
  styles: [`
    .form-control {
      border: 1px solid #ccc;
    }
  `],
  templateUrl: './app/menu/menu-tools.component.html',
  providers: [MenuToolsService]
})

export class MenuToolsComponent implements OnInit, AfterViewInit {
  @Input() viewTools: any;
  //set  toolsActive to false in parent component and get back menu wrapper for mobile
  @Output() close: EventEmitter<any> = new EventEmitter();
  // @ViewChild('measureButton') measureButton: ElementRef;
  @ViewChild('bufferCheckbox') bufferCheckbox: ElementRef;

  checkboxChecked: boolean;

  printWidget: any;

  printActive: boolean = false;
  measureButtonActive: boolean = false;
  activeToolsState = false;

  analyzeParams = {
    bufferSize: 1,
    inputlayer: null,
    chosenUnit: "km"
  };

  units = [
    "km", "m"
  ];

  //geomettry created by draw tools
  drawGeometry: any;
  geometryService: any;

  //calculated result string
  calculatedUnits: string;

  //calculated feature number
  calculateCount: number;

  measureActive: boolean;

  measureActiveOpt: any = {
    pointActive: {
      name: "draw-point",
      active: false
    },
    lineActive: {
      name: "draw-line",
      active: false
    },
    polyActive: {
      name: "draw-polygon",
      active: false
    }
  };

  activeTool = "";

  view: any;
  draw: any;

  //final form inputs for building selection form
  themeLayers = [];

  //dojo draw events handlers Array
  eventHandlers = [];

  constructor(private mapService: MapService, private menuToolsService: MenuToolsService, private renderer: Renderer2) { }

  checkBoxChange() {
    //clear graphics if exist
    this.view.graphics.removeAll();
    this.checkboxChecked = this.bufferCheckbox.nativeElement.checked;
    this.calculatedUnits = null;
    this.calculateCount = null;
  }

  closeMeasure() {
    this.measureActive = !this.measureActive;
    this.restoreDefault();
  }

  restoreDefault() {
    this.calculatedUnits = null;
    this.calculateCount = null;
    this.checkboxChecked = false;
    this.bufferCheckbox.nativeElement.checked = false;
    this.deactivateBtn();
    //set active tool to empty string
    this.activeTool = "";
    this.checkBoxChange();

    this.removeEventHandlers();
  }

  //remove eventHandlers
  removeEventHandlers() {
    this.eventHandlers.forEach((event) => {
      event.remove();
    });
    this.eventHandlers = [];
  }

  drawElement() {
    //this.measureButtonActive = !this.measureButtonActive;
    this.measureButtonActive = false;
    //esri draw approach
    //this.view.graphics.removeAll(); //TODO check if we need to removeAll in final solution
    //TODO refactor
    switch (this.activeTool) {
      case "draw-polygon":
        this.enableCreatePolygon(this.draw, this.view, this.activeTool);
        break;
      case "draw-line":
        this.enableCreatePolyline(this.draw, this.view);
        break;
      case "draw-point":
        this.enableCreatePoint(this.draw, this.view);
        break;
    }
  }

  selectDrawEl(evt, id) {
    if (id === this.activeTool) {
      this.activeTool = "";
      this.resetTools();
    } else {
      //suspend layers toggle (e.g. suspend layers while drawing with measure tools)
      this.mapService.suspendLayersToggle();
      this.resetTools();
      this.activateTool(id);
      this.drawElement();
    }
  }

  resetTools() {
    //reset eventHandler events
    this.removeEventHandlers();

    this.calculateCount = null;
    this.calculatedUnits = null;
    this.measureButtonActive = false;
    this.view.graphics.removeAll();
  }

  //activate measure tools based on id
  activateTool(id: string) {
    //check if any tool is active
    this.activeToolsState = false;
    //iterate with lodash
    forOwn(this.measureActiveOpt, (value, key) => {
      //active tools
      if (value.name === id) {
        value.active = !value.active;
        //add or remove disabled attribute and activeTool name
        this.activeToolsState = true;
        this.activeTool = value.name;

      }
    });
  }

  //Polygon approach
  enableCreatePolygon(draw, view, activeTool) {
    // create() will return a reference to an instance of PolygonDrawAction
    let action = this.draw.create("polygon");
    // focus the view to activate keyboard shortcuts for drawing polygons
    this.view.focus();
    // listen to vertex-add event on the action
    this.eventHandlers.push(action.on("vertex-add", (e) => this.drawPolygon(e)));
    // listen to cursor-update event on the action
    this.eventHandlers.push(action.on("cursor-update", (e) => this.drawPolygon(e)));
    // listen to vertex-remove event on the action
    this.eventHandlers.push(action.on("vertex-remove", (e) => this.drawPolygon(e)));
    // listen to draw-complete event on the action
    this.eventHandlers.push(action.on("draw-complete", (e) => { this.drawPolygon(e, true) }));
  }

  //ngClass workout
  deactivateBtn() {
    this.measureButtonActive = false;
  }

  //Label polyon with its area
  labelAreas(geom, area, ended) {
    this.calculatedUnits = area.toFixed(4) + " km²"
    //console.log("Geometry label", geom);
    const graphic = this.menuToolsService.createAreaLabelGraphic(geom, area, ended);
    this.view.graphics.add(graphic);
  }

  analyzeByLayer(evt) {
    this.measureButtonActive = true;
  }

  deactivateAndDisable(evt) {
    //on complete remove class
    if (evt.type === "draw-complete") {
      //first unsuspend layers on draw-complete event
      //set timeout, needed for point element specificallly as we do not want to start identify method too early
      setTimeout(() => {
        this.mapService.unSuspendLayersToggle();
      }, 800);

      this.deactivateBtn();
      //create buffer if create buffer checkbox checked
      //(this.checkboxChecked) ? this.createBuffer(this.analyzeParams) : void(0);
      this.checkboxChecked && (this.createBuffer(this.analyzeParams));
      //set active tool to empty string
      this.activeTool = "";
    }
  }

  drawPolygon(evt, ended = false) {
    //on complete remove class
    this.deactivateAndDisable(evt);

    let vertices = evt.vertices;
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
    let area = geometryEngine.planarArea(polygon, "square-kilometers");
    if (area < 0) {
      // simplify the polygon if needed and calculate the area again
      let simplifiedPolygon = geometryEngine.simplify(polygon);
      if (simplifiedPolygon) {
        area = geometryEngine.planarArea(simplifiedPolygon, "square-kilometers");
      }
    }
    // start displaying the area of the polygon
    this.labelAreas(polygon, area, ended);
  }

  closeToggle() {
    window.location.hash = "#";
    //emit close event
    this.close.emit(false);
  }

  //Polyline approach
  enableCreatePolyline(draw, view) {
    let action = draw.create("polyline");

    // listen to PolylineDrawAction.vertex-add
    // Fires when the user clicks, or presses the "F" key
    // Can also fire when the "R" key is pressed to redo.
    this.eventHandlers.push(action.on("vertex-add", (evt) => {
      this.createPolylineGraphic(evt);
    }));

    // listen to PolylineDrawAction.vertex-remove
    // Fires when the "Z" key is pressed to undo the
    // last added vertex
    this.eventHandlers.push(action.on("vertex-remove", (evt) => {
      this.createPolylineGraphic(evt);
    }));

    // listen to PolylineDrawAction.cursor-update
    // fires when the pointer moves over the view
    this.eventHandlers.push(action.on("cursor-update", (evt) => {
      this.createPolylineGraphic(evt);
    }));

    // listen to PolylineDrawAction.draw-complete
    // event to create a graphic when user double-clicks
    // on the view or presses the "C" key
    this.eventHandlers.push(action.on("draw-complete", (evt) => {
      this.createPolylineGraphic(evt, true);
    }));
  }

  createPolylineGraphic(evt, ended = false) {
    this.deactivateAndDisable(evt);

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
    let line = geometryEngine.planarLength(graphic.geometry, "kilometers");
    const lastIndex = polyline.paths.length - 1;
    this.labelLinesAndPoints("line", polyline.paths[lastIndex], line, ended);
  }

  //Label text
  labelLinesAndPoints(geometryType: string, points, geometry = undefined, ended) {
    //this.calculatedUnits
    const endString = ended ? "" : " (užbaigti dvigubu paspaudimu)";
    let text: string;
    geometryType === "line" ? text = geometry.toFixed(3) + " km" + endString : text = `x: ${points[1].toFixed(2)}, y: ${points[0].toFixed(2)}`;
    geometryType === "line" ? this.calculatedUnits = geometry.toFixed(3) + " km" : this.calculatedUnits = `x: ${points[1].toFixed(2)}, y: ${points[0].toFixed(2)}`
    const graphic = this.menuToolsService.createLineOrPointLabelGraphic(points, text, this.view);
    this.view.graphics.add(graphic);
  }

  //Point approach
  enableCreatePoint(draw, view) {
    let action = draw.create("point");

    // PointDrawAction.cursor-update
    // Give a visual feedback to users as they move the pointer over the view
    this.eventHandlers.push(action.on("cursor-update", (evt) => {
      this.createPointGraphic(evt);
    }));

    // PointDrawAction.draw-complete
    // Create a point when user clicks on the view or presses "C" key.
    this.eventHandlers.push(action.on("draw-complete", (evt) => {
      this.createPointGraphic(evt);
    }));
  }

  createPointGraphic(evt) {
    this.deactivateAndDisable(evt);

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

  //submit form() // not using at the moment, using NgModel analyzeParams object instead
  onSubmitAnalyze(form: NgForm) {
    // console.log("NG Form ", form);
    // console.log("Form obj ", this.analyzeParams);
    this.createBuffer(this.analyzeParams)
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
    return themeLayerInputs.reverse();
  }

  createBuffer(options: any) {
    //add required options for buffer execution
    let parameters = new BufferParameters();
    parameters.distances = [options.bufferSize];
    parameters.unit = options.chosenUnit === "m" ? "meters" : "kilometers";
    parameters.geodesic = true;
    //options.bufferSpatialReference = new SpatialReference({wkid: 3346});
    parameters.bufferSpatialReference = this.view.spatialReference;
    //parameters.spatialReference = new SpatialReference({wkid: 2600});
    parameters.outSpatialReference = this.view.spatialReference;
    parameters.geometries = [this.drawGeometry.geometry];
    this.geometryService.buffer(parameters).then((results) => {
      const polyline = new Graphic({
        geometry: results[0],
        symbol: Symbols.bufferSymbol
      });
      //Add as layer approach
      //const features = result.features
      // const layer = new GraphicsLayer({
      //   graphics: [polyline],
      //   id: "bufferPolygon",
      //   title: "bufferPolygon",
      //   popupEnabled: false
      // })
      // const map = this.mapService.returnMap();
      // map.add(layer);

      //Add as graphic on view approach
      this.view.graphics.add(polyline);

      //add union if only input is selected
      if (options.inputlayer >= 0) {
        const input = this.themeLayers.find((le, i) => i === options.inputlayer);
        //console.log("Selected input", input)
        const selectedGraphixByInput = this.createQuery(input, polyline);
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
    query.outFields = ["*"];
    query.geometry = polyline.geometry;

    queryTask.execute(query).then((result) => {
      const symbol = this.getSymbol(result.features[0]);

      const features = result.features.map((feature) => {
        feature.symbol = symbol;
        return feature;
      });

      this.calculateCount = features.length;
      //create ulr string
      const stringArray = input.url.split("/");
      const stringUrl = input.url.slice(0, -(stringArray[stringArray.length - 1].length + 1))

      //Add as graphic on view approach
      //graphic to graphics layer
      features.forEach((graphic) => { this.view.graphics.add(graphic) });

      return result.features;
    }, (error) => {
      console.error(error);
    });
  }

  ngOnInit() {
    //measurements geometric service, changed to VP service
    this.geometryService = this.menuToolsService.addGeometryService(MapOptions.mapOptions.staticServices.geometryUrl)

    this.view = this.mapService.getView();

    //init Print
    this.printWidget = this.menuToolsService.initPrint(this.view);

    //add draw capabilities for temporary geometries
    this.view.then((view) => {
      this.draw = new Draw({
        view: this.view
      });
    });

    this.view.on("layerview-create", (event) => {
      //wait for last layer to be loaded then init createInputsData
      if (event.layer.id === "allLayers") {
        //TODO create buffer inputs from theme layers
        //create buffer inputs data
        this.themeLayers = this.createInputsData(this.view);
      }
    });
  }

  ngAfterViewInit() {
  }
}
