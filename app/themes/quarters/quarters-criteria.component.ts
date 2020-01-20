import { Component, AfterViewInit, OnDestroy, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { MatBottomSheet } from '@angular/material';

import { MapService } from '../../map.service';
import { QuartersLayersService } from './quarters-layers.service';
import { CriteriaSelectionComponent } from './criteria-selection.component';

import { timer, of, Subject } from 'rxjs';

import { switchMap, filter, takeUntil, take } from 'rxjs/operators';

@Component({
  selector: 'quarters-criteria',
  template: `
		<button #criteriaButton mat-raised-button (click)="openBottomSheet()">Pasirinkite kriterijų</button>
		{{t}}
	`,
	styles: [`
		:host {
			position: fixed;
	    bottom: 0;
	    text-align: center;
	    left: 0;
			right: 0;
			z-index: 1;
		}

		button {
			padding: 10px 20px;
			background: #e61c24;
			color: #fff;
			border-top-right-radius: 2px;
			border-top-left-radius: 2px;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	    -webkit-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	    -moz-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
			display: none;
		}
		@media only screen and (max-width: 1382px) {
			button {
				padding: 5px 10px;
			} 
		}
	`],
	entryComponents: [CriteriaSelectionComponent]
})
export class QuartersCriteriaComponent implements AfterViewInit, OnDestroy {
	@ViewChild('criteriaButton') criteriaButton: ElementRef;
	quartersLayers: any[];
	destroyCompoent$ = new Subject();

  constructor(
		private bottomSheet: MatBottomSheet,
		private rend: Renderer2,
		private mapService: MapService,
		private quartersLayersService: QuartersLayersService
	) { }

  ngAfterViewInit() {
		timer(1000, 1000).pipe(
			switchMap((e) => {
				const map = this.mapService.returnMap();
				return of(map.findLayerById('quarters'))
			}),
			filter((feature) => {
				return feature && feature.sublayers.items.length > 0;
			}),
			take(1),
			// to avoid memory leaks
			// when the subscription hasn’t received a value
			// before the component got destroyed.
			takeUntil(this.destroyCompoent$)
		).subscribe((featureLayer) => {
			this.initFilters(featureLayer);
		});
  }

	initFilters(featureLayer) {
		this.quartersLayers = featureLayer.sublayers.items.sort((a, b) => a.id - b.id);
		this.rend.setStyle(this.criteriaButton.nativeElement, 'display', 'inline-block');

		// cache
		this.quartersLayersService.setQuartersLayer(this.quartersLayers);
	}

	openBottomSheet(): void {
		if (this.quartersLayers) {
			this.bottomSheet.open(CriteriaSelectionComponent);
		}

	}

	ngOnDestroy() {
		this.destroyCompoent$.next();
		this.destroyCompoent$.complete();
	}

}