import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';

import { MapService } from '../../map.service';
import { ViewService } from '../../themes/default/view.service';
import { BasemapsService } from '../../map-widgets/basemaps.service';
import { ShareButtonService } from '../../services/share-button.service';
import { MapOptions } from '../../options';

import watchUtils = require("esri/core/watchUtils");
import { MapStreamService } from '../../services/streams/map-stream.service';

@Component({
  selector: 'esri-map-view',
  templateUrl: './app/components/common/map-view.component.html',
  styles: [`
		.alert {
	    padding: 6px 10px;
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
export class MapViewComponent implements OnInit, AfterViewInit {
  @ViewChild('mainContainer') mainContainer: ElementRef;
  @ViewChild('bar', {read: ElementRef}) private bar: ElementRef;

  queryParams = { basemap: null };
  maintenanceOn = false;
  shareContainerActive: boolean = false;

  //sharing url string
  shareUrl: string;

  view: any;

	isCopiedToClipboard = false;

  constructor(
    private rend: Renderer2,
    private mapService: MapService,
    private mapStreamService: MapStreamService,
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


  }

	ngAfterViewInit() {
		this.mapService.setProgressBar(this.bar);

		this.view.then((view) => {
			watchUtils.whenTrue(view, "updating", () => {
				if (this.bar && this.bar.nativeElement) {
					this.rend.setStyle(this.bar.nativeElement, 'display', 'block');

          this.addLoading(view);
        }
			});

      // Not using this approach 
      // Because we're not controlling third party services and their order
      // so if theme has stream layers not loaded last, we will not see progress laoding bar
			// this.view.on("layerview-create", (event) => {
			// 	console.log(event.layer);
			// 	if (event.layer.id !== "allLayers" && this.bar && event.layer.type !== 'stream') {
			// 		setTimeout(() => {
			// 			// this.rend.setStyle(this.bar.nativeElement, 'display', 'none');
			// 		}, 600);
      //   } else if ( event.layer.type === 'stream') {
      //     this.addLoading(view);
      //   }
        
			// });
		});
  }

  addLoading(view) {
    const intervalProgress = setInterval(() => {
      if (view) {
        if (!view.updating) {
          clearInterval(intervalProgress);
          this.rend.setStyle(this.bar.nativeElement, 'display', 'none');
        }

      }

      // do not show loading bar when connecting to websocket
      // the bar will run till connection ends
      const streamsViews = this.excludeStreamLayersUpdates(view);
      if (streamsViews.length > 0) {
        clearInterval(intervalProgress);
        // currently only one stream layer per theme
        setTimeout(() =>{ this.rend.setStyle(this.bar.nativeElement, 'display', 'block'), 2000});

        if (!streamsViews[0].layer.visible) {
          this.rend.setStyle(this.bar.nativeElement, 'display', 'none');
        }

        try {
          const dataEvent = this.mapStreamService.getStreamLayerView().on('data-received', (e)=> {
            this.rend.setStyle(this.bar.nativeElement, 'display', 'none');
            dataEvent.remove();
          });
        } catch (er) {
          this.rend.setStyle(this.bar.nativeElement, 'display', 'none');
        }

      }

    }, 50);
  }
  
  excludeStreamLayersUpdates(view)  {
    return view.layerViews.items.filter(item => item.layer.type === 'stream' && item.updating)
  }

}
