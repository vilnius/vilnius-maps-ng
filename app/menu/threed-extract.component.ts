import { Component } from '@angular/core';


@Component({
  selector: 'extract-3d',
  templateUrl: './app/menu/tools/threed-extract/threed-extract.component.html',
  styles: [`
		:host button {
	    margin: 10px;
	    padding: 6px 10px 6px 10px;
	    background-color: #e9e9e9;
	    border: 1px solid #53565d;
	    border-radius: 2px;
			font-size: 14px;
		}
	`]
})

export class ThreeDExtractComponent {
  private toolActive = false;

  toggleExtract() {
    this.toolActive = !this.toolActive;
  }

	closeMeasure() {
		this.toolActive = false;
	}

}
