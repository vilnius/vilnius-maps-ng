"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var IdentifyTask = require("esri/tasks/IdentifyTask");
var IdentifyParameters = require("esri/tasks/support/IdentifyParameters");
var IdentifyService = (function () {
    function IdentifyService() {
    }
    //identify for mapservice only
    IdentifyService.prototype.identify = function (layer) {
        return new IdentifyTask(layer);
    };
    IdentifyService.prototype.identifyParams = function () {
        return new IdentifyParameters();
    };
    IdentifyService.prototype.showItvPopupOnCLick = function (view, event, identify, identifyParams) {
        identifyParams.geometry = event.mapPoint;
        identifyParams.mapExtent = view.extent;
        identifyParams.tolerance = 5;
        identifyParams.width = view.width;
        identifyParams.height = view.height;
        identifyParams.layerOption = 'top';
        identify.execute(identifyParams).then(function (response) {
            var results = response.results;
            return results.map(function (result) {
                var feature = result.feature;
                feature.popupTemplate = {
                    title: '{Pavadinimas}',
                    content: "\n                  <p><span class=\"n{TemaId}-theme projects-theme\"></span> {Tema} <br /><span>Tema</span></p>\n                  <p>{Busena}<br /><span>Projekto b\u016Bsena</span</p>\n                  <p>{Projekto_aprasymas} <br /><span>Apra\u0161ymas</span></p>\n                  <p>{Igyvend_NUO} - {Igyvend_IKI} m.<br /><span>\u012Egyvendinimo trukm\u0117</span></p>\n                  <p><a href=\"{Nuoroda_i_projekta}\" target=\"_blank\">{Nuoroda_i_projekta}</a> <br /><span>Projekto nuoroda</span></p>\n                  <p>{Veiksmo_nr_ITVP } <br /><span>Programos veiksmas </span></p>\n                  <p>{Vykdytojas}<br /><span>Vykdytojas</span></p>\n                  <p><a href=\"{Kontaktai}\">{Kontaktai}</a> <br /><span>Kontaktai</span></p>\n                  <div class=\"finance-list\">\n                    <div>\n                    <p>{Projekto_verte} Eur<br /><span>Projekto vert\u0117</span></p>\n                    </div>\n                    <p>{ES_investicijos} Eur <br /><span>Europos S\u0105jungos investicijos</span></p>\n                    <p>{Savivaldybes_biudzeto_lesos} Eur<br /><span>Savivaldyb\u0117s biud\u017Eeto l\u0117\u0161os</span></p>\n                    <p>{Valstybes_biudzeto_lesos} Eur<br /><span>Valstyb\u0117s biud\u017Eeto l\u0117\u0161os</span></p>\n                    <p>{Kitos_viesosios_lesos} Eur<br /><span> Kitos vie\u0161osios l\u0117\u0161os</span></p>\n                    <p>{Privacios_lesos} Eur<br /><span> Priva\u010Dios l\u0117\u0161os</span></p>\n                  </div>\n                "
                };
                return feature;
            });
        }).then(function (response) {
            if (response.length > 0) {
                view.popup.open({
                    features: response,
                    location: event.mapPoint
                });
            }
        }, function (error) { console.error(error); });
    };
    return IdentifyService;
}());
IdentifyService = __decorate([
    core_1.Injectable()
], IdentifyService);
exports.IdentifyService = IdentifyService;
//# sourceMappingURL=identify.service.js.map