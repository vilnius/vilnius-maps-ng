import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

@Component({
  selector: 'ng-gallery',
  styles: [`
    #gallery-ng-projects  {
      width: 378px;
    }
  `],
  template: `
    <!--Fake Gallery DOM -->
    <div id="gallery-ng-projects"*ngIf="gallery" #galleryDom>
        <ng2-image-gallery [images]="gallery"></ng2-image-gallery>
    </div>
  `
})

export class NgGalleryCompontent implements OnInit, OnDestroy {
  @Input() gallery: any;
  @Input() subscription: Subscription;

  //@ViewChild('galleryDom') galleryDom: ElementRef;

  constructor() {
    //this.elementRef = myElement;
  }

  ngOnInit() {
    //append Gallery to popup
    setTimeout(() => {
      let gallery = document.getElementById("gallery-ng-projects");
      let laoder = document.getElementById("gallery-loader");
      //console.log(typeof gallery )
      //console.log(gallery )
      if ((gallery !== null) && (laoder !== null)) {
        laoder.setAttribute("style", "display: none;");
        //console.log(gallery )
        document.getElementById("gallery-container").appendChild(gallery);
      }
      //console.log(this.galleryDom);
    }, 1000);
  }

  ngOnDestroy() {
    //console.log("DESTROYED")
  }
}
