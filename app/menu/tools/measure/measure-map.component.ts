import { Component, ChangeDetectorRef, OnInit, AfterViewInit, OnChanges } from '@angular/core';

import { MapService } from '../../../map.service';
import { MeasureMapService } from './measure-map.service';
import { ToolsNameService } from '../../tools-name.service';
import { ToolsList } from '../../tools.list';

import { Subscription } from 'rxjs';

@Component({
  selector: 'measure-map',
  templateUrl: './app/menu/tools/measure/measure-map.component.html',
  styles: [`
		:host button {
	    margin: 10px;
	    padding: 6px 10px 6px 10px;
	    background-color: #e9e9e9;
	    border: 1px solid #53565d;
	    border-radius: 2px;
			font-size: 14px;
		}
	`]
})

export class MeasureMapComponent implements OnInit, AfterViewInit, OnChanges {
  private measureActive = false;

  // checking if first theme was inisiated before
  // if true, create new input data based on new theme
  firstThemeLoaded = false;
  s: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private mapService: MapService,
    private measureMapService: MeasureMapService,
    private toolsNameService: ToolsNameService
  ) { }

  toggleMeasure() {
    this.measureActive = !this.measureActive;

    if (this.measureActive) {
      // reatatch chnage detaction when we open tool
      this.cdr.reattach();

      // set tool name Obs
      this.toolsNameService.setCurentToolName(ToolsList.measure);

      // destroy tool component if other component containing draw tool got opened
      this.s = this.toolsNameService.currentToolName
        .subscribe((name) => {
          //console.log(this.s, 'Name M', name)
          if (ToolsList.measure !== name) {
            // TODO refactor, currently using setTimeout for ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(() => {
              this.closeMeasure();
            });
          }
        });
    } else {
      this.closeMeasure();
    }

  }

  closeMeasure() {
    this.measureActive = false;
		if (this.s) {
			this.s.unsubscribe();
		}

    //  detach changes detection
    // and last time detect changes when closing tool
    this.cdr.detach();
    this.cdr.detectChanges();
  }

  ngOnInit() {
    const view = this.mapService.getView();
    view.on("layerview-create", (event) => {
      // wait for last layer to be loaded then init createInputsData
      if (!this.firstThemeLoaded) {
        if (event.layer.id === "allLayers") {
          // create buffer inputs data
          this.measureMapService.createInputsData(view);
          this.firstThemeLoaded = true;
        }
      } else {
        // create buffer inputs based on new theme
        this.measureMapService.createInputsData(view);
      }
    });
  }

  ngOnChanges(a) {
    //console.log('Change measure map', a)
  }

  ngAfterViewInit() {
    this.cdr.detach();
  }

}
