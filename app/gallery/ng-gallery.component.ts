import { Component, Input, OnDestroy, AfterViewInit, Renderer2, ChangeDetectionStrategy } from '@angular/core';

const baguetteBox = require('baguettebox.js');
//require('baguettebox.js/dist/baguetteBox.min.css');
import '../styles/baguetteBox.min.css';

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
  `,
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class NgGalleryCompontent implements OnDestroy, AfterViewInit {
  @Input() gallery: any;

  constructor(private rend: Renderer2) { }

  ngAfterViewInit() {
    baguetteBox.run('.gallery');

    // append Gallery to popup
    setTimeout(() => {
      const gallery = document.getElementById("gallery-ng-projects");
      const loader = document.getElementById("gallery-loader");
      if ((gallery !== null) && (loader !== null)) {
        this.rend.setStyle(loader, 'display', 'none');
        this.rend.appendChild(document.getElementById("gallery-container"), gallery);
      }
    }, 1000);
  }

  ngOnDestroy() {
    baguetteBox.destroy();
  }
}
