import { Component, OnInit, OnDestroy, Renderer2, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { MapService } from '../../map.service';
import { MenuService } from '../../menu/menu.service';
import { MetaService } from '../../services/meta.service';
import { SearchService } from '../../search/search.service';
import { BasemapsService } from '../../map-widgets/basemaps.service';
import { ViewService } from '../default/view.service';
import { ShareButtonService } from '../../services/share-button.service';
import { IdentifyService } from '../../services/identify/identify.service';
import { WaistLayersService } from './waist-layers.service';

import { Subscription } from 'rxjs';


@Component({
  selector: 'esri-map-waist',
  template: `
  <div class="total-stats">
    <ul class="flex-container">
      <li class="flex-item"><p class="waist-stat__alert"><span class="waist-stat__name">Vakar išvežta konteinerių</span>
      <span class="stat" [countUp]="totalStatistics.totalLifts">0</span> iš <span class="stat" [countUp]="5959">0</span> 
      </p></li>
      <li class="flex-item"><p><span class="waist-stat__name">Bendras kiekis atliekų</span> 
      <span class="stat" [countUp]="totalStatistics.weight" [options]="{decimalPlaces: 2}">0</span> kg 
      </p>
      </li>
    </ul>
  </div> 
  <waist-statistic *ngIf="selectedFeatureAttributes" [content]="selectedFeatureAttributes"></waist-statistic>`,
  styles: [`
    .total-stats {
      position: fixed;
      bottom: 10px;
      margin: 0 auto;
      right: 0;
      left: 0;
      max-width: 400px;
      background: rgba(83, 86, 92, 0.8);
      color: #fff;
      z-index: 7;
    }

    .flex-container {
      padding: 0;
      margin: 0;
      list-style: none;
      display: -webkit-box;
      display: -moz-box;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      justify-content: space-around;
      flex-flow: row wrap;
      -webkit-flex-flow: row wrap;
    }
    
    .flex-item {
      padding: 5px;
      width: 48%;
      height: auto;
      font-weight: bold;
    }

    p .stat {
      font-size: 20px;
      display: inline-block;
      font-weight: 700;
    }

    p span {
      display: block;
      font-size: 14px;
      font-weight: 400;
    }
    `]
})
export class MapWaistComponent implements OnInit, OnDestroy {
  //execution of an Observable,
  subscription: Subscription;
  queryUrlSubscription: Subscription;

  //dojo on map click event handler
  identifyEvent: any;

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

  maintenanceOn = false;

  //dojo events
  tooltipEvent: any;
  clickEvent: any;

  // tooltip dom
  tooltip: any;

  selectedFeatureAttributes: any;

  totalStatistics = { weight: 0, totalLifts: 0  }


  constructor(
    private cdr: ChangeDetectorRef,
    private _mapService: MapService,
    private menuService: MenuService,
    private metaService: MetaService,
    private searchService: SearchService,
    private identify: IdentifyService,
    private activatedRoute: ActivatedRoute,
    private basemapsService: BasemapsService,
    private viewService: ViewService,
    private renderer2: Renderer2,
    private shareButtonService: ShareButtonService,
    private waistLayersService: WaistLayersService) {
    // Detach this view from the change-detection tree
    this.cdr.detach();
  }

  toggleSidebar() {
    this.sidebarState = this.sidebarState === 's-close' ? 's-open' : 's-close';

    // detect changes when closing sidebar group
    this.cdr.detectChanges();
  }

  openSidebar() {
    this.sidebarState = 's-open';
  }

  select(e) {
    e.target.select();
  }

  // toggle share container
  shareToggle(e) {
    this.shareContainerActive = !this.shareContainerActive;
    this.shareUrl = this.shareButtonService.shareToggle(e, this.shareContainerActive);
  }

  setActiveBasemap(view, basemap: string) {
    //toggle basemap
    this.basemapsService.toggleBasemap(basemap, view);
  }

  initView(view) {
    const mainContainerDom = this.viewService.getMapElementRef();

    this.cdr.detectChanges();

    this.clickEvent = view.on("click", (event) => {
      this.selectedFeatureAttributes = 0;
      this.cdr.detectChanges();
      // remove existing graphic
      this._mapService.removeFeatureSelection();

      // else identify with hitTest method
      // find layer and remove it, max 4 layers: polygon, polyline, point, and additional point if scale is set from point to point in mxd
      this._mapService.removeSelectionLayers();

      setTimeout(()=>{
        // hitTest check graphics in the view
        this.hitTestFeaturePopup(view, event);

      },200)

    }, (error) => { console.error(error); });
  }

  hitTestFeaturePopup(view: any, event: any) {
    // the hitTest() checks to see if any graphics in the view
    // intersect the given screen x, y coordinates
    var screenPoint = {
      x: event.x,
      y: event.y
    };

    view.hitTest(screenPoint)
      .then(features => {
        // console.log('%c Click features', 'font-size: 16px; color: green;', features.results[0].graphic.attributes);

        const values = features.results[0];
        const showResult = values.graphic;
        this.selectedFeatureAttributes = values;

        // this.openSidebar();
        // //this.heatContent = showResult.attributes;

        //add selectionResultsToGraphic
        const groupFeatureSelectionLayer = this._mapService.initFeatureSelectionGraphicLayer('FeatureSelection', showResult.layer.maxScale, showResult.layer.minScale, 'hide');
        const { geometry, layer, attributes } = showResult;
        const selectionGraphic = this._mapService.initFeatureSelectionGraphic('point', geometry, layer, attributes, '24px');
        groupFeatureSelectionLayer.graphics.add(selectionGraphic);
        this.map.add(groupFeatureSelectionLayer);

        // check this view and its children
        this.cdr.detectChanges();
      });
  }

  ngOnInit() {
    // add basic meta data
    this.metaService.setMetaData();

    this.queryUrlSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParam: any) => {
        return this.queryParams = queryParam;
      }
    );
    this.queryUrlSubscription.unsubscribe();

    this.renderer2.addClass(document.body, 'waist-theme');

    //add snapshot url and pass path name ta Incetable map service
    //FIXME ActivatedRoute issues
    //let snapshotUrl = this.activatedRoute.snapshot.url["0"];
    let snapshotUrl = { path: 'atlieku-tvarkymas' };

    //add sidebar names
    this.sidebarTitle = 'Atliekų tema';

    // return the map
    this.map = this._mapService.returnMap();

    // return view
    this.view = this._mapService.getView();

    // set active basemaps based on url query params
    if (this.queryParams.basemap) {
      this.setActiveBasemap(this.view, this.queryParams.basemap);
    }

    if (snapshotUrl) {
      this.waistLayersService.addCustomLayers(this.queryParams, snapshotUrl);
    };
  

    this.view.then((view) => {
      this.viewService.createSubLayers(this.queryParams, this.map);

      //if query paremeteters are defined get zoom and center
      this._mapService.centerZoom(view, this.queryParams);

      //add default search widget
      this.search = this.searchService.defaultSearchWidget(view);
      view.ui.add(this.search, {
        position: "top-left",
        index: 2
      });

      //init identification of default or sub layers on MapView
			//this.identifyEvent = this.identify.identifyLayers(view, 'visible', 'waist');
      //init view and get projects on vie stationary property changes
      this.initView(view);

      this.createQuery('https://atviras.vplanas.lt/arcgis/rest/services/Testavimai/Konteineriu_pakelimai/MapServer/4')
    });
  }

  // TODO add to service
  async createQuery(url) {
    const query = this._mapService.addQuery();
    const queryTask = this._mapService.addQueryTask(url);
    query.returnGeometry = false;
    query.where = '1=1'
    query.outFields = ['Svoris_kg', 'Pakelimo_data_laikas' ];
    const results = await queryTask.execute(query).then((result) => {
      return result;
    }, (error) => {
      console.error(error);
    });

    this.getStats(results);

  }

  getStats(result): void {
    result.features.forEach(feature => {
      if (feature.attributes.Svoris_kg) {
        const weight = +feature.attributes.Svoris_kg;
        this.totalStatistics.weight += weight;
      
      }

      if (feature.attributes.Pakelimo_data_laikas) {
        //  TODO filter only current day
        this.totalStatistics.totalLifts += 1;
        
      }

    });
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    const subLayersSate = this.menuService.getSubLayersState();
    if (subLayersSate) {
      this.menuService.removeSublayersLayer();
    }

    // close popup
    if (this.view.popup.visible) {
      this.view.popup.close();
    }

		// dojo on remove event handler
		this.identify.removeEvent();
    this.clickEvent.remove();

    //remove theme layers, exclude allLayers (JS API performance BUG)
    this.map.removeAll();

    // clear and destroy search widget and sear data
    this.search.clear();
    this.search.destroy();

    // cursor style auto
    this.renderer2.setProperty(document.body.style, 'cursor', 'auto');

    this.renderer2.removeClass(document.body, 'waist-theme');
  }

}
