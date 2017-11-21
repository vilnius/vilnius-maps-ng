"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/map");
var Map = require("esri/Map");
var Graphic = require("esri/Graphic");
var SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
var SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
var SimpleFillSymbol = require("esri/symbols/SimpleFillSymbol");
var MapView = require("esri/views/MapView");
var MapImageLayer = require("esri/layers/MapImageLayer");
var FeatureLayer = require("esri/layers/FeatureLayer");
var TileLayer = require("esri/layers/TileLayer");
var GraphicsLayer = require("esri/layers/GraphicsLayer");
var options_1 = require("./options");
var projects_list_service_1 = require("./projects-list/projects-list.service");
var MapService = (function () {
    function MapService(http, projectsService) {
        this.http = http;
        this.projectsService = projectsService;
    }
    MapService.prototype.initMap = function (options) {
        //return new Map(options);
        return new Map();
    };
    MapService.prototype.viewMap = function (map) {
        return new MapView({
            //container: this.elementRef.nativeElement.firstChild, // AG good practis
            container: 'map',
            popup: {
                dockEnabled: true,
                dockOptions: {
                    position: 'bottom-left',
                    // Disables the dock button from the popup
                    buttonEnabled: true,
                    // Ignore the default sizes that trigger responsive docking
                    breakpoint: false,
                }
            },
            map: map,
            //center: [25.266, 54.698], // lon, lat
            zoom: 1,
            extent: options_1.MapOptions.mapOptions.extent
        });
    };
    MapService.prototype.initDynamicLayer = function (layer, opacity) {
        return new MapImageLayer({
            url: layer,
            id: 'itv',
            outFields: ["*"],
            opacity: opacity || 1,
            title: 'itv-layer'
        });
    };
    MapService.prototype.initGraphicLayer = function (id, scale) {
        if (scale === void 0) { scale = ""; }
        return new GraphicsLayer({
            id: "selection-graphic-" + id,
            declaredClass: "selected",
            maxScale: scale["max"],
            minScale: scale["min"]
        });
    };
    MapService.prototype.initGraphic = function (type, name, attr, geom, scale, graphicLayer) {
        if (scale === void 0) { scale = ""; }
        return new Graphic({
            attributes: attr,
            geometry: geom,
            popupTemplate: {
                title: this.projectsService.getPopUpTitle(attr),
                content: this.projectsService.getPopUpContent(attr)
            },
            symbol: this.initSymbol(type),
            layer: graphicLayer
        });
    };
    MapService.prototype.initSymbol = function (type) {
        var symbol;
        switch (type) {
            case "point":
                symbol = new SimpleMarkerSymbol({
                    //color: [251,215,140],
                    size: "12px",
                    outline: {
                        //color: [251,215,140],
                        color: [181, 14, 18],
                        style: "solid",
                        width: 3
                    }
                });
                break;
            case "polyline":
                symbol = new SimpleLineSymbol({
                    //color: [251,215,140],
                    color: [181, 14, 18],
                    style: "solid",
                    width: 3
                });
                break;
            case "polygon":
                symbol = new SimpleFillSymbol({
                    //color: [251,215,140],
                    outline: {
                        //color: [251,215,140],
                        color: [181, 14, 18],
                        style: "solid",
                        miterLimit: 1,
                        width: 3
                    }
                });
                break;
        }
        return symbol;
    };
    MapService.prototype.initTiledLayer = function (layer) {
        return new TileLayer({
            url: layer
        });
    };
    MapService.prototype.initFeatureLayer = function (layer, opacity, index) {
        return new FeatureLayer({
            url: layer,
            id: 'itv-feature-' + index,
            outFields: ["*"],
            opacity: opacity || 1,
            //definitionExpression: 'Pabaiga=2018',
            title: 'itv-feature-layer-' + index,
        });
    };
    //count REST layers and only if it's not grouped (not implemented)
    MapService.prototype.countRestlayers = function (url) {
        return this.http.get(url)
            .map(this.getData)
            .catch(this.handleError);
    };
    MapService.prototype.getData = function (res) {
        var jsonResponse = res.json();
        //console.log("jsonResponse", jsonResponse);
        return jsonResponse;
    };
    MapService.prototype.handleError = function (error) {
        // In a real world app, we might use a remote logging infrastructure
        var errMsg;
        if (error instanceof http_1.Response) {
            var body = error.json() || '';
            var err = body.error || JSON.stringify(body);
            errMsg = error.status + " - " + (error.statusText || '') + " " + err;
        }
        else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable_1.Observable.throw(errMsg);
    };
    MapService.prototype.createFeatureLayers = function (layersNumber, url) {
        var i = layersNumber - 1, array = [];
        while (i >= 0) {
            var featureUrl = url + "/" + i;
            array.push(this.initFeatureLayer(featureUrl, 1, i));
            i -= 1;
        }
        this.featureLayerArr = array;
        //console.log(array[i]);
        return array;
    };
    MapService.prototype.returnFeatureLayers = function () {
        return this.featureLayerArr;
    };
    MapService.prototype.removeSelectionLayers = function (map) {
        //find layer and remove it, max 4 layers: polygon, polyline, point, and additional point if scale is set from point to point in mxd
        var layer1 = map.findLayerById("selection-graphic-0");
        var layer2 = map.findLayerById("selection-graphic-1");
        var layer3 = map.findLayerById("selection-graphic-2");
        var layer4 = map.findLayerById("selection-graphic-3");
        layer1 ? map.remove(layer1) : false;
        layer2 ? map.remove(layer2) : false;
        layer3 ? map.remove(layer3) : false;
        layer4 ? map.remove(layer4) : false;
    };
    MapService.prototype.initSelectionGraphic = function (result, scale, graphicLayer) {
        if (result.geometry.type === "point") {
            return this.initGraphic("point", "selected-feature", result.attributes, result.geometry, scale, graphicLayer);
        }
        if (result.geometry.type === "polyline") {
            return this.initGraphic("polyline", "selected-feature", result.attributes, result.geometry, scale, graphicLayer);
        }
        if (result.geometry.type === "polygon") {
            return this.initGraphic("polygon", "selected-feature", result.attributes, result.geometry, scale, graphicLayer);
        }
    };
    //selection results to graphic by creating new graphic layer
    MapService.prototype.selectionResultsToGraphic = function (map, results, maxScale, minScale, layer, number) {
        // let graphicLayer
        var graphicLayer;
        var graphic;
        //set opacity
        //layer.opacity = 0.9;
        graphicLayer = this.initGraphicLayer(number, { max: maxScale, min: minScale });
        graphic = this.initSelectionGraphic(results, { max: maxScale, min: minScale }, graphicLayer);
        graphicLayer.add(graphic);
        map.add(graphicLayer);
        //watch layer creaton and asign class to svg graphcis
        graphicLayer.on("layerview-create", function (event) {
            // The LayerView for the layer that emitted this event
            //event.layerView.graphicsView.graphics.items["0"].symbol.setAttribute("class", "selected-itv-point");
            //event.layerView.graphicsView._frontGroup.parent.element.className += " selected-itv-point";
            setTimeout(function () {
                var node = event.layerView.graphicsView._frontGroup.parent;
                node ? node.element.className += " selected-itv-point" : node;
                //console.log(event.layerView.graphicsView._frontGroup.parent.element.className);
            }, 1000);
        });
    };
    return MapService;
}());
MapService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http, projects_list_service_1.ProjectsListService])
], MapService);
exports.MapService = MapService;
//# sourceMappingURL=map.service.js.map