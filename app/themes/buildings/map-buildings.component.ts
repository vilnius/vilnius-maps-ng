import { Component, OnInit, Input, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { trigger, state, style, animate, transition } from '@angular/animations';

import { MapService } from '../../map.service';
import { MapDefaultService } from '../default/map-default.service';
import { ProjectsListService } from '../../projects-list/projects-list.service';
import { SearchService } from '../../search/search.service';
import { MapWidgetsService } from '../../map-widgets/map-widgets.service';
import { MenuService } from '../../menu/menu.service';

import { MapOptions } from '../../options';
import { ProjectsListComponent } from '../../projects-list/projects-list.component';
import { ScaleAndLogoComponent } from '../../map-widgets/scale-and-logo.component';
import { CreditsCompponent } from '../../map-widgets/credits.component';
import { ProjectsGalleryComponent } from '../../gallery/projects-gallery.component';

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
  selector: 'esri-map-buildings',
  templateUrl: './app/themes/buildings/map-buildings.component.html',
  styles: [`
    .sidebar-common {
      position: absolute;
      position: fixed;
      height: 100%;
    }
    .sidebar-common p {
      padding: 6px 20px;
      line-height: 34px;
      letter-spacing: -.4px;
    }
    .button.close.build-close {
      padding: 14px 16px;
      height: 46px;
      width: 50px;
      overflow-y: hidden;
    }
    .button.close {
      position: absolute;
      top: 0;
      left: 0;
      background-color: #A80C0D;
      font-size: 20px;
      color: #fff;
      border-radius: 0;
    }
    .button.close .fa {
        padding: 0;
    }
    .buldings-tooltip {
      max-width: 120px;
      width: auto;
      position: absolute;
      background-color:  #fff;
      border-radius: 2px;
      font-size: 14px;
      -moz-border-radius: 2px;
      border-radius: 2px;
      -webkit-box-shadow: 0 1px 3px rgba(0,0,0,.25);
      -moz-box-shadow: 0 1px 3px rgba(0,0,0,.25);
      box-shadow: 0 1px 3px rgba(0,0,0,.25);
      color: #000;
      line-height: 1.4;
    }
    `],
  animations: [
    trigger('sidebarState', [
      state('s-close', style({
        transform: 'translateX(326px)'
      })),
      state('s-open',   style({
        transform: 'translateX(326px)'
      })),
      transition('s-open => s-close', animate('100ms ease-in')),
      transition('s-close => s-open', animate('100ms ease-out'))
    ]),
    trigger('mapState', [
      state('s-close', style({
        width: '100%'
      })),
      state('s-open',   style({
        width: 'calc(100% - 326px)'
      })),
      transition('s-open => s-close', animate('100ms ease-in')),
      transition('s-close => s-open', animate('100ms ease-out'))
    ])
  ]

})
export class MapBuildingsComponent implements OnInit {
  @ViewChild('mainContainer') mainContainer: ElementRef;
  @ViewChild('heatContent') heatContent;

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

  //animation for sidebar and map components
  sidebarState = 's-close';

  //sharing url string
  shareUrl: string;

  //bug fix for API 4.4 version
  //add subDynamicLayers sublayers meta data
  subDynamicLayerSubLayers: any;

  sidebarTitle: string;

  constructor(private _mapService: MapService, private mapDefaultService: MapDefaultService, private projectsService: ProjectsListService, private searchService: SearchService, private featureService: FeatureQueryService, private identify: IdentifyService, private pointAddRemoveService: PointAddRemoveService, private activatedRoute: ActivatedRoute, private mapWidgetsService: MapWidgetsService, private menuService: MenuService, private renderer2: Renderer2) {
    this.queryUrlSubscription = activatedRoute.queryParams.subscribe(
      (queryParam: any) => {
        //console.log("URL Parametrai", queryParam);
        return this.queryParams = queryParam;
      }
    );
  }

  toggleSidebar() {
    this.sidebarState = this.sidebarState === 's-close' ? 's-open' : 's-close';
  }

  openSidebar() {
    this.sidebarState = 's-open';
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
    const rend = this.renderer2;
    const tooltip = rend.createElement('div');
    const mainContainerDom = this.mainContainer;
    const urls = this.mapDefaultService.getUrls();
    const identify = this.identify.identify(urls[0]);
    const identifyParams = this.identify.identifyParams();
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

    //add tooltip on mouse move
    this.view.on("pointer-move", (event) => {
      const screenPoint = {
        //hitTest BUG, as browser fails to execute 'elementFromPoint' on 'Document'
        //FIXME bug with x coordinate value, when menu icon is in view, temp solution: change x value from 0 to any value
        x: event.x ? event.x : 600,
        y: event.y
      };
      if (tooltip.textContent.length > 0) {
        tooltip.textContent = '';
        rend.setStyle(tooltip, 'padding', '0px');
      };
      view.hitTest(screenPoint)
        .then(function(response){
          if (response.results.length > 0) {
            const top = (event.y + 100) < window.innerHeight ? event.y + 10 + 'px' : event.y - 30 + 'px';
            const left = (event.x + 100) < window.innerWidth ?  event.x + 20 + 'px' : (event.x - 110) + 'px';
            const values = response.results["0"];
            const textMsg = `${values.graphic.attributes.ADRESAS}`;
            const text = rend.createText(textMsg);
            rend.appendChild(tooltip, text);
            rend.appendChild(mainContainerDom.nativeElement, tooltip);
            rend.addClass(tooltip, 'buldings-tooltip')
            rend.setStyle(tooltip, 'top', top);
            rend.setStyle(tooltip, 'left', left);
            rend.setStyle(tooltip, 'padding', '5px');
            document.body.style.cursor = "pointer";
          } else {
            document.body.style.cursor = "auto";
          }
        });
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
        //do not execute if layer is for buffer graphics and if layer is GroupLayer with list mnode 'hide-children' or type is group which means it is dedicated for retrieving data to custom sidebar via feature layer hitTest method
        //skip FeatureSelection layer as well wich is created only for Deature selection graphics
        if ((item.layer.id !== "bufferPolygon") && (!suspended) && (item.layer.listMode !== 'hide-children') && (item.layer.type !== 'group') && (item.layer.id !== 'FeatureSelection') && (item.layer.popupEnabled)) {
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
            let results = response.results;
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

      //console.log("def", def);

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


    //remove existing graphic
    this._mapService.removeFeatureSelection();
    //else identify with hitTest method
    //find layer and remove it, max 4 layers: polygon, polyline, point, and additional point if scale is set from point to point in mxd
    this._mapService.removeSelectionLayers(this.map);
    //this.view.popup.close()
    //hitTest check graphics in the view
    this.hitTestFeaturePopup(view, event);
    //init popup on click event widh identify service
    //this.identify.showItvPopupOnCLick(view, event, identify, identifyParams);

    }, (error) => { console.error(error); });
  }

  hitTestFeaturePopup(view: any, event: any) {
    // the hitTest() checks to see if any graphics in the view
    // intersect the given screen x, y coordinates
    var screenPoint = {
      x: event.x,
      y: event.y
    };
    //console.log(screenPoint)
    view.hitTest(screenPoint)
      .then(features => {
        const values = features.results[0];
        const showResult = values.graphic;
        const currentClass = `${values.graphic.attributes.REITING} klasė`;
        const currentYear = `${values.graphic.attributes.SEZONAS}-${values.graphic.attributes.SEZONAS-1} sezonas`;
        this.openSidebar();
        this.heatContent = values.graphic.attributes;
        //add selectionResultsToGraphic
        const groupFeatureSelectionLayer = this._mapService.initFeatureSelectionGraphicLayer('FeatureSelection', showResult.layer.maxScale, showResult.layer.minScale, 'hide');
        const {geometry, layer, attributes} = showResult;
        const selectionGraphic = this._mapService.initFeatureSelectionGraphic('polygon', geometry, layer, attributes);
        groupFeatureSelectionLayer.graphics.add(selectionGraphic);
        this.map.add(groupFeatureSelectionLayer);
      });
  }

  ngOnInit() {
    document.body.classList.add('buldings-theme');
    //add snapshot url and pass path name ta Incetable map service
    let snapshotUrl = this.activatedRoute.snapshot.url["0"];
    let basemaps: any[] = [];
    let themeGroupLayer: any;

    //add sidebar names
    this.sidebarTitle = 'Šilumos suvartojimas'

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

      //all theme layers will be added to common group layer
      const mainGroupLayer = this._mapService.initGroupLayer(themeName + 'group', 'Pastatai', 'show');
      this.map.add(mainGroupLayer);

      forIn(themeLayers, (layer, key) => {
         const response = this._mapService.fetchRequest(layer.dynimacLayerUrls)
         const popupEnabled = false;
         //create group and add all grouped layers to same group, so we could manage group visibility
         const groupLayer = this._mapService.initGroupLayer(key + 'group', 'Šildymo sezono reitingas', 'hide-children');
         mainGroupLayer.add(groupLayer);
         this._mapService.pickMainThemeLayers(response, layer, key, this.queryParams, popupEnabled, groupLayer);
         //add feature layer with opacity 0
         this._mapService.pickCustomThemeLayers(response, layer, key, this.queryParams, groupLayer, 2);
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
