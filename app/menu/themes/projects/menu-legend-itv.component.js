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
var Legend = require("esri/widgets/Legend");
var MenuLegendItvComponent = (function () {
    function MenuLegendItvComponent(_mapService) {
        this._mapService = _mapService;
    }
    //filter 3 itv layer by type "Būsena"
    MenuLegendItvComponent.prototype.filterItvLayers = function () {
        return this._mapService.returnFeatureLayers().filter(function (a) {
            return a.title === "itv-feature-layer-0" || a.title === "itv-feature-layer-2" || a.title === "itv-feature-layer-4";
        });
    };
    MenuLegendItvComponent.prototype.initLegend = function () {
        var itvLayers = this.filterItvLayers();
        itvLayers = itvLayers.map(function (layer) {
            //show legend of layers att all scale, overright current scale
            layer.minScale = 0;
            layer.maxScale = 0;
            if (layer.title === "itv-feature-layer-4") {
                //set renderer title
                layer.renderer.label = "Įgyvendinti projektai";
            }
            else if (layer.title === "itv-feature-layer-2") {
                layer.renderer.label = "Vykdomi projektai";
            }
            else {
                layer.renderer.label = "Nepradėti projektai";
            }
            layer.labelsVisible = true;
            //set layer title to empty string
            layer.title = "";
            return layer;
        });
        console.log(itvLayers);
        return new Legend({
            view: this.viewLegend,
            container: "legend-list",
            layerInfos: [{
                    layer: itvLayers[2]
                }, {
                    layer: itvLayers[1]
                }, {
                    layer: itvLayers[0]
                }
            ]
        });
    };
    MenuLegendItvComponent.prototype.ngOnInit = function () {
        this.legend = this.initLegend();
        //console.log(this.legend);
        //console.log(this.filterItvLayers());
    };
    return MenuLegendItvComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MenuLegendItvComponent.prototype, "viewLegend", void 0);
MenuLegendItvComponent = __decorate([
    core_1.Component({
        selector: 'menu-legend-itv',
        template: "\n      <div>\n        <p>Sutartiniai \u017Eenklai:</p>\n        <a href=\"#legend\" class=\"button close animate\" title=\"U\u017Edaryti\">\u2715</a>\n        <div id=\"legend-list\" class=\"inner\">\n          <div class=\"layer-group one-service\">\n            <p>Investicini\u0173 projekt\u0173 b\u016Bsena</p>\n          </div>\n          </div>\n      </div>\n    "
    }),
    __metadata("design:paramtypes", [map_service_1.MapService])
], MenuLegendItvComponent);
exports.MenuLegendItvComponent = MenuLegendItvComponent;
//# sourceMappingURL=menu-legend-itv.component.js.map