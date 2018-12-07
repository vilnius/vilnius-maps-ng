import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { trigger, state, style, animate, transition } from '@angular/animations';

import { MapService } from '../../map.service';
import { SearchService } from '../../search/search.service';
import { BasemapsService } from '../../map-widgets/basemaps.service';
import { MetaService } from '../../services/meta.service';
import { MenuService } from '../../menu/menu.service';
import { ViewService } from '../default/view.service';
import { ShareButtonService } from '../../services/share-button.service';
import { DataStore } from './map-kindergartens.service';
import { KindergartensTooltipService } from './kindergartens-tooltip.service';
import { KindergartensLayersService } from './kindergartens-layers.service';

import { IdentifyService } from '../../services/identify/identify.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'esri-map-kindergartens',
  templateUrl: './app/themes/kindergartens/map-kindergartens.component.html',
  styles: [`
    .sidebar-common {
      position: absolute;
      position: fixed;
      height: 100%;
      z-index: 1;
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
    .kind.button.close {
      top: 140px;
      left: -50px;
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
    @media screen and (max-width: 420px) {
			.sidebar-common {
				z-index: 7;
			}
      .kind.button.close {
				z-index: 99999;
        top: 0;
        left: 0;
        padding: 13px 16px;
      }
      .kind.s-close.button.close {
        top: 140px;
        left: -50px;
      }
    }
    `],
  animations: [
    trigger('sidebarState', [
      state('s-close', style({
        transform: 'translateX(326px)'
      })),
      state('s-open', style({
        transform: 'translateX(0px)'
      })),
      transition('s-open => s-close', animate('100ms ease-in')),
      transition('s-close => s-open', animate('100ms ease-out'))
    ]),
    trigger('mapState', [
      state('s-close', style({
        width: '100%'
      })),
      state('s-open', style({
        width: 'calc(100% - 326px)'
      })),
      transition('s-open => s-close', animate('100ms ease-in')),
      transition('s-close => s-open', animate('100ms ease-out'))
    ])
  ]

})
export class MapKindergartensComponent implements OnInit, OnDestroy {
  @ViewChild('mainContainer') mainContainer: ElementRef;
  @ViewChild('kindergartensContent') kindergartensContent;
  //@HostBinding('style.display') display = 'none';

  //execution of an Observable,
  subscription: Subscription;
  queryUrlSubscription: Subscription;

  // store kindegarten data from different enpoints
  dataStore: DataStore;

  queryParams: any;

  map: any;
  view: any;
  search: any;
  mobile: boolean;
  featureLayers: any[];

  helpContainerActive: boolean = false;
  shareContainerActive: boolean = false;

  //animation for sidebar and map components
  sidebarState = 's-open';

  //sharing url string
  shareUrl: string;

  //bug fix for API 4.4 version
  //add subDynamicLayers sublayers meta data
  subDynamicLayerSubLayers: any;

  maintenanceOn = false;

  //dojo on map click event handler
  identifyEvent: any;

  //dojo events
  tooltipEvent: any;
  clickEvent: any;

  // tooltip dom
  tooltip: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private _mapService: MapService,
    private searchService: SearchService,
    private identify: IdentifyService,
    private activatedRoute: ActivatedRoute,
    private basemapsService: BasemapsService,
    private metaService: MetaService,
    private menuService: MenuService,
    private viewService: ViewService,
    private kindergartensLayersService: KindergartensLayersService,
    private kindergartensTooltipService: KindergartensTooltipService,
    private renderer2: Renderer2,
    private shareButtonService: ShareButtonService,
  ) {
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

  initIdentification(view) {
    const mainContainerDom = this.viewService.getMapElementRef();
    const rend = this.renderer2;

    const [tooltipEvent, tooltip] = this.kindergartensTooltipService.addTooltip(view, this.view, mainContainerDom, rend, this.dataStore);

    this.tooltipEvent = tooltipEvent;
    this.tooltip = tooltip;

    this.cdr.detectChanges();

    this.clickEvent = view.on("click", (event) => {
      //remove existing graphic
      this._mapService.removeFeatureSelection();

      // identify with hitTest method
      // find layer and remove it, max 4 layers: polygon, polyline, point, and additional point if scale is set from point to point in mxd
      this._mapService.removeSelectionLayers();

      //this.view.popup.close()
      //hitTest check graphics in the view
      this.hitTestFeaturePopup(view, event);
    }, (error) => { console.error(error); });
  }

  hitTestFeaturePopup(view: any, event: any) {
    // hitTest BUG
    // the hitTest() checks to see if any graphics in the view
    // intersect the given screen x, y coordinates
    var screenPoint = {
      x: event.x,
      y: event.y
    };

    view.hitTest(screenPoint)
      .then(features => {
        let fullData = null;
        const values = Array.from(features.results);
        let isShown = false;
        values.forEach((value: any) => {
          if ((values && (value.graphic.layer.id !== 'feature-area'))) {
            if (!isShown) {
              isShown = true;
              const showResult = value.graphic;
              const mainInfo = this.dataStore && this.dataStore.mainInfo;
              mainInfo.forEach(data => {
                if (data.GARDEN_ID === value.graphic.attributes.Garden_Id) {
                  fullData = Object.assign({}, data);
                }

              });
              this.openSidebar();
              this.kindergartensContent = fullData;

              //add selectionResultsToGraphic
              const groupFeatureSelectionLayer = this._mapService.initFeatureSelectionGraphicLayer('FeatureSelection', showResult.layer.maxScale, showResult.layer.minScale, 'hide');
              const { geometry, layer, attributes } = showResult;
              const selectionGraphic = this._mapService.initFeatureSelectionGraphic('point', geometry, layer, attributes, '26px', 'dash');
              groupFeatureSelectionLayer.graphics.add(selectionGraphic);
              this.map.add(groupFeatureSelectionLayer);
            }

          } else {
            if (!isShown) {
              //TEMP null / 0 trick to initiate component change, as we can add data via sidbar compontent as well
              this.kindergartensContent === null ? this.kindergartensContent = 0 : this.kindergartensContent = null;
            }

          }

          this.cdr.detectChanges();
        });
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

    //this.renderer2.addClass(document.body, 'buldings-theme');
    this.renderer2.addClass(document.body, 'kindergartens');

    //add snapshot url and pass path name ta Incetable map service
    //FIXME ActivatedRoute issues
    //let snapshotUrl = this.activatedRoute.snapshot.url["0"];
    let snapshotUrl = { path: 'darzeliai' };

    // return the map
    this.map = this._mapService.returnMap();

    // return view
    this.view = this._mapService.getView();

    //create theme main layers grouped
    // const themeGroupLayer = this._mapService.initGroupLayer("theme-group", "Main theme layers", "show");

    // set active basemaps based on url query params
    if (this.queryParams.basemap) {
      this.setActiveBasemap(this.view, this.queryParams.basemap);
    }

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
      this.identifyEvent = this.identify.identifyLayers(view);

      if (snapshotUrl) {
        this.kindergartensLayersService.addCustomLayers(this.queryParams, snapshotUrl)
          .subscribe((dataStore: DataStore) => {
            this.dataStore = dataStore;

            //init identfication logic
            this.initIdentification(view);
          });
      };

			// detect changes before dataStore fetches
			this.cdr.detectChanges();
    });
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
    this.identifyEvent.remove();
    this.tooltipEvent.remove();
    this.clickEvent.remove();

    // destroy tooltip dom
    this.tooltip.remove();

    //remove theme layers, exclude allLayers (JS API performance BUG)
    this.map.removeAll();

    // clear and destroy search widget and sear data
    this.search.clear();
    this.search.destroy();

    // cursor style auto
    this.renderer2.setProperty(document.body.style, 'cursor', 'auto');

    this.renderer2.removeClass(document.body, 'kindergartens');
  }

}
