import { Component } from '@angular/core';

import { ToolsNameService } from '../../tools-name.service';
import { SwipeToolService } from './swipe-tool.service';
import { MapService } from '../../../map.service';

import { ToolsList } from '../../tools.list';

import { Subscription, Observable } from 'rxjs';
import { debounceTime, tap, filter, takeUntil } from 'rxjs/operators';


// id for raster layer in projects theme
export const projectRasterLayerID = "projects-mil";

@Component({
  selector: 'swipe-tool',
  template: `
		<button *ngIf="true" id="measure-button" class="tool-button" (click)="toggleSwipe()" [class.active]="toolActive">
			<span class="svg-measure">
				<svg width="22" height="16" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink">
					<image *ngIf="!toolActive; else svgToolW" xlink:href="../../app/img/svg/swipe.svg" x="0" y="0" height="22px" width="16px"/>
					<ng-template #svgToolW><image xlink:href="../../app/img/svg/swipe-w.svg" x="0" y="0" height="22px" width="16px"/></ng-template>
				</svg>
			</span>
			Sprendinių palyginimas
		</button>
	`,
  styles: [`
		:host button {
	    margin: 10px;
	    padding: 6px 10px 6px 10px;
	    background-color: #e9e9e9;
	    border: 1px solid #53565d;
	    border-radius: 2px;
			font-size: 14px;
		}
		.svg-measure {
			font-size: 16px;
	    top: 2px;
		}
	`]
})

export class SwipeToolComponent {
  private toolActive = false;
  s: Subscription;
  b: Subscription;
  stop$: Observable<string>;

  constructor(
    private sts: SwipeToolService,
    private ms: MapService,
    private toolsNameService: ToolsNameService
	) { }

  toggleSwipe() {
    this.toolActive = !this.toolActive;
    if (this.toolActive) {
      // destroy tool component if other component containing draw tool got opened
      this.s = this.toolsNameService.currentToolName.pipe(
        debounceTime(1000),
        takeUntil(this.toolsNameService.currentToolName.pipe(
          filter(name => ToolsList.swipe !== name),
          tap(() => {
            //console.log('takeUntil');
            //console.log('Subscription');
            setTimeout(() => {
              this.removeRasterLayer();
              this.toolActive = false;
              this.sts.closeSwipe();
            });
          })
        ))
      )
      .subscribe(() => {
        this.sts.toggleSwipe(this.toolActive);
      });

      // set tool name Obs
      this.toolsNameService.setCurentToolName(ToolsList.swipe);
    }

    if (!this.toolActive) {
      if (this.s) {
        this.sts.closeSwipe();
        this.removeRasterLayer();
        this.s.unsubscribe();
        this.s = null;
      }

    }

  }

  removeRasterLayer() {
    // remove layer
    const map = this.ms.returnMap();
    const layer = map.findLayerById(projectRasterLayerID);

    if (layer) {
      map.remove(layer);
    }

  }

}
