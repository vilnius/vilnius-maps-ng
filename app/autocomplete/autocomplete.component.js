"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var projects_list_service_1 = require("../projects-list/projects-list.service");
var AutoCompleteComponent = (function () {
    function AutoCompleteComponent(myElement, projectsService) {
        this.projectsService = projectsService;
        this.query = '';
        this.filteredList = [];
        this.elementRef = myElement;
        this.selectedIdx = -1;
    }
    AutoCompleteComponent.prototype.getList = function () {
        return this.projects = this.projectsA.map(function (obj) { return (obj.attributes.VEISKMAS); });
    };
    AutoCompleteComponent.prototype.filter = function (event) {
        console.log(event.code);
        if (this.query !== "") {
            this.filteredList = this.getList().filter(function (el) {
                return el.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
            }.bind(this));
            if (event.code == "ArrowDown" && this.selectedIdx < this.filteredList.length) {
                this.selectedIdx++;
                console.log(this.selectedIdx);
            }
            else if (event.code == "ArrowUp" && this.selectedIdx > 0) {
                this.selectedIdx--;
                console.log(this.selectedIdx);
            }
        }
        else {
            this.filteredList = [];
        }
    };
    AutoCompleteComponent.prototype.select = function (item) {
        console.log(item);
        this.query = item;
        this.filteredList = [];
        this.selectedIdx = -1;
        this.projectsService.filterAutoComplete(item);
    };
    AutoCompleteComponent.prototype.handleBlur = function () {
        if (this.selectedIdx > -1) {
            this.query = this.filteredList[this.selectedIdx];
        }
        this.filteredList = [];
        this.selectedIdx = -1;
    };
    AutoCompleteComponent.prototype.handleClick = function (event) {
        var clickedComponent = event.target;
        var inside = false;
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
    };
    return AutoCompleteComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], AutoCompleteComponent.prototype, "projectsA", void 0);
AutoCompleteComponent = __decorate([
    core_1.Component({
        selector: 'auto-complete',
        host: {
            '(document:click)': 'handleClick($event)',
        },
        template: "\n            <div class=\"input-field col s12\">\n              <label for=\"projects\">Projekt\u0173 paie\u0161ka</label> <br>\n              <input id=\"projects\" type=\"text\" class=\"validate filter-input form-control\" [(ngModel)]=\"query\" (keyup)=\"filter($event)\">\n            </div>\n            <div class=\"suggestions\" *ngIf=\"filteredList.length > 0\">\n                <ul>\n                    <li *ngFor=\"let item of filteredList; let idx = index\"  [class.complete-selected]=\"idx == selectedIdx\">\n                        <a (click)=\"select(item)\">{{item}}</a>\n                    </li>\n                </ul>\n            </div>\n    \t"
    }),
    __metadata("design:paramtypes", [core_1.ElementRef, projects_list_service_1.ProjectsListService])
], AutoCompleteComponent);
exports.AutoCompleteComponent = AutoCompleteComponent;
