import { Component, OnInit, OnDestroy, ViewChild, Renderer2, ChangeDetectorRef
 } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { trigger, state, style, animate, transition } from '@angular/animations';

import { MapService } from '../../map.service';
import { MenuService } from '../../menu/menu.service';
import { MetaService } from '../../services/meta.service';
import { BuildingsTooltipService } from './buildings-tooltip.service';
import { BuildingsLayersService } from './buildings-layers.service';
import { SearchService } from '../../search/search.service';
import { BasemapsService } from '../../map-widgets/basemaps.service';
import { ViewService } from '../default/view.service';
import { ShareButtonService } from '../../services/share-button.service';
import { IdentifyService } from '../../services/identify/identify.service';

import { Subscription } from 'rxjs';


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
	    letter-spacing: -.4px;
	    margin: 0;
	    padding-left: 70px;
	    line-height: 34px;
	    background: #e61c24;
	    color: #fff;
	    font-size: 16px;
    }
    .button.close.build-close {
      padding: 14px 16px;
      height: 46px;
      width: 50px;
      overflow-y: hidden;
    }
    .button.close {
      position: relative;
			float: left;
			right: auto;
			left: 0;
      top: 0;
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
  ]//,
	//changeDetection: ChangeDetectionStrategy.OnPush

})
export class MapBuildingsComponent implements OnInit, OnDestroy {
  //@ViewChild('mainContainer') mainContainer: ElementRef;
  @ViewChild('heatContent') heatContent;

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

  constructor(
		private cdr: ChangeDetectorRef,
    private _mapService: MapService,
    private menuService: MenuService,
    private metaService: MetaService,
    private buildingsTooltipService: BuildingsTooltipService,
    private buildingsLayersService: BuildingsLayersService,
    private searchService: SearchService,
    private identify: IdentifyService,
    private activatedRoute: ActivatedRoute,
    private basemapsService: BasemapsService,
    private viewService: ViewService,
    private renderer2: Renderer2,
    private shareButtonService: ShareButtonService) {
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
    console.log('open sidebar', this.sidebarState)
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
		console.log('mainContainerDom', mainContainerDom);

    // add tooltip on mouse move
    // TODO remove event on destroy
    const rend = this.renderer2;
    const [tooltipEvent, tooltip] = this.buildingsTooltipService.addTooltip(view, this.view, mainContainerDom, rend);

    this.tooltipEvent = tooltipEvent;
    this.tooltip = tooltip;

		this.cdr.detectChanges();

    console.log('tooltipEvent', this.tooltipEvent, tooltip);

    this.clickEvent = view.on("click", (event) => {
      // remove existing graphic
      this._mapService.removeFeatureSelection();

      // else identify with hitTest method
      // find layer and remove it, max 4 layers: polygon, polyline, point, and additional point if scale is set from point to point in mxd
      this._mapService.removeSelectionLayers();
			console.log('%c Map CLICK', 'font-size: 22px; color: violet')

      // hitTest check graphics in the view
      this.hitTestFeaturePopup(view, event);
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
        const values = features.results[0];
				console.log('click', this.map.findLayerById('feature-silumosSuvartojimas'), features, this.heatContent)
        const showResult = values.graphic;
        this.openSidebar();
        this.heatContent = showResult.attributes;

        //add selectionResultsToGraphic
        const groupFeatureSelectionLayer = this._mapService.initFeatureSelectionGraphicLayer('FeatureSelection', showResult.layer.maxScale, showResult.layer.minScale, 'hide');
        const { geometry, layer, attributes } = showResult;
        const selectionGraphic = this._mapService.initFeatureSelectionGraphic('polygon', geometry, layer, attributes);
        groupFeatureSelectionLayer.graphics.add(selectionGraphic);
        this.map.add(groupFeatureSelectionLayer);
				console.log('%c Map CLICK 2', 'font-size: 22px; color: purple')

				// check this view and its children
				//this.cdr.reattach();
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

    this.renderer2.addClass(document.body, 'buldings-theme');

    //add snapshot url and pass path name ta Incetable map service
    //FIXME ActivatedRoute issues
    //let snapshotUrl = this.activatedRoute.snapshot.url["0"];
    let snapshotUrl = { path: 'pastatai' };

    //add sidebar names
    this.sidebarTitle = 'Šilumos suvartojimas';

    // return the map
    this.map = this._mapService.returnMap();

    // return view
    this.view = this._mapService.getView();
		console.log('%c VIEW getView', 'color: green;font-size: 23px', this.view)

    //create theme main layers grouped
    // FIXME seem to bee obsolete
    //this._mapService.initGroupLayer("theme-group", "Main theme layers", "show");

    // set active basemaps based on url query params
    if (this.queryParams.basemap) {
      this.setActiveBasemap(this.view, this.queryParams.basemap);
    }

    if (snapshotUrl) {
      this.buildingsLayersService.addCustomLayers(this.queryParams, snapshotUrl);
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
      this.identifyEvent = this.identify.identifyLayers(view);

      //init view and get projects on vie stationary property changes
      this.initView(view);
    });
  }

	ngDoCheck() {
		console.log('Do Check');
		//this.cdr.detectChanges();
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

		this.renderer2.removeClass(document.body, 'buldings-theme');
  }

}
