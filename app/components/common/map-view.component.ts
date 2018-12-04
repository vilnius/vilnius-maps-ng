import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import { MapService } from '../../map.service';
import { ViewService } from '../../themes/default/view.service';
import { BasemapsService } from '../../map-widgets/basemaps.service';
import { ShareButtonService } from '../../services/share-button.service';
import { MapOptions } from '../../options';

import watchUtils = require("esri/core/watchUtils");

@Component({
  selector: 'esri-map-view',
  templateUrl: './app/components/common/map-view.component.html',
  styles: [`
		.alert {
	    padding: 5px 10px;
	    margin-top: 10px;
			font-size: 14px;
	}
	.share-btn {
		margin-top: 10px;
    padding: 6px 10px 6px 10px;
    background-color: #ffffff;
    border: 1px solid #53565d;
    border-radius: 2px;
    font-size: 14px;
    color: #4c4c4c;
    float: right;
	}
`]
})
export class MapViewComponent implements OnInit {
  @ViewChild('mainContainer') mainContainer: ElementRef;
  @ViewChild('bar') bar: ElementRef;

  queryParams = { basemap: null };
  maintenanceOn = false;
  shareContainerActive: boolean = false;

  //sharing url string
  shareUrl: string;

  view: any;

	isCopiedToClipboard = false;

  constructor(
    private el: ElementRef,
    private mapService: MapService,
    private viewService: ViewService,
    private basemapsService: BasemapsService,
    private shareButtonService: ShareButtonService) { }

  select(inputSelect) {
    inputSelect.select();
  }

  // toggle share container
  shareToggle() {
		this.isCopiedToClipboard = false;
    this.shareContainerActive = !this.shareContainerActive;
    this.shareUrl = this.shareButtonService.shareToggle(this.shareContainerActive);
  }

  initBasemaps(map) {
    // initiate basemaps
    const basemaps = this.basemapsService.initBasemaps(map);

    // check for errors and add maintenance mode if neccessary
    basemaps.forEach((basemap) => {
      basemap
        .then(
          () => { },
          () => { this.maintenanceOn = true; }
        );
    });
  }

	copy() {
		this.isCopiedToClipboard = false;
		this.isCopiedToClipboard = this.shareButtonService.copyToClipBoard();
	}

  ngOnInit() {
    // create the map
    const map = this.mapService.initMap(MapOptions.mapOptions);

    // create view
    this.view = this.mapService.viewMap(map);

    // initiate basemaps
    this.initBasemaps(map);

    //set map ref
    this.viewService.setmapElementRef(this.mainContainer);

    this.mapService.setProgressBar(this.bar);

    this.view.then((view) => {
      watchUtils.whenTrue(view, "updating", () => {
        //console.log('%c VIEW', ' color: green;font-size: 23px', this.view)
        //console.log("watchUtils", arguments)
        this.el.nativeElement.querySelector('#progress-load').style.display = "block";
        const intervalProgress = setInterval(() => {
          if (!this.view.updating) {
            //console.log('%c intervalProgress', "font-size: 22px", intervalProgress);
            clearInterval(intervalProgress);
            this.el.nativeElement.querySelector('#progress-load').style.display = "none";
            //console.log('%c intervalProgress end', "font-size: 22px", intervalProgress);
          }
        }, 50)
      });


      this.view.on("layerview-create", (event) => {
        //console.log(event.layer.loadStatus)
        if (event.layer.id !== "allLayers") {
          setTimeout(() => {
            this.el.nativeElement.querySelector('#progress-load').style.display = "none";
          }, 600);
          //console.log('%c PROGRESS', "color: red; font-size: 22px", this.el.nativeElement.querySelector('#progress-load'), event.layer.id, this.bar)
        }
      });
    });
  }

}
