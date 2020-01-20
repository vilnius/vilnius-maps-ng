import { Component, Input } from '@angular/core';

import { QuarterLayersMeta } from './QuarterLayersMeta';

@Component({
  selector: 'criteria-description-tag',
  template: `
		<div class="description-tag">{{ singleLayersMeta?.description }}</div>
	`,
	styles: [`
		.description-tag {
			background: #d6d6d6;
	    color: #1e1d1d;
	    padding: 6px;
	    font-size: 18px;
	    margin-bottom: 10px;
		}

		@media only screen and (max-width: 1382px) {
			.description-tag {
				font-size: 15px;
			} 
		}
	`]
})
export class CriteriaDescriptionTagComponent {
	@Input() singleLayersMeta: QuarterLayersMeta;
}
