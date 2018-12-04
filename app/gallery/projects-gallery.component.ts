import { Component, OnInit, OnDestroy } from '@angular/core';

import { ProjectsListService } from '../projects-list/projects-list.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'projects-gallery',
  template: `
    <ng-gallery *ngIf="gallery.length > 0" [gallery]="gallery"></ng-gallery>
  `
})

export class ProjectsGalleryComponent implements OnInit, OnDestroy {
  gallery: any = [];
  subscription: Subscription;

  constructor(private projectsListService: ProjectsListService) { }

  ngOnInit() {
    this.subscription = this.projectsListService.galleryArr.subscribe((imgGallery) => {
      // set to emtpy array and destroy child gallery
      this.gallery = [];
      setTimeout(()=>{
        this.gallery = imgGallery;
      }, 600);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
