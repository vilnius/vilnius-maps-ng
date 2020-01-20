import { Component, AfterViewInit, ChangeDetectorRef, Input } from '@angular/core';

import { ToolsNameService } from '../../tools-name.service';
import { ToolsList } from '../../tools.list';
import { DwgService } from './dwg.service';

import { Subscription } from 'rxjs';
import { MapOptions } from '../../../options';

@Component({
  selector: 'extract-dwg',
  templateUrl: './app/menu/tools/dwg/dwg.component.html',
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
			font-size: 16px;
	    top: 2px;
		}
  `],
  providers: [ DwgService ]
})

export class DwgComponent implements AfterViewInit {
  @Input() tool: string;
  @Input() title: string;
  private toolActive = false;
  icon = ''
  s: Subscription;

  constructor(private cdr: ChangeDetectorRef, private toolsNameService: ToolsNameService, private dwgs: DwgService) {}

  toggleExtract() {
    this.toolActive = !this.toolActive;
    if (this.toolActive) {
      // reatatch chnage detaction when we open tool
      this.cdr.reattach();

			// set tool name Obs
      this.toolsNameService.setCurentToolName(this.tool);
      this.dwgs.setTool(this.tool);

      this.s = this.toolsNameService.currentToolName
        .subscribe((name) => {
          if (this.tool !== name) { this.closeMeasure() };
        });
    } else {
      this.closeMeasure();
    }

  }

  closeMeasure() {
    this.toolActive = false;
		if (this.s) {
			this.s.unsubscribe();
		}

    //  detach changes detection
    // and last time detect changes when closing tool
    this.cdr.detach();
    this.cdr.detectChanges();
  }

	ngAfterViewInit() {
    if (this.tool === ToolsList.dwg) {
      this.icon = MapOptions.mapOptions.staticServices.extractDWG.icon;

    } else {
      this.icon = MapOptions.mapOptions.staticServices.extractDWGTech.icon;
    }
    this.cdr.detectChanges();
		this.cdr.detach();
	}

}
