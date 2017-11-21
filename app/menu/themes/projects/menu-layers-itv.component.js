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
var map_service_1 = require("../map.service");
var options_1 = require("../options");
var MenuLayersItvComponent = (function () {
    function MenuLayersItvComponent(_mapService) {
        this._mapService = _mapService;
        this.isChecked = true;
    }
    MenuLayersItvComponent.prototype.toggleLayerVisibility = function (event) {
        //or use [change]="isChecked" and (change)="toggleLayerVisibility($event)" with event.target.value instead
        this.isChecked = event;
        this.isChecked ? this._mapService.returnFeatureLayers().map(function (feature) { feature.visible = true; }) : this._mapService.returnFeatureLayers().map(function (feature) { feature.visible = false; });
    };
    MenuLayersItvComponent.prototype.ngOnInit = function () {
        this.name = options_1.MapOptions.themes.itvTheme.name;
    };
    return MenuLayersItvComponent;
}());
MenuLayersItvComponent = __decorate([
    core_1.Component({
        selector: 'menu-layers-itv',
        template: "\n      <div>\n        <p>Temos sluoksniai:</p>\n        <a href=\"#layers\" class=\"button close animate\" title=\"U\u017Edaryti\">\u2715</a>\n        <div id=\"layer-list\" class=\"inner\">\n          <div class=\"layer-group\" *ngIf=\"name\">\n            <p>{{name}}:</p>\n          </div>\n          <div class=\"checkbox\">\n            <input type=\"checkbox\" [ngModel]=\"isChecked\" value id=\"projects\" (ngModelChange)=\"toggleLayerVisibility($event)\">\n            <label class=\"animate\" for=\"projects\">\n              Investiciniai projektai\n            </label>\n          </div>\n        </div>\n      </div>\n    "
    }),
    __metadata("design:paramtypes", [map_service_1.MapService])
], MenuLayersItvComponent);
exports.MenuLayersItvComponent = MenuLayersItvComponent;
//# sourceMappingURL=menu-layers-itv.component.js.map