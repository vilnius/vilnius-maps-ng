import { Component, Inject, InjectionToken, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ViewChild, ElementRef, Renderer2, NgZone } from '@angular/core';

import { MapService } from '../../../map.service';

import watchUtils = require("esri/core/watchUtils");

import { timer, of } from 'rxjs';
import { filter, switchMap, first } from 'rxjs/operators';

export const SWIPE_LAYER_URL = new InjectionToken<string>('swipeLayerUrl');

@Component({
  selector: 'swipe-container',
  template: `
		<div class="swipe-vertical-line"
		 (panmove)="onPanMove($event)"
		 #swipeLine
		>
			<span class="swipe-icon esri-icon-handle-vertical" aria-label="handle-vertical icon"></span>
		</div>

		<div class="swipe-msg" #swipeMsg>
			Priartinkite mastelį
		</div>
	`,
  styleUrls: ['app/menu/tools/swipe/swipe-container.component.css'],
  providers: [
    { provide: SWIPE_LAYER_URL, useValue: 'https://gis.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/itv_rasters_cached/MapServer' }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SwipeContainerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('swipeLine') swipeLine: ElementRef;
  @ViewChild('swipeMsg') swipeMsg: ElementRef;
  private esriRoot: Element;
  private sidebarWidth = 326;
  // map element
  private mapElement: Element;
  img: string;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  view;
  watchU;
  minScale = 2000;

  constructor(
    @Inject(SWIPE_LAYER_URL) public swipeLayerUrl: string,
    private ngZone: NgZone,
    private ms: MapService,
    private rend: Renderer2
  ) { }

  ngAfterViewInit() {
		this.ngZone.runOutsideAngular(() => {
			this.mapElement = document.getElementById('map');
			this.initDomManipulation();
		});
  }

  initDomManipulation(): void {
    this.esriRoot = document.getElementsByClassName('esri-view-root')[0];

    this.rend.appendChild(this.esriRoot, this.swipeLine.nativeElement);

    // append swipe msg el
    const esriSurface = document.getElementsByClassName('esri-view-surface')[0];
    this.rend.appendChild(esriSurface, this.swipeMsg.nativeElement);

    const url = this.swipeLayerUrl;
    const view = this.ms.getView();
    const map = this.ms.returnMap();

    // create dynamic layer and add to map
    const projectsMIL = this.ms.initTiledLayer(url, 'projects-mil');
    projectsMIL.opacity = 0;

    this.view = view;

    // currently using 8 layers scale, LEVEL 5 = 5000
    // check basemap's REST endpoint reference
    projectsMIL.minScale = this.minScale;

    // allways add to last index and ad id to canvas
    // though layer usually shoul be added at last index
    // (idetify canvas position with specified index)
    view.then(() => {
      const index = map.allLayers.items.length;
      map.add(projectsMIL, index + 1);

      projectsMIL.on('layerview-create', () => {
        // check if our specific canvas has been loaded with rxjs
        timer(200, 400).pipe(
          switchMap(() => of(document.getElementsByClassName('esri-display-object').length - 1)),
          filter(objIndex => index <= objIndex),
          first()
        )
          .subscribe((lastIndex) => {
            // move layer to last index
            map.reorder(projectsMIL, map.allLayers.items.length);

            const canvas = document.getElementsByClassName('esri-display-object')[lastIndex - 1] as any;
            canvas.id = 'projects-mil';
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');

            const rect = this.swipeLine.nativeElement.getBoundingClientRect();

            // set initial clip
            this.setClip(rect.x);

            // init rectangle drawing
            this.drawRect();

            projectsMIL.opacity = 1;

          });
      });
    })

    this.watchU = watchUtils.whenTrue(view, "stationary", () => {
      if (view.extent) {
        // init rectangle drawing
        this.drawRect()
      }

    });
  }

  onPanMove(event): void {
    if (this.swipeLine.nativeElement) {
      // move vertical swipeLine
      if (event.center.x > 0 && event.center.x < this.mapElement.clientWidth) {
        this.rend.setStyle(this.swipeLine.nativeElement, 'left', event.center.x + 'px');
      }

      // if moving left out of the view
      if (event.center.x <= 0 && event.direction === 2) {
        this.rend.setStyle(this.swipeLine.nativeElement, 'left', '0px');
      }

      // if moving right out of the view
      if (event.center.x > this.mapElement.clientWidth && event.direction === 4) {
        this.rend.setStyle(this.swipeLine.nativeElement, 'left', document.getElementById('map').clientWidth - 4 + 'px');
      }

      // clip specific canvas elements
      this.setClip(event.center.x);
      this.drawRect();
    }
  }

  drawRect() {
    // TODO check support
    if (this.view.scale > this.minScale && this.canvas) {
      const rect = this.swipeLine.nativeElement.getBoundingClientRect();

      this.rend.setStyle(this.swipeMsg.nativeElement, 'width', (this.mapElement.clientWidth - rect.left) + 'px')
      this.rend.setStyle(this.swipeMsg.nativeElement, 'display', 'flex')
    } else {
      this.rend.setStyle(this.swipeMsg.nativeElement, 'width', '0px');
      this.rend.setStyle(this.swipeMsg.nativeElement, 'display', 'none');
    }
  }

  // clip specific canvas elements
  setClip(x) {
    // clip specific canvas elements
    const rect = this.swipeLine.nativeElement.getBoundingClientRect();
    this.rend.setStyle(this.canvas, 'clip-path', `inset(${0}px ${0}px ${0}px ${x}px)`);
    this.rend.setStyle(document.getElementById('projects-mil'), 'clip', `rect(${0}px, ${window.innerWidth-this.sidebarWidth}px, ${rect.height}px, ${rect.left}px)`);
  }

  ngOnDestroy(): void {
    this.rend.removeChild(document.getElementsByClassName('esri-view-root')[0], this.swipeLine.nativeElement);
    this.rend.removeChild(document.getElementsByClassName('esri-view-root')[0], this.swipeMsg.nativeElement);
    this.rend.removeStyle(this.canvas, 'clip-path');
    this.rend.removeStyle(this.canvas, 'clip');
    this.watchU.remove();
  }

}
