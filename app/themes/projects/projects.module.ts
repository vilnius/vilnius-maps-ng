import { NgModule } from '@angular/core';

import { MapProjectsComponent } from './map-projects.component';
import { ShareModule } from '../../share.module';
import { ProjectsRouting } from './projects.routing';
import { ProjectsListComponent } from '../../projects-list/projects-list.component';
import { AutoCompleteComponent } from '../../autocomplete/autocomplete.component';
import { TextHighlightPipe } from '../../pipes/text-highlight.pipe';
import { ProjectsGalleryComponent } from '../../gallery/projects-gallery.component';
import { NgGalleryCompontent } from '../../gallery/ng-gallery.component';

@NgModule({
  imports: [
    ShareModule,
    ProjectsRouting
  ],
  declarations: [
    MapProjectsComponent,
    ProjectsListComponent,
    AutoCompleteComponent,
    TextHighlightPipe,
    ProjectsGalleryComponent,
    NgGalleryCompontent
  ]
})
export class ProjectsModule { }
