import { Component, OnInit, Input } from '@angular/core';

import { MapWidgetsService } from './map-widgets.service';

@Component({
  selector: 'basemap-toggle',
  styles: [`
      #basemap-button {
        position: absolute;
        right: 20px;
        bottom: 60px;
        z-index: 0;
        width: 100px;
        background: #fff;
        background-color: #53565d;
        border: 1px solid #53565d;
        border-top: 1px solid rgba(202, 201, 201, 0.2);
        -moz-box-sizing: content-box;
        -webkit-box-sizing: content-box;
        box-sizing: content-box;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        -webkit-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        -moz-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        color:#fff;
    }
    #basemap-button form {
      margin: 0;
    }
    #basemap-button label:hover {
       cursor: pointer;
    }
    #basemap-button label {
      width: 100%;
      font-size: 14px;
      line-height: 1.6;
      margin: 0;
      padding-left: 10px;
      padding: 13px 10px;
      text-align: center;
    }
    @media only screen and (min-width: 740px) {
      #basemap-button {
        bottom: 45px;
      }
    }
    `],
  template: `
      <div id="basemap-button" class="box-shadow">
        <form>
        <md-select placeholder="Pagrindas" [(ngModel)]="selectedValue" name="basemap" (ngModelChange)="toggleBasemap(selectedValue)">
          <md-option *ngFor="let base of basemaps" [value]="base.id">
            {{base.name}}
          </md-option>
        </md-select>
        </form>
      </div>
    `
})

export class BasemapToggle implements OnInit {
  @Input() view: any;

  selectedValue: string;

  basemaps: any[];

  constructor(private mapWidgetsService: MapWidgetsService) {
    this.basemaps = this.mapWidgetsService.returnBasemaps();
  }

  toggleBasemap(id: string) {
    this.mapWidgetsService.toggleBasemap(id, this.view);
  }

  ngOnInit() {
    this.selectedValue = this.mapWidgetsService.returnActiveBasemap();
    this.mapWidgetsService.filterBasemap( this.mapWidgetsService.returnActiveBasemap(), this.view);
    
  }
}
