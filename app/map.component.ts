import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { MapService } from './map.service';
import { MapDefaultService } from './themes/default/map-default.service';
import { ProjectsListService } from './projects-list/projects-list.service';
import { SearchService } from './search/search.service';
import { MapWidgetsService } from './map-widgets/map-widgets.service';
import { MapOptions } from './options';
import { ProjectsListComponent } from './projects-list/projects-list.component';
import { ScaleAndLogoComponent } from './map-widgets/scale-and-logo.component';
import { CreditsCompponent } from './map-widgets/credits.component';
import { ProjectsGalleryComponent } from './gallery/projects-gallery.component';

import watchUtils = require("esri/core/watchUtils");
import on = require("dojo/on");
import Bundle = require("dojo/i18n!esri/nls/common");
import all = require("dojo/promise/all");

import { FeatureQueryService } from './query/feature-query.service';
import { IdentifyService } from './services/identify/identify.service';
import { PointAddRemoveService } from './query/point-add-remove.service';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'esri-map',
  templateUrl: './app/map.component.html'
})
export class MapComponent implements OnInit, OnDestroy {
  //get child component reference
  @ViewChild(ProjectsListComponent) projectsListComponent: ProjectsListComponent;

  private itvFeatureUrl: string = MapOptions.themes.itvTheme.layers.uniqueProjects + "/0";

  //execution of an Observable,
  subscription: Subscription;
  queryUrlSubscription: Subscription;

  queryParams: any;
  sqlString: string = "";

  projectsListArr: any[];
  projectsListArrToComponent: any[];
  //fullList: Array<any>;
  fullListChanged: Array<any>;
  autocompleteValue: string = "";
  map: any;
  view: any;
  search: any;
  mobile: boolean;
  featureLayers: any[];

  helpContainerActive: boolean = false;
  shareContainerActive: boolean = false;

  //sharing url string
  shareUrl: string;

  //main projects layer
  projectsDynamicLayer: any;

  constructor(private _mapService: MapService, private mapDefaultService: MapDefaultService, private elementRef: ElementRef, private projectsService: ProjectsListService, private searchService: SearchService, private featureService: FeatureQueryService, private identify: IdentifyService, private pointAddRemoveService: PointAddRemoveService, private activatedRoute: ActivatedRoute, private mapWidgetsService: MapWidgetsService) {
    this.queryUrlSubscription = activatedRoute.queryParams.subscribe(
      (queryParam: any) => {
        //console.log("URL Parametrai", queryParam);
        return this.queryParams = queryParam
      }
    );
  }

  getSqlString() {
    return this.sqlString;
  }

  // toggle help container
  helpOpen(e) {
    this.helpContainerActive = !this.helpContainerActive;
  }

  select(e) {
    e.target.select()
  }
  // toggle share container
  shareToggle(e) {
    //get visible and checked layers ids
    let ids: any = this._mapService.getVisibleLayersIds(this.view);
    let visibleLayersIds: number[] = ids.identificationsIds;
    let checkedLayersIds: number[] = ids.visibilityIds;

    //get share url
    let currentZoom: number, currentCoordinates: number[];
    currentZoom = this.view.zoom;
    currentCoordinates = [this.view.center.x, this.view.center.y];
    this.shareUrl = window.location.origin + window.location.pathname + '?zoom=' + currentZoom + '&x=' + currentCoordinates[0] + '&y=' + currentCoordinates[1] + this.shareCheckedLayersIds(checkedLayersIds) + '&basemap='
      + this.mapWidgetsService.returnActiveBasemap();
    //console.log(this.shareUrl)
    //console.log(window.location)

    //toggle active state
    this.shareContainerActive = !this.shareContainerActive;

    //highlight selected input
    if (this.shareContainerActive) {
      setTimeout(() => {
        if (document.getElementById("url-link")) {
          document.getElementById("url-link").select();
        }
      }, 20);
    }
  }

  shareCheckedLayersIds(ids: any): string {
    let shareCheckStr: string = "";
    Object.keys(ids).forEach(function(key) {
      let widget = ids[key];
      shareCheckStr += "&" + key + "=";
      ids[key].forEach(id => shareCheckStr += id + "!");
    });
    return shareCheckStr;
  }

  onFilter(items) {
    //first item  of items array (items[0]) is filteredList, second input value
    this.autocompleteValue = this.projectsService.filterAutoComplete(items[1]);
    //console.log(this.fullListChanged);
    //console.log(this.autocompleteValue);

    //getprojects when writing in autocomplet box as well
    this.getProjects(this.itvFeatureUrl, this.view.extent, this.sqlString);
  }

  getFullListChanged() {
    return this.fullListChanged;
  }

  getProjects(itvFeatureUrl, extent, sqlStr, count = -1) {
    //execute queryTask on projects with extent
    this.projectsService.runProjectsQueryExtent(itvFeatureUrl, extent, sqlStr).then(() => {
      this.projectsListArr = this.projectsService.getProjects();
      this.projectsListArrToComponent = this.projectsService.getProjects();
    });
    //execute queryTask on projects without extent
    let inputValue = this.autocompleteValue;
    this.projectsService.runProjectsQuery(itvFeatureUrl, sqlStr, inputValue).then(() => {
      this.fullListChanged = this.projectsService.getAllProjects();
    });
    //add to Subject
    if (count === 0) {
      this._mapService.getLisProjects(this.projectsListArr);
    }
  }

  getFilteredprojects(view, sqlStr) {
    let itvFeatureUrl = this.itvFeatureUrl;
    this.getProjects(itvFeatureUrl, view.extent, sqlStr);
  }

  initView(view) {

    let itvFeatureUrl = this.itvFeatureUrl;
    let identify = this.identify.identify(MapOptions.themes.itvTheme.layers.identifyLayer);
    let identifyParams = this.identify.identifyParams();
    let count = 0;

    //get projects when interacting with the view
    watchUtils.whenTrue(view, "stationary", (b) => {
      let sqlStr = this.getSqlString();
      // Get the new extent of the view only when view is stationary.
      if (view.extent) {
        //console.log(view.extent);
        this.getProjects(itvFeatureUrl, view.extent, sqlStr, count);
        count += 1;
      }
    });

    //console.log("VIEW", view.on)
    view.on("pointer-move", (event) => {
      //console.log("MOUSE event", event.native)
    });

    view.on("click", (event) => {
      //remove selection graphics layer if exist
      this.pointAddRemoveService.removeSelectionLayers();
      //deactivate list selection
      this.projectsListComponent.activateList();

      //if mobile identify with query
      if (this.mobile) {
        //this.pointAddRemoveService.identifyItem(this.map, view, this.featureLayers, event);
      } else {
        //else identify with hitTest method
        //find layer and remove it, max 4 layers: polygon, polyline, point, and additional point if scale is set from point to point in mxd
        this._mapService.removeSelectionLayers(this.map);
      }

      //NEW map-default.compontent approach
      //store all deffered objects of identify task in def array
      let def: Array<any> = [];
      let ids: any = this.mapDefaultService.getVisibleLayersIds(view);
      let visibleLayersIds: number[] = ids.identificationsIds;
      // view.popup.dockEnabled = false;
      // view.popup.dockOptions = {
      //   // Disables the dock button from the popup
      //   buttonEnabled: true,
      //   // Ignore the default sizes that trigger responsive docking
      //   breakpoint: false,
      //   position: 'bottom-left'
      // }
      identifyParams.geometry = event.mapPoint;
      identifyParams.mapExtent = view.extent;
      identifyParams.tolerance = 10;
      identifyParams.width = view.width;
      identifyParams.height = view.height;
      //identifyParams.layerOption = 'all';
      identifyParams.layerOption = 'visible';
      identifyParams.returnGeometry = true;

      //console.log('projects layer', this.projectsDynamicLayer)
      //asgin correct  visible ids based on layer name (layerId property)
      // layerId === item.layer.id
      //NEW TODO: if layer check box is unchecked  - do not identify layer
      let defferedList = this.featureService.identifyProjects(this.projectsDynamicLayer, identifyParams, this.map, this.view)
        .then((response) => {
          //console.log('response', response);
          let currentFilterName: String = this.projectsService.getFilterListName();
          this.projectsListComponent.activateListByID(response["0"].attributes.UNIKALUS_NR, currentFilterName);
          //console.log('response 2', response);
          return response;
        }, (error) => { console.error(error); });

      def.push(defferedList);

      //using dojo/promise/all function that takes multiple promises and returns a new promise that is fulfilled when all promises have been resolved or one has been rejected.
      all(def).then(function(response) {
        //console.log('response def', response)
        let resultsMerge = [].concat.apply([], response.reverse()); //merge all results
        //console.log('response resultsMerge', resultsMerge)
        //filter empty response which was received after map method
        resultsMerge = resultsMerge.filter(res => res);
        //console.log('response resultsMerge 2', resultsMerge)
        if (resultsMerge.length > 0) {
          view.popup.open({
            features: resultsMerge,
            location: event.mapPoint
          });
        }
      });

    }, (error) => { console.error(error); });
  }

  addFeaturesToMap() {
    //count feature layers and add to map
    this._mapService.countRestlayers(MapOptions.themes.itvTheme.layers.mapLayer + "?f=pjson").subscribe(json => {
      //console.log("json", json)
      let layersCount = json.layers.length;
      //creat layers arr
      let featureLayerArr = this._mapService.createFeatureLayers(layersCount, MapOptions.themes.itvTheme.layers.mapLayer);
      this.featureLayers = featureLayerArr;
      //add layers
      //this.map.addMany(featureLayerArr);
    });
  }

  ngOnInit() {
    //console.log("LOADING");
    let basemaps: any[] = [];
    this.mobile = this._mapService.mobilecheck();
    this._mapService.isMobileDevice(this.mobile);
    //console.dir(Bundle);
    //get full list on init
    this.projectsService.getAllProjectsQueryData(this.itvFeatureUrl);

    // create the map
    this.map = this._mapService.initMap(MapOptions.mapOptions);
    //create view
    this.view = this._mapService.viewMap(this.map);

    //add  basemap layer
    this.mapWidgetsService.returnBasemaps().forEach(basemap => {
      //if (this.queryParams.basemap) {
      //console.log(basemap.id)
      if (this.queryParams.basemap === basemap.id) {
        this.mapWidgetsService.setActiveBasemap(basemap.id);
        basemaps.push(this._mapService.initTiledLayer(MapOptions.mapOptions.staticServices[basemap.serviceName], basemap.id))
      } else {
        basemaps.push(this._mapService.initTiledLayer(MapOptions.mapOptions.staticServices[basemap.serviceName], basemap.id, false));
      }
    });

    this.map.basemap = this._mapService.customBasemaps(basemaps);

    this._mapService.updateMap(this.map);

    //add all projects mapImageLayer
    this.projectsDynamicLayer = this._mapService.initDynamicLayerITV(MapOptions.themes.itvTheme.layers.mapLayer, "itv-projects", "Investiciniai projektai", 1);
    this.map.add(this.projectsDynamicLayer);

    //set dynamic layer
    this._mapService.setProjectsDynamicLayer(this.projectsDynamicLayer);

    //add additional 2 layers as base
    this.map.add(this._mapService.initDynamicLayerITV(MapOptions.themes.itvTheme.layers.teritories, "itv-additional", "Teritorijų ribos", 0.2));

    //count feature layers, init and add feature layers to map
    this.addFeaturesToMap();

    //add allLayers sublist layers
    // let subDynamicLayers = this._mapService.initDynamicLayerITV("https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Bendras/MapServer", "allLayers", "Visų temų sluoksniai", 0.8);
    // this.map.add(subDynamicLayers);

    this.view.then((view) => {
      //if query paremeteters defined zoom and center
      this._mapService.centerZoom(view, this.queryParams);
      //do not initVIew on every new subscribe event
      //subscribe expression str change, when user is filtering projects-theme
      this.subscription = this.featureService.expressionItem.subscribe(sqlStr => {
        //console.log("SUBSCRIPTION: ", sqlStr);
        this.sqlString = sqlStr;
        //get properties on filtering event passing a sql string
        this.getFilteredprojects(view, sqlStr);
      });

      //add default search widget
      this.search = this.searchService.defaultSearchWidget(view);
      view.ui.add(this.search, {
        position: "top-left",
        index: 2
      });
      this.search.on("search-start", (event) => {
        //console.log("SEARCH event", this.search);
        //console.log("SEARCH event", event);
        this.projectsListComponent.selectFilterByExtention();
        //setTimeout(()=>{this.view.zoom = 6},500);
      });
      //check other url params if exists
      //activate layer defined in url query params
      this._mapService.activateLayersVisibility(view, this.queryParams, this.map);

      //init view and get projects on vie stationary property changes
      this.initView(view);
    });

    this.activatedRoute.url.subscribe((url) => {
      url["0"] ? this._mapService.getThemeName(url["0"].path) : "";
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.queryUrlSubscription.unsubscribe();
  }
}
