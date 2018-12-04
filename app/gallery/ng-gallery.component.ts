import { Component, Input, OnDestroy, AfterViewInit } from '@angular/core';

const baguetteBox = require('baguettebox.js');
require('baguettebox.js/dist/baguetteBox.min.css');

@Component({
  selector: 'ng-gallery',
  styles: [`
    .gallery-item {
      margin: 0;
      max-width: 33%;
      max-height: 100px;
      cursor: pointer;
      display: inline-block;
      position: relative;
      overflow: hidden;
      padding: 2px;
    }
    @media only screen and (min-width: 1319px) {
      .gallery-item {
        max-width: 32%;
      }
    }
  `],
  template: `
    <!--Fake Gallery DOM -->
    <div id="gallery-ng-projects" class="gallery" *ngIf="gallery">
      <div class="gallery-item" *ngFor="let item of gallery">
        <a href="{{item.image}}">
            <img src="{{item.thumbnail}}" alt="Investiciniai projektai">
        </a>
      </div>
    </div>
  `
})

export class NgGalleryCompontent implements OnDestroy, AfterViewInit {
  @Input() gallery: any;

  constructor() { }

  ngAfterViewInit() {
    baguetteBox.run('.gallery');
    //append Gallery to popup
    setTimeout(() => {
      let gallery = document.getElementById("gallery-ng-projects");
      let laoder = document.getElementById("gallery-loader");
      if ((gallery !== null) && (laoder !== null)) {
        laoder.setAttribute("style", "display: none;");
        //console.log(gallery )
        document.getElementById("gallery-container").appendChild(gallery);
      }
    }, 1000);
  }

  ngOnDestroy() {
    baguetteBox.destroy();
  }
}
