import { Component, OnInit, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { MapService } from '../../map.service';
import { MenuService }  from '../../menu/menu.service';
import { MetaService } from '../../services/meta.service';
import { SearchService } from '../../search/search.service';
import { BasemapsService } from '../../map-widgets/basemaps.service';
import { ViewService } from './view.service';
import { ShareButtonService } from '../../services/share-button.service';

import { IdentifyService } from '../../services/identify/identify.service';

import { Subscription } from 'rxjs';
import { MapStreamService } from '../../services/streams/map-stream.service';

@Component({
  selector: 'esri-map-default',
  templateUrl: './app/themes/default/map-default.component.html'
})
export class MapDefaultComponent implements OnInit, OnDestroy {
  //execution of an Observable,
  queryUrlSubscription: Subscription;

  //dojo on map click event handler
  identifyEvent: any;

  queryParams: any;
  maintenanceOn = false;

  map: any;
  view: any;
  search: any;
  featureLayers: any[];

  helpContainerActive: boolean = false;
  shareContainerActive: boolean = false;

  //sharing url string
  shareUrl: string;

  //bug fix for API 4.4 version
  //add subDynamicLayers sublayers meta data
  subDynamicLayerSubLayers: any;

	mobileActive = true;

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
    private mapStreamService: MapStreamService,
    private shareButtonService: ShareButtonService) { }

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

  ngOnInit() {
    // add basic meta data
    this.metaService.setMetaData();

    this.queryUrlSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParam: any) => {
        this.queryParams = queryParam;
      }
    );
    this.queryUrlSubscription.unsubscribe();
    // add snapshot url and pass path name ta Incetable map service
    // FIXME ActivatedRoute issues
    // const snapshotUrl = this.router.url.slice(1);
    const snapshotUrl = window.location.pathname.slice(1);

    // return the map
    this.map = this._mapService.returnMap();

    // return view
    this.view = this._mapService.getView();

    // set active basemaps based on url query params
		if (this.queryParams.basemap) {
		  this.setActiveBasemap(this.view, this.queryParams.basemap);
		}

    // create theme layersStatus
    if (snapshotUrl) {
      this.viewService.createThemeLayers(snapshotUrl, this.queryParams);
    };
    this.view.then((view) => {
      // console.log('%c VIEW', 'color: red; font-size: 20px', view);

      this.viewService.createSubLayers(this.queryParams, this.map);

      //if query paremeteters are defined get zoom and center
      this._mapService.centerZoom(view, this.queryParams, snapshotUrl);

      //add default search widget
      this.search = this.searchService.defaultSearchWidget(view);
      view.ui.add(this.search, {
        position: 'top-left',
        index: 2
      });

            // run change detection
            this.cdr.detectChanges();

      //init identification of default or sub layers on MapView
      this.identifyEvent = this.identify.identifyLayers(view);
    }, err => { console.error('VP error: view loading issues ', err) });
  }

  ngOnDestroy() {
		//clearInterval(window.timer);

		// remove sublayers layers cache and close sidebar if iniatialised
		// TODO change to router chage subscriptiopn on map-view
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

		// remove theme layers, exclude allLayers (JS API performance BUG)
		this.map.removeAll();

		// clear and destroy search widget and sear data
		this.search.clear();
    this.search.destroy();
    
    // destroy streams (only if exists)
    this.mapStreamService.destroy();

  }
}
