import { NgModule } from '@angular/core';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

import { MapQuartersComponent } from './map-quarters.component';
import { QuartersCriteriaComponent } from './quarters-criteria.component';
import { CriteriaSelectionComponent } from './criteria-selection.component';
import { CriteriaDescriptionTagComponent } from './criteria-description-tag.component';
import { ShareModule } from '../../share.module';
import { QuartersRouting } from './quarters.routing';
import { QuartersTooltipService } from './quarters-tooltip.service';
import { QuartersLayersService } from './quarters-layers.service';

@NgModule({
  imports: [
    MatBottomSheetModule,
    ShareModule,
    QuartersRouting
  ],
  declarations: [MapQuartersComponent, QuartersCriteriaComponent, CriteriaSelectionComponent, CriteriaDescriptionTagComponent],
  entryComponents: [CriteriaSelectionComponent],
  providers: [QuartersTooltipService, QuartersLayersService]
})
export class QuartersModule { }
