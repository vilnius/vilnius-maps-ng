import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';

import { ProjectsListService } from '../projects-list/projects-list.service';
import { Ng2GalleryCompontent } from './ng2-gallery.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'projects-gallery',
  template: `
    <ng2-gallery *ngIf="gallery.length > 0" [gallery]="gallery"></ng2-gallery>
  `
})

export class ProjectsGalleryComponent implements OnInit, OnDestroy {
  //  @ViewChild('galleryDom') galleryDom: ElementRef;
  //elementRef;
  gallery: = [];
  subscription: Subscription;

  constructor(myElement: ElementRef, private projectsListService: ProjectsListService) {
    //this.elementRef = myElement;
  }

  ngOnInit() {
    //append Gallery to popup
    this.subscription = this.projectsListService.galleryArr.subscribe((imgGallery) => {
      this.gallery = [];
      //timeout, to fix ng2 gallery bug, to destroy element every time new images are added
      setTimeout(() => {
        this.gallery = imgGallery;
      }, 1000)
      //console.log("GALERIJA", imgGallery)
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
