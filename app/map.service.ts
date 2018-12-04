import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject } from 'rxjs';
import { retry, shareReplay } from 'rxjs/operators';

import { MapOptions } from './options';

import Map = require("esri/Map");
import Graphic = require("esri/Graphic");
import Point = require("esri/geometry/Point");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import SimpleFillSymbol = require("esri/symbols/SimpleFillSymbol");
import Extent = require("esri/geometry/Extent");
import Color = require("esri/Color");
import Renderer = require("esri/renderers/Renderer");
import MapView = require("esri/views/MapView");
import GroupLayer = require("esri/layers/GroupLayer");
import MapImageLayer = require("esri/layers/MapImageLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");
import TileLayer = require("esri/layers/TileLayer");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Basemap = require("esri/Basemap");
import LayerList = require("esri/widgets/LayerList");
import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");

@Injectable()
export class MapService {
  //selection graphic layer array:
  private allGraphicLayers: any[] = [];
  private featureLayerArr: any[];

  //suspend layers toggle (e.g. suspend layers while drawing with measure tools)
  suspendedIdentitication: boolean = false;
  private view: any;

  //visible layers
  visibleLayers: {};
  visibleSubLayerNumber: number = 0;
  private queryParams: any;
  map: any;

  //dynamic projects layer
  projectsDynamicLayer: any;

  // Observable  source
  private layersStatusObs = new Subject();
  // Observable item stream
  layersStatus = this.layersStatusObs.asObservable();

  //array of raster layers Name
  rasterLayers = [];
  //all layers for "allLayers"
  subDynamicLayers: any;

  // caching sublayer request
  sublayersJsonCache$: Observable<any>

  // cache every layer that has been initated duaring apps lifecycle
  // use layers for themeServiceUrl
  private cacheLayers = [];

  // progress bar loader
  progressBar: any;

  constructor(private zone: NgZone, private http: HttpClient) { }

  setProgressBar(bar): void {
    this.progressBar = bar;
  }

  getProgressBar() {
    return this.progressBar;
  }

  initMap(options: Object): Map {
    this.map = new Map(options);
    return this.map;
  }

  viewMap(map: Map): MapView {
    // using runOutsideAngular instead of onPush change detection in component o avoid view ESRI UPDATES constanly initaiting change detection
    this.zone.runOutsideAngular(() => {
      const view = new MapView({
        //container: this.elementRef.nativeElement.firstChild, // AG good practis
        container: 'map',
        constraints: {
          snapToZoom: true, //When true, the view snaps to the next LOD when zooming in or out. When false, the zoom is continuous.
          rotationEnabled: true  // Disables map rotation
        },
        popup: {
          dockEnabled: true,
          dockOptions: {
            position: 'bottom-left',
            // Disables the dock button from the popup
            buttonEnabled: true,
            // Ignore the default sizes that trigger responsive docking
            breakpoint: false
          }
        },
        map: map,
        //center: [25.266, 54.698], // lon, lat
        zoom: 1,
        extent: MapOptions.mapOptions.extent
      });
      this.watchLayers(view);
      this.view = view;
    });
    return this.view;
  }

  watchLayers(view) {
    view.on("layerview-create", (event) => {
			/**
			 * check if layer was cached:
			 * @prop {boolean} isInCache checfk if any value is cached,
			 * cache only unqique layer
			 * using some() instead of filter for efficiency
			 */
      const isInCache = this.cacheLayers.some(layer => layer.id === event.layer.id);
      if (isInCache) {
      } else {
        this.cacheLayers.push(event.layer);
      }
    });
  }

  returnQueryParams() {
    return this.queryParams;
  }

  //special array of Raster layers name in service componentent
  getRasterLayers() {
    return this.rasterLayers;
  }

  //special array of Raster layers name in service componentent
  setRasterLayers(layers) {
    this.rasterLayers = layers;
  }

  //create GroupLayer
  //listMode Indicates how the layer should display in the LayerList widget
  // listMode value	Description:
  // show:The layer is visible in the table of contents.
  // hide:	The layer is hidden in the table of contents.
  // hide-children:	If the layer is a GroupLayer, hide the children layers from the table of contents.
  initGroupLayer(id: string, name: string, listMode: string) {
    return new GroupLayer({
      id: id,
      title: name,
      listMode: listMode//,
      //visibilityMode: "independent"
    });
  }

  //update view
  updateView(view) {
    return this.view = view;
  }

  getView() {
    return this.view;
  }

  //update map
  updateMap(map) {
    return this.map = map;
  }

  returnMap() {
    return this.map;
  }

  //suspend layers toggle (e.g. suspend layers while drawing with measure tools), define boolean type value, isntead of  this.suspendedIdentitication = !this.suspendedIdentitication
  suspendLayersToggle() {
    this.suspendedIdentitication = true;
  }

  unSuspendLayersToggle() {
    this.suspendedIdentitication = false;
  }

  getSuspendedIdentitication() {
    return this.suspendedIdentitication;
  }

  //for default themes
  initDynamicLayer(layer: string, id: string = "itv", title: string = "itv", opacity = 1, sublayers = null, popupEnabled = true) {
    return new MapImageLayer({
      url: layer,
      id: id,
      opacity,
      title,
      sublayers,
      listMode: 'show'
    });
  }

  //for projects theme
  initDynamicLayerITV(layer: string, id: string = "itv", name: string = "itv", opacity = 1) {
    return new MapImageLayer({
      url: layer,
      id: id,
      opacity: opacity,
      title: name
    });
  }

  initSubAllDynamicLayers(layer: string, id: string = "itv", name: string = "itv", opacity = 1, sublayers: any[]) {
    return new MapImageLayer({
      url: layer,
      id: id,
      opacity: opacity,
      sublayers: sublayers,
      title: name
    });
  }

  initGraphicLayer(id: number, scale: any = {}) {
    return new GraphicsLayer({
      id: "selection-graphic-" + id,
      //declaredClass: "selected",
      maxScale: scale["max"],
      minScale: scale["min"]
    });
  }

  initFeatureSelectionGraphicLayer(name: string, maxScale, minScale, listMode = 'show') {
    return new GraphicsLayer({
      listMode,
      id: name,
      maxScale,
      minScale
    });
  }

  initGraphic(type: string, name: String, attr: any, geom, scale: any = "", graphicLayer, size = '12px', style = 'solid') {
    return new Graphic({
      geometry: geom,
      symbol: this.initSymbol(type, size, style),
      layer: graphicLayer
    });
  }

  //create selection graphic for feature layers
  initFeatureSelectionGraphic(type: string, geometry, layer, attributes, size = '12px', style = 'solid') {
    return new Graphic({
      attributes,
      geometry,
      layer,
      symbol: this.initSymbol(type, size, style)
    });
  }

  initSymbol(type: string, size: any, style: string) {
    let symbol;
    switch (type) {
      case "point":
        symbol = new SimpleMarkerSymbol({
          color: new Color([255, 255, 255, 0]),
          size,
          outline: { // autocasts as new SimpleLineSymbol()
            color: new Color([181, 14, 18, 1]),
            style,
            width: 3
          }
        });
        break;
      case "polyline":
        symbol = new SimpleLineSymbol({
          //color: [251,215,140],
          color: new Color([181, 14, 18, 1]),
          style: "solid",
          width: 3
        });
        break;
      case "polygon":
        symbol = new SimpleFillSymbol({
          //color: [251,215,140],
          outline: { // autocasts as new SimpleLineSymbol()
            //color: [251,215,140],
            color: new Color([181, 14, 18, 1]),
            style: "solid",
            miterLimit: 1,
            width: 3
          }
        });
        break;
    }
    return symbol;
  }

  //remove selection of feature layer with id name
  removeFeatureSelection(name = 'FeatureSelection') {
    //remove existing graphic
    const selectionLayer = this.map.findLayerById(name)
    if (selectionLayer) {
      this.map.remove(selectionLayer)

      //FIXME temp removing dublicates
      this.removeFeatureSelection();
    }
  }

  initTiledLayer(layer: string, name: string, visible = true): TileLayer {
    return new TileLayer({
      url: layer,
      id: name,
      visible
    });
  }

  initFeatureLayer(layer: string, opacity = 1, index: number): FeatureLayer {
    return new FeatureLayer({
      url: layer,
      id: 'itv-feature-' + index,
      outFields: ["*"],
      opacity,
      //definitionExpression: 'Pabaiga=2018',
      title: 'itv-feature-layer-' + index
    });
  }

  initCommonFeatureLayer(layer: string, opacity = 1, id: number, title, symbolType): FeatureLayer {
    return new FeatureLayer({
      url: layer,
      id: 'feature-' + id,
      outFields: ["*"],
      opacity,
      title,
      legendEnabled: false, // do not show in Legend widget
      listMode: 'hide', //do not show in LayerList widget
      renderer: {
        type: 'simple',  // autocasts as new SimpleRenderer()
        symbol: this.initAutocastSymbol(symbolType)
      } as any as Renderer
    });
  }

  initAutocastSymbol(type) {
    let symbol;
    switch (type) {
      case 'simple-marker':
        symbol = {
          type,  // autocasts as new SimpleMarkerSymbol()
          color: [181, 14, 18, 0.01],
          outline: {
            style: "dash-dot",
            color: [181, 14, 18, 0.01]
          }
        };
        break;
      case 'simple-line':
        symbol = {
          type,
          color: [181, 14, 18],
          width: "1px",
          style: "long-dash-dot"
        };
        break;
      case 'simple-fill':
        symbol = {
          type,
          color: [255, 255, 255, 0.01],
          outline: {  // autocasts as new SimpleLineSymbol()
            width: 1,
            color: [181, 14, 18, 0.01]
          }
        };
        break;
    }
    return symbol;
  }

  //http fetch for default themes
  fetchRequest(url: string) {
    return this.http.get(url + "/layers?f=pjson")
      .pipe(
        retry(3)
      )
  }

  //http fetch for all sublayers and cache http request wioth shareReplay operator
  fetchSublayersRequest(url: string) {
    if (!this.sublayersJsonCache$) {
      this.sublayersJsonCache$ = this.http.get(url + "/layers?f=pjson")
        .pipe(
          //retry(3),
          shareReplay(1)
        );
      return this.sublayersJsonCache$;
    }
    return this.sublayersJsonCache$;
  }

  //http fetch for projects themes
  fetchRequestProjects(url: string) {
    return this.http.get(url + "?f=pjson")
      .pipe(
        retry(3)
      )
  }

  //projects theme add features to mapPoint
  addFeaturesToMap() {
    //count feature layers and add to map
    return this.fetchRequestProjects(MapOptions.themes.itvTheme.layers.mapLayer).subscribe((json: any) => {
      const layersCount = json.layers.length;
      //create layers arr
      const featureLayerArr = this.createFeatureLayers(layersCount, MapOptions.themes.itvTheme.layers.mapLayer);
      return featureLayerArr;
    });
  }

  addToMap(response, queryParams) {
		/**
		 * check if layer is was cached:
		 * @prop {array} cachedLayers - single value array
		 * @prop {number} isInCache - 0 or 1
		 */
    const cachedLayers = this.cacheLayers.filter(layer => layer.id === 'allLayers');
    const isInCache = cachedLayers.length;

    if (!isInCache) {
      response.subscribe(json => {
        //jus create sub Layers array for allLayers
        const sublayersArray = this.getSubDynamicLayerSubLayers(json.layers, true);

        //create layer and empty the sublayers object if this.queryParams allayers prop is not set
        let subLayers = [];
        if (queryParams.allLayers && (queryParams.identify === "allLayers")) {
          subLayers = sublayersArray;
        };
        const layer = this.initSubAllDynamicLayers(MapOptions.mapOptions.staticServices.commonMaps, "allLayers", "Pagalbiniai sluoksniai", 0.8, subLayers);
        this.map.add(layer);
        //check other url params if exists
        //activate layer defined in url query params
        this.activateLayersVisibility(this.view, queryParams, this.map);
      });
    } else {
      this.map.add(cachedLayers[0]);

      //check other url params if exists
      //activate layer defined in url query params
      this.activateLayersVisibility(this.view, queryParams, this.map);
    }

  }


	/**
	 * init specific theme layers
	 * @param {number} groupLayer = create group layer for custom themes
	 */
  pickMainThemeLayers(layer, key, queryParams, popupEnabled = true, groupLayer: any = false) {
		/**
		 * check if layer is was cached:
		 * @prop {array} cachedLayers - single value array
		 * @prop {number} isInCache - 0 or 1
		 */
    const cachedLayers = this.cacheLayers.filter(layer => layer.id === key);
    const isInCache = cachedLayers.length;
    if (!isInCache) {
      const response = this.fetchRequest(layer.dynimacLayerUrls);
      response.subscribe(
        (json: any) => {
          if (!json.error) {
            // add dyn layers
            let sublayersArray = this.getSubDynamicLayerSubLayers(json.layers);
            let dynamicLayer = this.initDynamicLayer(layer.dynimacLayerUrls, key, layer.name, layer.opacity, sublayersArray, popupEnabled)

            //for Layerlist 4.4 API bug fix
            if (groupLayer) {
              groupLayer.add(dynamicLayer);
            } else {
              this.map.add(dynamicLayer);
            }

            //check other url params if exists
            //activate layer defined in url query params
            this.activateLayersVisibility(this.view, queryParams, this.map);

            //check for type raster and push to array
            json.layers.forEach((layer) => {
              if (layer.type === "Raster Layer") {
                this.rasterLayers.push(layer.name);
              }
            });
          }

        },
        err => console.error(`VP dyamic layer not loaded`, err)
      );
    } else {
      if (groupLayer) {
        groupLayer.add(cachedLayers[0]);
      } else {
        this.map.add(cachedLayers[0]);
      }

      //check other url params if exists
      //activate layer defined in url query params
      this.activateLayersVisibility(this.view, queryParams, this.map);
    }

  }

  //run query by geometry
  runQueryByGeometry(urlStr: string, geometry: any) {
    const query = this.addQuery();
    const queryTask = this.addQueryTask(urlStr);
    query.geometry = geometry;
    query.outFields = ['*'];
    query.returnGeometry = true;
    return queryTask.execute(query).then((result) => {
      return result;
    }, (error) => { console.error(error); });
  }

  pickCustomThemeLayers(response, layer, key, queryParams, groupLayer, serviceKey, symbolType = 'simple-fill') {
    //console.log('arguments', arguments);
    response.subscribe(json => {
      //(layer: string, opacity, index: number, id: number, title)
      let feature = this.initCommonFeatureLayer(layer.dynimacLayerUrls + '/' + serviceKey, layer.opacity, key, layer.name, symbolType);
      if (groupLayer) {
        groupLayer.add(feature);
      } else {
        this.map.add(feature);
      }
      //check other url params if exists
      //activate layer defined in url query params
      this.activateLayersVisibility(this.view, queryParams, this.map);

      //check for type raster and push to array
      json.layers.forEach((layer) => {
        if (layer.type === "Raster Layer") {
          this.rasterLayers.push(layer.name);
        }
      })
    });
  }

  createFeatureLayers(layersNumber: number, url: String) {
    let i = layersNumber - 1, array = [];
    while (i >= 0) {
      let featureUrl: string = url + "/" + i;
      array.push(this.initFeatureLayer(featureUrl, 1, i));
      i -= 1;
    }

    this.featureLayerArr = array;
    return array;
  }

  returnFeatureLayers() {
    return this.featureLayerArr;
  }

  removeSelectionLayers(): void {
    if (this.allGraphicLayers.length > 0) {
      //remove all graphic from map
      this.allGraphicLayers.forEach(graphic => {
        graphic.removeAll();
        this.map.remove(graphic);
      });
      this.allGraphicLayers = [];
    }

  }

  initSelectionGraphic(result, scale, graphicLayer) {
    if (result.geometry.type === "point") {
      return this.initGraphic("point", "selected-feature", result.attributes, result.geometry, scale, graphicLayer);
    }

    if (result.geometry.type === "polyline") {
      return this.initGraphic("polyline", "selected-feature", result.attributes, result.geometry, scale, graphicLayer);
    }

    if (result.geometry.type === "polygon") {
      return this.initGraphic("polygon", "selected-feature", result.attributes, result.geometry, scale, graphicLayer);
    }

  }

  //selection results to graphic by creating new graphic layer
  selectionResultsToGraphic(map: any, results: any, maxScale: any, minScale: any, layer: any, number: number) {
    // let graphicLayer
    let graphicLayer;
    let graphic;
    graphicLayer = this.initGraphicLayer(number, { max: maxScale, min: minScale });
    this.allGraphicLayers.push(graphicLayer);
    graphic = this.initSelectionGraphic(results, { max: maxScale, min: minScale }, graphicLayer);
    graphicLayer.add(graphic);
    map.add(graphicLayer);

    //watch layer creaton and asign class to svg graphcis
    graphicLayer.on("layerview-create", function(event) {
      // The LayerView for the layer that emitted this event
      //do not add class and css animation on mobile devices
      if (!this.mobile) {
        setTimeout(function() {
          let node = event.layerView.graphicsView._frontGroup.parent;
          node ? node.element.className += " selected-itv-point" : node;
        }, 1000);
      }
    });
  }

  //on map component OnInit center and zoom based on URL query params
  centerZoom(view: any, params: any) {
    let point: any;
    point = [params.x ? parseFloat(params.x) : view.center.x, params.y ? parseFloat(params.y) : view.center.y];
    view.zoom = params.zoom;

    //center to point and add spatialReference
    point = new Point({
      x: point[0],
      y: point[1],
      spatialReference: {
        "wkid": 3346
      }
    });

    view.center = point;
  }

  // center Map on Compass clicking
  // init only once
  centerMapWithCompass() {
    this.centerZoom(this.view, { x: 581205.6135, y: 6064062.25 });
  }


  //on map component OnInit read checked layers params (if exists) and activate  visible layers
  activateLayersVisibility(view: any, params: any, map: any) {
    this.queryParams = params;
    if (Object.keys(params).length > 0) {
      for (let param in params) {
        if (params.hasOwnProperty(param)) {
          let layer = map.findLayerById(param);
          // console.log("layer found", layer);
          // console.log("param", param);
          if (layer) {
            layer.on("layerview-create", (event) => {
              // The LayerView for the layer that emitted this event
              this.findSublayer(layer, params[param], map);
            });

          }
        }
      }
    }
  }

  findSublayer(layer: any, ids: string, map: any) {
    let idsArr = ids.split("!");
    idsArr.forEach(id => {
      let sublayer = layer.findSublayerById(parseInt(id));
      sublayer ? sublayer.visible = true : "";
    })
  }

  //mobile check
  mobilecheck() {
    var check = false;
    (function(a) {
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor);
    return check;
  }

  initLayerListWidget(view, container: HTMLElement) {
    const listWidget = new LayerList({
      //container: "layer-list",
      container,
      view,
      listItemCreatedFunction: this.updateListItem
    });
    return listWidget;
  }

  //update certain features of Listlayer ListItems
  updateListItem(listItem) {
    listItem.item.open = true;
    if (listItem.item.parent == null) {
      listItem.item.actionsSections = [
        [],
        [{
          title: "Padidinti nepermatomumą",
          className: "esri-icon-up",
          id: "increase-opacity"
        }, {
          title: "Sumažinti nepermatomumą",
          className: "esri-icon-down",
          id: "decrease-opacity"
        }]
      ];
    }
  }

  updateOpacity(event) {
    const parentLayer = event.item.layer;
    const actionName = event.action.id;
    if (actionName === 'increase-opacity') {
      if (parentLayer.opacity < 1) {
        parentLayer.opacity += 0.1;
      }
    } else if (actionName === 'decrease-opacity') {
      if (parentLayer.opacity > 0) {
        parentLayer.opacity -= 0.1;
      }
    }
  }

  initSubLayerListWidget(view, map) {
    //let subLayer = map.findLayerById("allLayers");
    return new LayerList({
      container: "sub-layers-content-list",
      view: view,
      listItemCreatedFunction: this.updateListItem
      //operationalItems: this.getOperationalItems(subLayer)
      // operationalItems: [
      //   {
      //     layer: subLayer,
      //     actionsOpen: true,
      //     open: true,
      //     view: view
      //   }
      // ] as any as Collection
    });
  }

  //modify subLayer and remove current theme layer
  modifySubLayer(subLayer) {
    let layerMod = subLayer;
    let items = subLayer.sublayers.items.filter(layer => {
      if (layer.title !== "Transportas / Dviračiai") {
        return layer;
      }

    });
    layerMod.sublayers = items;
    return layerMod;

  }

  //not using this approach as identification extends to many separate promises
  getOperationalItems(layer) {
    //operational item type Array<any> or any[]
    let operationalItems: Array<any> = [];
    layer.sublayers.items.forEach(layer => {
      //operational item's object
      let innerItem = {
        layer: layer,
        open: true,
        view: this.view
      };
      operationalItems.push(innerItem);
    });
    return operationalItems.reverse();
  }

  //init custom basemaps
  customBasemaps(layersArray: any[]) {
    return new Basemap({
      baseLayers: layersArray,
      title: "Pagrindo žemėlapiai",
      id: "customBasemap"
    });
  }

  //validate ArcGis date string
  isValidDate(dateStr, reg) {
    return dateStr.match(reg) !== null;
  };

  getVisibleLayersContent(result): string {
    let reg = /(\d+)[.](\d+)[.](\d+)\s.*/; //regex: match number with . char, clear everything else
    let feature = result.feature,
      content = " ",
      layerName = result.layerName,
      attributes = feature.attributes;

    feature.attributes.layerName = layerName;

    for (let resultAtr in attributes) {
      if (attributes.hasOwnProperty(resultAtr)) {
        if (!(resultAtr == "OBJECTID" || resultAtr == "layerName" || resultAtr == "SHAPE" || resultAtr == "SHAPE.area" || resultAtr == "OID" || resultAtr == "Shape.area" || resultAtr == "SHAPE.STArea()" || resultAtr == "Shape" || resultAtr == "SHAPE.len" || resultAtr == "Shape.len" || resultAtr == "SHAPE.STLength()" || resultAtr == "SHAPE.fid" ||
          resultAtr == "Class value" || resultAtr == "Pixel Value" || resultAtr == "Count_" //TEMP check for raster properties
        )) { //add layers attributes that you do not want to show
          //AG check for date string
          if (this.isValidDate(attributes[resultAtr], reg)) {
            content += "<p><span>" + resultAtr + "</br></span>" + attributes[resultAtr].replace(reg, '$1-$2-$3') + "<p>";
          } else {
            var attributeResult = attributes[resultAtr];
            if (attributeResult !== null) { //attributes[resultAtr] == null  equals to (attributes[resultAtr]  === undefined || attributes[resultAtr]  === null)
              if ((attributeResult === " ") || (attributeResult === "Null")) {
                attributeResult = "-";
              }
            } else {
              attributeResult = "-";
            }
            content += "<p><span>" + resultAtr + "</br></span>" + attributeResult + "<p>";
          }
        } else if (resultAtr == "Class value" || resultAtr == "Pixel Value") {
          //TEMP check for raster properties 	and add custom msg
          content = '<p class="raster">Išsamesnė sluoksnio informacija pateikiama Meniu lauke <strong>"Žymėjimas"</strong></p>';
        }

      }
    }
    return content;
  }

  //set itv theme dynamic projects layer
  setProjectsDynamicLayer(projectsDynamicLayer: any) {
    this.projectsDynamicLayer = projectsDynamicLayer;
  }

  //get itv theme dynamic projects layer
  getProjectsDynamicLayer() {
    return this.projectsDynamicLayer;
  }

  //set Layer list checkbox status: on or off (true | false)
  setLayersStatus(isChecked: boolean) {
    this.layersStatusObs.next(isChecked);
  };

  /**
	 * Layerlist 4.4 API bug fix, return sublayers array,TODO remove fix in 4.5 AP
	 * @param {booelan} isSublayer - cache sublayers of all layers widget
	 * initiate only once
	 */
  getSubDynamicLayerSubLayers(layers: Array<any>, isSublayer = false) {
    let sublayers = [];
    layers.forEach(item => {
      if (item.parentLayer) {
        sublayers.forEach((layer, i) => {
          if (layer.id === item.parentLayer.id) {
            sublayers[i].sublayers.push({
              id: item.id,
              title: item.name,
              visible: item.defaultVisibility,
              maxScale: item.maxScale,
              minScale: item.minScale,
              legendEnabled: true,
              sublayers: []
            });
          } else {
            sublayers[i].sublayers.forEach((sublayer, a) => {
              if (sublayer.id === item.parentLayer.id) {
                sublayers[i].sublayers[a].sublayers.push({
                  id: item.id,
                  title: item.name,
                  visible: item.defaultVisibility,
                  maxScale: item.maxScale,
                  minScale: item.minScale,
                  legendEnabled: true,
                  sublayers: []
                });
              }
            });
          }
        });
      }
      else {
        sublayers.push({
          id: item.id,
          title: item.name,
          visible: item.defaultVisibility,
          maxScale: item.maxScale,
          minScale: item.minScale,
          legendEnabled: true,
          sublayers: []
        });
      }
    });
    sublayers.reverse().map(sublayer => {
      sublayer.sublayers.length === 0 ? sublayer.sublayers = null : sublayer.sublayers.reverse().map(subSublayer => {
        subSublayer.sublayers.length === 0 ? subSublayer.sublayers = null : subSublayer.sublayers.reverse().map(subSubSublayer => {
          subSubSublayer.sublayers.length === 0 ? subSubSublayer.sublayers = null : "";
          return subSubSublayer;
        });
        return subSublayer;
      });
      return sublayer;
    });

    //if sublayer add layers for all layers layerlist feature
    if (isSublayer) {
      this.subDynamicLayers = sublayers;
    }

    return sublayers;
  }

  //get sublayers array for allLayers
  getAllLayers() {
    return this.subDynamicLayers;
  }

  addQuery() {
    return new Query();
  }

  addQueryTask(url: string) {
    return new QueryTask({ url });
  }

  //get exten by x  and y values arrays
  getExtentByPoints(xArray: number[], yArray: number[]) {
    return new Extent({
      xmin: Math.min(...xArray) - 20,
      ymin: Math.min(...yArray) - 20,
      xmax: Math.max(...xArray) + 20,
      ymax: Math.max(...yArray) + 20,
      spatialReference: {
        "wkid": 3346
      }
    });
  }
}
