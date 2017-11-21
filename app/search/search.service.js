"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var Search = require("esri/widgets/Search");
var Locator = require("esri/tasks/Locator");
var SearchService = (function () {
    function SearchService() {
    }
    SearchService.prototype.defaultSearchWidget = function (view) {
        return new Search({
            sources: [{
                    locator: new Locator("https://zemelapiai.vplanas.lt/arcgis/rest/services/Lokatoriai/PAIESKA_COMPOSITE/GeocodeServer"),
                    singleLineFieldName: "SingleLine",
                    outFields: ["*"],
                    enableSuggestions: true,
                    name: "Paieška",
                    enableHighlight: true,
                    enableLabel: false,
                    //distance: 20, //search distance
                    //enableButtonMode: true,
                    //expanded: true,
                    localSearchOptions: {
                        minScale: 300000,
                        distance: 50000
                    },
                    placeholder: "Paieška"
                }],
            view: view
        });
    };
    return SearchService;
}());
SearchService = __decorate([
    core_1.Injectable()
], SearchService);
exports.SearchService = SearchService;
//# sourceMappingURL=search.service.js.map