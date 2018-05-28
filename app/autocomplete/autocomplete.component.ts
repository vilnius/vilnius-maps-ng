import { Component, ElementRef, Input } from '@angular/core';

import { ProjectsListService } from '../projects-list/projects-list.service';

@Component({
    selector: 'auto-complete',
    host: {
        '(document:click)': 'handleClick($event)',
    },
    template: `
            <div class="input-field col s12">
              <label for="projects">Projektų paieška</label> <br>
              <input id="projects" type="text" class="validate filter-input form-control" [(ngModel)]="query" (keyup)="filter($event)">
            </div>
            <div class="suggestions" *ngIf="filteredList.length > 0">
                <ul>
                    <li *ngFor="let item of filteredList; let idx = index"  [class.complete-selected]="idx == selectedIdx">
                        <a (click)="select(item)">{{item}}</a>
                    </li>
                </ul>
            </div>
    	`
})

export class AutoCompleteComponent {
    @Input() projectsA: any[];
    public query = '';
    public projects: any [];
    public filteredList = [];
    public elementRef;
    selectedIdx: number;

    constructor(myElement: ElementRef, private projectsService: ProjectsListService) {
        this.elementRef = myElement;
        this.selectedIdx = -1;
    }

    getList() {
      return this.projects = this.projectsA.map((obj) => (obj.attributes.VEISKMAS) );
    }

    filter(event: any) {
        console.log(event.code)
        if (this.query !== "") {

            this.filteredList = this.getList().filter(function (el) {
                return el.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
            }.bind(this));

            if (event.code == "ArrowDown" && this.selectedIdx < this.filteredList.length) {

                this.selectedIdx++;
                console.log(this.selectedIdx);
            } else if (event.code == "ArrowUp" && this.selectedIdx > 0) {
                this.selectedIdx--;
                console.log(this.selectedIdx);
            }
        } else {
            this.filteredList = [];
        }
    }

    select(item) {
        console.log(item);
        this.query = item;
        this.filteredList = [];
        this.selectedIdx = -1;

        this.projectsService.filterAutoComplete(item);

    }

    handleBlur() {
        if (this.selectedIdx > -1) {
            this.query = this.filteredList[this.selectedIdx];
        }
        this.filteredList = [];
        this.selectedIdx = -1;
    }

    handleClick(event) {
        let clickedComponent = event.target;
        let inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);
        if (!inside) {
            this.filteredList = [];
        }
        this.selectedIdx = -1;
    }

}
