import { Component, OnInit, OnChanges } from '@angular/core';

import { MapOptions } from '../options';

import values from 'lodash-es/values';

@Component({
    selector: 'menu-themes',
    template: `
      <div class="menu-header">
        <p>Pasirinkite temą:</p>
        <a (click)="closeToggle()" class="button close animate" title="Uždaryti">✕</a>
			</div>
			<perfect-scrollbar>
				<div class="menu-themes-content">
					<h2>Pagrindinės temos</h2>
					<div>
						<div class="sub-theme align-left">
						<a routerLink="/">
							<img src="./app/img/home.png" alt="Pradinis puslapis"></a>
							<p>Į pradžią</p>
						</div>
					</div>
					<div *ngFor="let theme of themes; let i=index ; let odd=odd">
						<div *ngIf="theme.production && !theme.hide  && !theme.external && !theme.custom" class="sub-theme" [class.align-left]="odd" [class.align-right]="!odd" routerLinkActive="current-theme">
							<a *ngIf="!theme.url && !theme.custom" routerLink="/{{theme.id}}" fragment="layers">
								<img [src]="theme.imgUrl" [alt]="theme.imgAlt"/>
							</a>
							<a *ngIf="theme.url" [href]="theme.url" fragment="layers">
								<img [src]="theme.imgUrl" [alt]="theme.imgAlt"/>
							</a>
							<a *ngIf="!theme.url && theme.custom" [href]="theme.id" fragment="layers">
								<img [src]="theme.imgUrl" [alt]="theme.imgAlt"/>
							</a>
							<p>{{theme.name}}</p>
						</div>
					</div>

					<h2>Papildomo funkcionalumo temos</h2>
					<div *ngFor="let theme of themes; let i=index; let odd=odd">
						<div *ngIf="theme.production && !theme.hide && !theme.external && theme.custom" class="sub-theme" [class.align-left]="!odd" [class.align-right]="odd" routerLinkActive="current-theme">
							<a *ngIf="!theme.url && !theme.custom" routerLink="/{{theme.id}}" fragment="layers">
								<img [src]="theme.imgUrl" [alt]="theme.imgAlt"/>
							</a>
							<a *ngIf="theme.url" [href]="theme.url" fragment="layers">
								<img [src]="theme.imgUrl" [alt]="theme.imgAlt"/>
							</a>
							<a *ngIf="!theme.url && theme.custom" routerLink="/{{theme.id}}" fragment="layers">
								<img [src]="theme.imgUrl" [alt]="theme.imgAlt"/>
							</a>
							<p>{{theme.name}}</p>
						</div>
					</div>

					<h2>Kiti žemėlapiai</h2>
					<div *ngFor="let theme of themes; let i=index; let odd=odd">
						<div *ngIf="theme.production && !theme.hide && theme.external" class="sub-theme" [class.align-left]="!odd" [class.align-right]="odd" routerLinkActive="current-theme">
							<a *ngIf="theme.url" rel="noopener noreferrer" target="_blank" [href]="theme.url" fragment="layers">
								<img [src]="theme.imgUrl" [alt]="theme.imgAlt"/>
							</a>
							<p>{{theme.name}}</p>
						</div>
					</div>
	      </div>
			</perfect-scrollbar>
    `
})
export class MenuThemesComponent  implements OnInit, OnChanges {
	themes: any[];

  closeToggle() {
		window.location.hash = "";
  }

  ngOnInit() {
		this.themes = values(MapOptions.themes);
  }

	ngOnChanges() {
	}

}
