import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from "@angular/router";

import { MapService } from '../../map.service';
import { MapDefaultService } from './map-default.service';
import { ProjectsListService } from '../../projects-list/projects-list.service';
import { SearchService } from '../../search/search.service';
import { MapWidgetsService } from '../../map-widgets/map-widgets.service';
import { MenuService } from '../../menu/menu.service';

import { MapOptions } from '../../options';
import { ProjectsListComponent } from '../../projects-list/projects-list.component';
import { ScaleAndLogoComponent } from '../../map-widgets/scale-and-logo.component';
import { CreditsCompponent } from '../../map-widgets/credits.component';
import { ProjectsGalleryComponent } from '../../gallery/projects-gallery.component';
import { CommonWidgetsComponent } from '../../common-widgets.component';

import watchUtils = require("esri/core/watchUtils");
import on = require("dojo/on");
import Bundle = require("dojo/i18n!esri/nls/common");
import all = require("dojo/promise/all");
import StreamLayer = require("esri/layers/StreamLayer");
import GraphicsLayer = require('esri/layers/GraphicsLayer');

import { FeatureQueryService } from '../../query/feature-query.service';
import { IdentifyService } from '../../services/identify/identify.service';
import { PointAddRemoveService } from '../../query/point-add-remove.service';

import { Subscription } from 'rxjs/Subscription';

import { findKey } from 'lodash';
import { pick } from 'lodash';
import { forIn } from 'lodash';

@Component({
  selector: 'esri-map-default',
  templateUrl: './app/themes/default/map-default.component.html'
})
export class MapDefaultComponent implements OnInit {

  //execution of an Observable,
  subscription: Subscription;
  queryUrlSubscription: Subscription;

  queryParams: any;

  map: any;
  view: any;
  search: any;
  mobile: boolean;
  featureLayers: any[];

  helpContainerActive: boolean = false;
  shareContainerActive: boolean = false;

  //sharing url string
  shareUrl: string;

  //bug fix for API 4.4 version
  //add subDynamicLayers sublayers meta data
  subDynamicLayerSubLayers: any;

  constructor(private _mapService: MapService, private router: Router, private mapDefaultService: MapDefaultService, private elementRef: ElementRef, private projectsService: ProjectsListService, private searchService: SearchService, private featureService: FeatureQueryService, private identify: IdentifyService, private pointAddRemoveService: PointAddRemoveService, private activatedRoute: ActivatedRoute, private mapWidgetsService: MapWidgetsService, private menuService: MenuService) {
    this.queryUrlSubscription = activatedRoute.queryParams.subscribe(
      (queryParam: any) => {
        //navigate specific legacy map urls
        if (queryParam['theme'] === 'teritory-planning') {
          router.navigate(['/teritoriju-planavimas']);
        }

        return this.queryParams = queryParam;
      }
    );
  }

  // toggle help container
  helpOpen(e) {
    this.helpContainerActive = !this.helpContainerActive;
  }

  select(e) {
    e.target.select();
  }
  // toggle share container
  shareToggle(e) {
    //get visible and checked layers ids
    const ids: any = this.mapDefaultService.getVisibleLayersIds(this.view);
    const visibleLayersIds: number[] = ids.identificationsIds;
    const checkedLayersIds: number[] = ids.visibilityIds;
    //check if there is any visible layers that can be identied in allLayers group
    let identify = ids.identificationsIds.allLayers.length <= 1 ? "" : "allLayers";
    //console.log("ids", ids)

    //get share url
    let currentZoom: number, currentCoordinates: number[];
    currentZoom = this.view.zoom;
    currentCoordinates = [this.view.center.x, this.view.center.y];
    this.shareUrl = window.location.origin + window.location.pathname + '?zoom=' + currentZoom + '&x=' + currentCoordinates[0] + '&y=' + currentCoordinates[1] + this.shareCheckedLayersIds(checkedLayersIds) + '&basemap='
      + this.mapWidgetsService.returnActiveBasemap() + '&identify=' + identify;
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

  initView(view) {
    let urls = this.mapDefaultService.getUrls();
    let identify = this.identify.identify(urls[0]);
    let identifyParams = this.identify.identifyParams();
    let count = 0;
    view.popup.dockOptions = {
      position: 'bottom-left'
    };

    //get projects when interacting with the view
    watchUtils.whenTrue(view, "stationary", (b) => {
      // Get the new extent of the view only when view is stationary.
      if (view.extent) {
        //this.getProjects(itvFeatureUrl, view.extent, sqlStr, count);
        count += 1;
      }
    });

    view.on("pointer-move", (event) => {
      //console.log("MOUSE event", event.native)
    });

    view.on("click", (event) => {
      //check if layer is suspended
      const suspended = this._mapService.getSuspendedIdentitication();
      //store all deffered objects of identify task in def array
      let def = [];
      let ids: any = this.mapDefaultService.getVisibleLayersIds(view);
      let visibleLayersIds: number[] = ids.identificationsIds;
      view.popup.dockEnabled = false;
      view.popup.dockOptions = {
        // Disables the dock button from the popup
        buttonEnabled: true,
        // Ignore the default sizes that trigger responsive docking
        breakpoint: false,
        position: 'bottom-left'
      }
      identifyParams.geometry = event.mapPoint;
      identifyParams.mapExtent = view.extent;
      identifyParams.tolerance = 10;
      identifyParams.width = view.width;
      identifyParams.height = view.height;
      identifyParams.layerOption = 'all';

      //foreach item execute task
      view.layerViews.items.forEach(item => {
        //do not execute if layer is for buffer graphics
        if ((item.layer.id !== "bufferPolygon") && (!suspended)) {
          //asign correct  visible ids based on layer name (layerId property)
          // layerId === item.layer.id

          //if layer is buffer result, add custom visibility
          if (item.layer.id === "bufferLayers") {
            identifyParams.layerIds = [0];
          } else {
            identifyParams.layerIds = visibleLayersIds[item.layer.id];
          }

          let defferedList = this.identify.identify(item.layer.url).execute(identifyParams).then((response) => {
            //console.log("RSP", response);
            //console.log("ids",ids);
            let results = response.results.reverse();
            return results.map((result) => {
              let name = result.layerName;
              let feature = result.feature;
              feature.popupTemplate = {
                title: `${name}`,
                content: this.mapDefaultService.getVisibleLayersContent(result)
              };
              //add feature layer id
              feature["layerId"] = item.layer.id;
              return feature;
            });
          }).then(function(response) {
            //console.log('response', response)
            return response;
          }, (error) => { console.error(error); });

          def.push(defferedList);
        }
      });

      //using dojo/promise/all function that takes multiple promises and returns a new promise that is fulfilled when all promises have been resolved or one has been rejected.
      all(def).then(function(response) {
        let resultsMerge = [].concat.apply([], response.reverse()); //merger all results
        //console.log('response resultsMerge', resultsMerge)
        //remove emtpy Values
        resultsMerge = resultsMerge.filter((value) => value);
        if (resultsMerge.length > 0) {
          view.popup.open({
            features: resultsMerge,
            location: event.mapPoint
          });
        }
      });

    }, (error) => { console.error(error); });
  }

  ngOnInit() {
    //add snapshot url and pass path name ta Incetable map service
    let snapshotUrl = this.activatedRoute.snapshot.url["0"];
    let basemaps: any[] = [];
    let themeGroupLayer: any;

    this.mobile = this._mapService.mobilecheck();
    this._mapService.isMobileDevice(this.mobile);
    //console.dir(Bundle);

    // create the map
    this.map = this._mapService.initMap(MapOptions.mapOptions);
    //create view
    this.view = this._mapService.viewMap(this.map);

    this._mapService.updateView(this.view);

    //create theme main layers grouped
    themeGroupLayer = this._mapService.initGroupLayer("theme-group", "Main theme layers", "show");

    //add  basemap layer
    //TODO refactor
    this.mapWidgetsService.returnBasemaps().forEach(basemap => {
      if (this.queryParams.basemap === basemap.id) {
        this.mapWidgetsService.setActiveBasemap(basemap.id);
        basemaps.push(this._mapService.initTiledLayer(MapOptions.mapOptions.staticServices[basemap.serviceName], basemap.id));
      } else {
        basemaps.push(this._mapService.initTiledLayer(MapOptions.mapOptions.staticServices[basemap.serviceName], basemap.id, false));
      }
    });

    this.map.basemap = this._mapService.customBasemaps(basemaps);

    this._mapService.updateMap(this.map);

    if (snapshotUrl) {
      //using lodash find and pick themeLayer from options
      let themeName = findKey(MapOptions.themes, { "id": snapshotUrl.path });
      let themeLayers = pick(MapOptions.themes, themeName)[themeName]["layers"];

      forIn(themeLayers, (layer, key) => {
         const response = this._mapService.fetchRequest(layer.dynimacLayerUrls)
         this._mapService.pickMainThemeLayers(response, layer, key, this.queryParams);
      });
      //set raster layers
      const rasterLayers = this._mapService.getRasterLayers();
      this._mapService.setRasterLayers(rasterLayers);
    };

    this.view.then((view) => {
      //count sub layers and add to map if required
      const responseFeatures = this._mapService.fetchRequest(MapOptions.mapOptions.staticServices.commonMaps);
      const sublayers = this._mapService.addToMap(responseFeatures, this.queryParams);

      if (this.queryParams.allLayers && (this.queryParams.identify === "allLayers")) {
        //set sublayers state as we will load all layers layer on map
        this.menuService.setSubLayersState();
      };

      //if query paremeteters are defined get zoom and center
      this._mapService.centerZoom(view, this.queryParams);

      //add default search widget
      this.search = this.searchService.defaultSearchWidget(view);
      view.ui.add(this.search, {
        position: "top-left",
        index: 2
      });
      this.search.on("search-start", (event) => {
      });

      //init view and get projects on vie stationary property changes
      this.initView(view);
    });
  }
}
