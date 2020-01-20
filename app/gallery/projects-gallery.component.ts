import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { ProjectsListService } from '../projects-list/projects-list.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'projects-gallery',
  template: `
    <ng-gallery *ngIf="gallery.length > 0" [gallery]="gallery"></ng-gallery>
  `
})

export class ProjectsGalleryComponent implements OnInit, OnDestroy {
  gallery = [];
  subscription: Subscription;

  constructor(private projectsListService: ProjectsListService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.subscription = this.projectsListService.galleryArr.subscribe((imgGallery) => {
      // set to emtpy array and destroy child gallery
      this.gallery = [];
			this.cdr.detectChanges();

      setTimeout(()=>{
        this.gallery = imgGallery;
				this.cdr.detectChanges();
      }, 600);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
