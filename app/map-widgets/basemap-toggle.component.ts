import { Component, OnInit, Input } from '@angular/core';

import { BasemapsService } from './basemaps.service';

@Component({
  selector: 'basemap-toggle',
  styles: [`
      #basemap-button {
        position: absolute;
        right: 10px;
        bottom: 40px;
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
    @media only screen and (min-width: 840px) {
      #basemap-button {
        right: 20px;
      }
    }
    `],
  template: `
      <div id="basemap-button" class="box-shadow">
        <form>
        <mat-select placeholder="Pagrindas" [(ngModel)]="selectedValue" name="basemap" (ngModelChange)="toggleBasemap(selectedValue)">
          <mat-option *ngFor="let base of basemaps" [value]="base.id">
            {{base.name}}
          </mat-option>
        </mat-select>
        </form>
      </div>
    `
})

export class BasemapToggle implements OnInit {
  @Input() view: any;

  selectedValue: string;

  basemaps: any[];

  constructor(private basemapsService: BasemapsService) {
    this.basemaps = this.basemapsService.returnBasemaps();
  }

  toggleBasemap(id: string) {
    this.basemapsService.toggleBasemap(id, this.view);
  }

  ngOnInit() {
    this.selectedValue = this.basemapsService.returnActiveBasemap();
    this.basemapsService.filterBasemap( this.basemapsService.returnActiveBasemap(), this.view);

  }
}
