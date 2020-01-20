import { Component, OnInit } from '@angular/core';

import { MapService } from '../../map.service';
import { QuartersLayersService } from './quarters-layers.service';

import { Observable } from 'rxjs';

import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'criteria-selection-componentent',
	styles: [`
		.button {
			margin: 5px;
			padding: 5px 15px;
			background: #393c40;
			color: white;
			border-radius: 2px;
			font-size: 15px;
			white-space: pre-wrap;
			white-space: -moz-pre-wrap;
			white-space: -pre-wrap;
			white-space: -o-pre-wrap;
			word-wrap: break-word;
		}

		.active-filter {
			background: #e61c24;
		}
		.active-filter:before {
			content: ' ';
	    position: absolute;
	    width: 0px;
	    height: 0px;
	    border-left: 10px solid transparent;
	    border-right: 10px solid transparent;
	    border-bottom: 10px solid #e61c24;
	    top: -8px;
	    left: 0;
	    right: 0;
	    margin: 0 auto;
		}

		@media only screen and (max-width: 1382px) {

		}
	`],
  template: `
			<criteria-description-tag [singleLayersMeta]="singleLayersMeta$ | async"></criteria-description-tag>
			<ng-container *ngFor="let layer of quartersLayers">
				<div class="button" [class.active-filter]="activeId === layer.id" (click)="openLink($event, layer.id)">
				{{ layer.title }}
				</div>
			</ng-container>
	`,
})
export class CriteriaSelectionComponent implements OnInit {
	quartersLayers: any;
	activeId: number;
	view: any;
	singleLayersMeta$: Observable<any>;

  constructor(
		//private bottomSheetRef: MatBottomSheetRef<CriteriaSelectionComponent>,
		private mapService: MapService,
		private quartersLayersService: QuartersLayersService
	) {}

	ngOnInit() {
		this.view = this.mapService.getView();
		this.quartersLayers = this.quartersLayersService.quartersLayers;
		this.setActiveCriteria(this.quartersLayers);
	}

	setActiveCriteria(quartersLayers) {
		// set id using some() method
		if (this.quartersLayers) {
			quartersLayers.some((layer) => {
				if(layer.visible) {
					this.activeId = layer.id;
					window.location.hash = 'legend';
					this.passObservable();
					return true;
				}

			});
		}

	}

  openLink(event: MouseEvent, id: number): void {
		if (this.quartersLayers) {
			this.activeId = id;
			this.quartersLayers.map((layer) => {
				layer.id === id ? layer.visible = true : layer.visible = false;
				return layer;
			})

			this.passObservable();
		}

		this.view.popup.close();
		window.location.hash = 'legend';

    //this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

	passObservable() {
		this.singleLayersMeta$ = this.quartersLayersService.quarterLayersMeta.pipe(
			map((meta) => meta.filter((meta: any) => meta.id === this.activeId)[0]),
			filter(description  => description)
		)
	}

}
