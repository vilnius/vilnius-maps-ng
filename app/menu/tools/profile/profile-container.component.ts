import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';

import { MapService } from '../../../map.service';
import { ProfileToolService } from './profile-tool.service';
import { ProfileElevationComponent } from './profile-elevation.component';
import PolylineDrawAction = require('esri/views/2d/draw/PolylineDrawAction');

import Draw = require('esri/views/2d/draw/Draw');

import isEmpty from 'lodash-es/isempty';

@Component({
  selector: 'profile-container',
  templateUrl: './app/menu/tools/profile/profile-container.component.html',
  styles: [`
		:host button {
	    margin: 10px;
	    padding: 6px 10px 6px 10px;
	    background-color: #e9e9e9;
	    border: 1px solid #53565d;
	    border-radius: 2px;
			font-size: 14px;
		}
		.form-control {
			border: 1px solid #ccc;
		}
	  .esri-widget-button {
			width: 160px;
	    margin-bottom: 10px;
	    margin-right: 10px;
	    margin-left: 10px;
	    padding: 6px 12px 6px;
	    line-height: 1.6;
	    font-size: 14px;
	    border: 1px solid #53565d;
	    background-color: #e9e9e9;
	    border-radius: 2px;
	    display: inline-block;
	    height: 35px;
	  }
	  .esri-widget-button.auto-width {
			width: auto;
	  }
	  :host .esri-widget-button.active {
			background-color: #53565d;
	    border: 1px solid #53565d;
			color: #fff;
	   }
	   .esri-icon-polyline,
		 .esri-widget-button span {
	     margin-right: 10px;
			 font-size: 17px;
	   }
		 .profile-msg {
			 border: 1px solid #e61c24;
			 box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
			-webkit-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
			-moz-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		 }
		 .profile-msg,
		 .profile-spinner {
			 position: absolute;
	     top: 50%;
	     left: 50%;
	     transform: translate(-50%, -50%);
	     background: #e9e9e9;
	     color: #000;
	     padding: 10px;
	     font-size: 16px;
	     border-radius: 2px;
		}
		.profile-spinner {
			background: none;
		}
	`]
})

export class ProfileContainerComponent implements OnInit, OnDestroy {
  @ViewChild(ProfileElevationComponent) pEC;
  private drawActive = false;

  //dojo draw events handlers Array
  private eventHandlers = [];
  chartData: any;
  isFullScreen = false;
  view: any;
  draw: Draw;
  hasError = false;
  updatingChart = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private mapService: MapService,
    private profileToolService: ProfileToolService
  ) {
    //this.cdr.detach()
  }

  ngOnInit() {
    this.view = this.mapService.getView();

    // add draw capabilities for temporary geometries
    this.view.then(() => {
      this.draw = this.profileToolService.initDraw(this.view);
      this.profileToolService.initGeoprocessor(this.view);
    });
  }

  toggleDraw() {
    this.drawActive = !this.drawActive;
  }

  selectDrawEl(): void {
    // order is important
    this.toggleDraw();

    // if button was active (after taggle becomes false)
    // button behaves as reset button and starts to draw
    if (!this.drawActive) {

      this.enableCreatePolyline();
      this.toggleDraw();
    } else {
      this.pEC.resetChart();
      this.hasError = false;
      this.view.graphics.removeAll();

      // TODO implement ssuspend hitTest of feature layers
      this.mapService.suspendLayersToggle();
      this.enableCreatePolyline();
    }
  }

  //Polygon approach
  enableCreatePolyline(): void {
    // create() will return a reference to an instance of PolygonDrawAction
    let action = this.draw.create("polygon");

    // focus the view to activate keyboard shortcuts for drawing polygons
    this.view.focus();

    // listen to vertex-add event on the action
    this.eventHandlers.push(action.on("vertex-add", (e) => this.profileToolService.createPolylineGraphic(e)));

    // listen to cursor-update event on the action
    this.eventHandlers.push(action.on("cursor-update", (e) => this.profileToolService.createPolylineGraphic(e)));

    // listen to vertex-remove event on the action
    this.eventHandlers.push(action.on("vertex-remove", (e) => this.profileToolService.createPolylineGraphic(e)));

    // listen to draw-complete event on the action
    this.eventHandlers.push(action.on("draw-complete", (e) => {
      this.updatingChart = true;
      this.profileToolService.createPolylineGraphic(e, true).then((result) => {
        this.updatingChart = false;
        if (result.details && (result.details.httpStatus === 400)) {
          this.hasError = true;
          this.chartData = null;
        } else {
          this.hasError ? this.hasError = false : this.hasError;
          this.chartData = result;
        }
        // detect changes for view and child components
        this.cdr.detectChanges();
      });
      this.toggleDraw();
    }));
  }

  //remove eventHandlers
  removeEventHandlers() {
    this.eventHandlers.forEach((event) => {
      event.remove();
    });
    this.eventHandlers = [];
  }

  resetTools() {
    // complete 2d draw action since 4.5 complete() method is available
    const action = this.draw.activeAction as PolylineDrawAction;

    if (!isEmpty(action)) {
      action.complete();

      // BUG Fix: in order to unsuspend run destroy as well
      // BUG effects if we closing draw feature after first draw element has been added
      action.destroy();

      this.draw.activeAction = null;
    }

    this.view.graphics.removeAll();

    //reset eventHandler events
    this.removeEventHandlers();

    //unsuspend layers
    if (this.mapService.getSuspendedIdentitication()) {
      this.mapService.unSuspendLayersToggle();
    }
  }

  ngOnDestroy() {
    this.resetTools();
  }

}
