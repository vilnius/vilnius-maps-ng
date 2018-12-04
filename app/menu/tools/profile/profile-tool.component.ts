import { Component, OnInit } from '@angular/core';

import { ProfileToolService } from './profile-tool.service';
import { ToolsNameService } from '../../tools-name.service';
import { ToolsList } from '../../tools.list';

import { Subscription } from 'rxjs';

@Component({
  selector: 'profile-tool',
  templateUrl: './app/menu/tools/profile/profile-tool.component.html',
  styles: [`
		:host button {
	    margin: 10px;
	    padding: 6px 10px 6px 10px;
	    background-color: #e9e9e9;
	    border: 1px solid #53565d;
	    border-radius: 2px;
			font-size: 14px;
	}
	.svg-measure {
		font-size: 18px;
	}
	`]
})

export class ProfileToolComponent implements OnInit {
  toolActive = false;
  s: Subscription;

  constructor(
    private profileToolService: ProfileToolService,
    private toolsNameService: ToolsNameService
  ) { }

  toggleMeasure() {
    this.toolActive = this.profileToolService.toggleMeasure();

    if (this.toolActive) {
      // set tool name Obs
      this.toolsNameService.setCurentToolName(ToolsList.profile);

      // destroy tool component if other component containing draw tool got opened
      this.s = this.toolsNameService.currentToolName
        .subscribe((name) => {
          if (ToolsList.profile !== name) {
            // TODO refactor, currently using setTimeout for ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(() => {
              this.toolActive = this.profileToolService.closeMeasure();
              this.s.unsubscribe()
            });
          }
        });
    } else {
      this.s.unsubscribe()
    }
  }

  ngOnInit() {
  }


}
