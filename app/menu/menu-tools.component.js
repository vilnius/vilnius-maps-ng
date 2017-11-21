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
var Print = require("esri/widgets/Print");
var MenuToolsComponent = (function () {
    function MenuToolsComponent() {
    }
    MenuToolsComponent.prototype.initPrint = function () {
        return new Print({
            view: this.viewTools,
            printServiceUrl: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Tvarkomos_teritorijos/PrintingTools/GPServer/Export%20Web%20Map",
            container: "print-menu"
        });
    };
    MenuToolsComponent.prototype.ngOnInit = function () {
        console.log();
        this.initPrint();
    };
    return MenuToolsComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MenuToolsComponent.prototype, "viewTools", void 0);
MenuToolsComponent = __decorate([
    core_1.Component({
        selector: 'menu-tools',
        template: "\n      <div>\n        <p>Pasirinkite \u012Frank\u012F:</p>\n        <a href=\"#tools\" class=\"button close animate\" title=\"U\u017Edaryti\">\u2715</a>\n        <div id=\"tools-measure\"></div>\n        <div id=\"tools-print\">\n          <button id=\"print-button\" (click)=\"printActive = !printActive\" [class.active]=\"printActive\">\n          <span class=\"svg-print\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\">\n              <path style=\"text-indent:0;text-align:start;line-height:normal;text-transform:none;block-progression:tb;-inkscape-font-specification:Bitstream Vera Sans\" d=\"M 9 4 L 9 5 L 9 11 L 7 11 C 5.3550302 11 4 12.35503 4 14 L 4 23 L 4 24 L 5 24 L 9 24 L 9 27 L 9 28 L 10 28 L 22 28 L 23 28 L 23 27 L 23 24 L 27 24 L 28 24 L 28 23 L 28 14 C 28 12.35503 26.64497 11 25 11 L 23 11 L 23 5 L 23 4 L 22 4 L 10 4 L 9 4 z M 11 6 L 21 6 L 21 11 L 11 11 L 11 6 z M 7 13 L 25 13 C 25.56503 13 26 13.43497 26 14 L 26 22 L 23 22 L 23 19 L 23 18 L 22 18 L 10 18 L 9 18 L 9 19 L 9 22 L 6 22 L 6 14 C 6 13.43497 6.4349698 13 7 13 z M 8 14 C 7.4477153 14 7 14.447715 7 15 C 7 15.552285 7.4477153 16 8 16 C 8.5522847 16 9 15.552285 9 15 C 9 14.447715 8.5522847 14 8 14 z M 11 20 L 21 20 L 21 26 L 11 26 L 11 20 z\" color=\"#000\" overflow=\"visible\" font-family=\"Bitstream Vera Sans\"></path>\n          </svg>\n          </span>\n          Spausdinti</button>\n        </div>\n\n        <div id=\"tools-opacity\" style=\"display: none\">\n          <span>Sluoksni\u0173 nepermatomumo valdymas:</span>\n          <div id=\"tools-opacity-widget\"></div>\n        </div>\n      </div>\n      <div id=\"print-container\">\n        <div id=\"print-menu\" class=\"print\" [class.print-active]=\"printActive\" [ng2-draggable]=\"true\">\n        <span id=\"close-print\" [class.print-active]=\"printActive\"\n        (click)=\"printActive = !printActive\"\n        >\n            <svg xml:space=\"preserve\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" height=\"612px\" id=\"Capa_1\"  version=\"1.1\" viewBox=\"0 0 612 612\" width=\"612px\" x=\"0px\" xmlns=\"http://www.w3.org/2000/svg\" y=\"0px\">\n            <g>\n              <g id=\"cross\">\n                <g>\n                  <polygon points=\"612,36.004 576.521,0.603 306,270.608 35.478,0.603 0,36.004 270.522,306.011 0,575.997 35.478,611.397      306,341.411 576.521,611.397 612,575.997 341.459,306.011    \"></polygon>\n                </g>\n              </g>\n            </g>\n            </svg>\n          </span>\n        <span id=\"drag-print\" [class.print-active]=\"printActive\">\n          <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\">\n              <path style=\"line-height:normal;text-indent:0;text-align:start;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000;text-transform:none;block-progression:tb;isolation:auto;mix-blend-mode:normal\" d=\"M 16 2.5859375 L 11.292969 7.2929688 L 12.707031 8.7070312 L 15 6.4140625 L 15 12 L 17 12 L 17 6.4140625 L 19.292969 8.7070312 L 20.707031 7.2929688 L 16 2.5859375 z M 7.2929688 11.292969 L 2.5859375 16 L 7.2929688 20.707031 L 8.7070312 19.292969 L 6.4140625 17 L 13 17 L 13 15 L 6.4140625 15 L 8.7070312 12.707031 L 7.2929688 11.292969 z M 24.707031 11.292969 L 23.292969 12.707031 L 25.585938 15 L 19 15 L 19 17 L 25.585938 17 L 23.292969 19.292969 L 24.707031 20.707031 L 29.414062 16 L 24.707031 11.292969 z M 15 19 L 15 25.585938 L 12.707031 23.292969 L 11.292969 24.707031 L 16 29.414062 L 20.707031 24.707031 L 19.292969 23.292969 L 17 25.585938 L 17 19 L 15 19 z\"></path>\n          </svg> <span title=\"Keiskite pad\u0117ti pel\u0117s pagalba\">- keiskite pad\u0117ti</span>\n          </span>\n        </div>\n      </div>\n    "
    })
], MenuToolsComponent);
exports.MenuToolsComponent = MenuToolsComponent;
//# sourceMappingURL=menu-tools.component.js.map