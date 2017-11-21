"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var QueryTask = require("esri/tasks/QueryTask");
var Query = require("esri/tasks/support/Query");
var ProjectsListService = (function () {
    function ProjectsListService() {
        this.projectsByExtent = [];
        this.projectsByWord = [];
    }
    ProjectsListService.prototype.getProjects = function () {
        return this.projectsByExtent;
    };
    ProjectsListService.prototype.getAllProjects = function () {
        return this.projectsByWord;
    };
    ProjectsListService.prototype.filterAutoComplete = function (projects) {
        //return projects for autocomplete filters if we want to filter by extent list
        return this.projectsByWord = projects;
        //return projects for autocomplete filters if we want to filter full list
    };
    ProjectsListService.prototype.runProjectsQuery = function (urlStr, queryExpression, inputValue) {
        var _this = this;
        var query = new Query();
        //return geometry in order to get popup and graphic on list click
        query.returnGeometry = true;
        //if input value is empty asing to emtpy string, else make additiniol sql query
        var valueAutocomplete = inputValue.length > 0 ? "(Pavadinimas LIKE '%" + inputValue + "%')" : "";
        query.outFields = ["*"];
        //check if query expression was set by filters
        typeof (queryExpression) !== "undefined" ? query.where = "(" + queryExpression + ")" : query.where = "";
        var queryTask = this.QueryTask(urlStr);
        var task;
        //console.log(query)
        if ((queryExpression.length === 0) && (valueAutocomplete.length === 0)) {
            query.where = "1=1";
        }
        else if ((queryExpression.length === 0) && (valueAutocomplete.length > 0)) {
            query.where = valueAutocomplete;
        }
        else if ((queryExpression.length > 0) && (valueAutocomplete.length > 0)) {
            query.where += " AND " + valueAutocomplete;
        }
        //console.log(inputValue);
        //console.log(valueAutocomplete.length);
        //console.log(query.where);
        return queryTask.execute(query).then(function (result) {
            task = result.features;
            _this.projectsByWord = task;
            //console.log(task);
            return task;
        }, function (error) { console.error(error); });
    };
    ProjectsListService.prototype.runProjectsQueryExtent = function (urlStr, extent, queryExpression) {
        var _this = this;
        var query = this.Query(extent);
        //return geometry in order to get popup and graphic on list click
        query.returnGeometry = true;
        query.outFields = ["*"];
        //check if query expression was set by filters
        typeof (queryExpression) !== "undefined" ? query.where = queryExpression : query.where = "";
        var queryTask = this.QueryTask(urlStr);
        var task;
        return queryTask.execute(query).then(function (result) {
            task = result.features;
            _this.projectsByExtent = task;
            return task;
        }, function (error) { console.error(error); });
    };
    //get full list of existing projects
    ProjectsListService.prototype.getAllProjectsQueryData = function (urlStr) {
        var query = new Query();
        //get all data
        query.where = "1=1";
        query.outFields = ["*"];
        var queryTask = this.QueryTask(urlStr);
        return queryTask.execute(query).then(function (result) {
            return result.features;
        }, function (error) { console.error(error); });
    };
    //get popup content
    ProjectsListService.prototype.getPopUpTitle = function (attributes) {
        return attributes.Pavadinimas;
    };
    //get popup content
    ProjectsListService.prototype.getPopUpContent = function (attributes) {
        var TemaID = attributes.TemaID, Tema = attributes.Tema, Busena = '<p><span>Projekto būsena</span><br /><span class="type-' + attributes.Busena[0] + ' projects-theme"></span>' + attributes.Busena + '</p>', Projekto_aprasymas = attributes.Projekto_aprasymas ? "<p><span>Aprašymas</span><br />" + attributes.Projekto_aprasymas + "</p>" : "-", Igyvend_NUO = attributes.Igyvend_NUO ? attributes.Igyvend_NUO : "-", Igyvend_IKI = attributes.Igyvend_IKI ? '– ' + attributes.Igyvend_IKI : '', Projekto_verte = attributes.Projekto_verte ? '<p><span>Projekto vertė</span><br />' + attributes.Projekto_verte + ' Eur</p>' : '', ES_investicijos = attributes.ES_investicijos ? '<p><span>Europos Sąjungos investicijos</span><br />' + attributes.ES_investicijos + ' Eur</p>' : '', Savivaldybes_biudzeto_lesos = attributes.Savivaldybes_biudzeto_lesos ? '<p><span>Savivaldybės biudžeto lėšos</span><br />' + attributes.Savivaldybes_biudzeto_lesos + ' Eur</p>' : "-", Valstybes_biudzeto_lesos = attributes.Valstybes_biudzeto_lesos ? '<p><span>Valstybės biudžeto lėšos</span><br />' + attributes.Valstybes_biudzeto_lesos + ' Eur</p>' : '', Kitos_viesosios_lesos = attributes.Kitos_viesosios_lesos ? '<p><span> Kitos viešosios lėšos</span><br />' + attributes.Kitos_viesosios_lesos + ' Eur</p>' : '', Privacios_lesos = attributes.Privacios_lesos ? '<p><span> Privačios lėšos</span><br />' + attributes.Privacios_lesos + ' Eur</p>' : '', 
        //TODO some attr has http:// prefix, filter it
        Nuoroda_i_projekta = attributes.Nuoroda_i_projekta ? '<p><span>Projekto nuoroda</span><br /><a href="http://' + attributes.Nuoroda_i_projekta + '" target="_blank">' + attributes.Nuoroda_i_projekta + '</a></p>' : '', Veiksmo_nr_ITVP = attributes.Veiksmo_nr_ITVP ? '<p><span>Programos veiksmas </span><br />' + attributes.Veiksmo_nr_ITVP + '</p>' : '', Vykdytojas = attributes.Vykdytojas ? '<p><span>Vykdytojas</span><br />' + attributes.Vykdytojas + '</p>' : '', Kontaktai = attributes.Kontaktai ? '<p><span>Kontaktai</span><br /><a href="' + attributes.Kontaktai + '">' + attributes.Kontaktai + '</a></p>' : '';
        // return string interpolation
        return "<div class=\"esri-popup-renderer\">\n              <div class=\"esri-popup-renderer__text esri-popup-renderer__content-element\">\n                <p><span>Tema</span><br /><span class=\"n" + TemaID + "-theme projects-theme\"></span> " + Tema + " </p>\n                " + Busena + "\n                " + Projekto_aprasymas + "\n                <p><span>\u012Egyvendinimo trukm\u0117</span><br />" + Igyvend_NUO + " " + Igyvend_IKI + " m.</p>\n                " + Nuoroda_i_projekta + "\n                " + Veiksmo_nr_ITVP + "\n                " + Vykdytojas + "\n                " + Kontaktai + "\n                <div class=\"finance-list\">\n                  <div>\n                  " + Projekto_verte + "\n                  </div>\n                  " + ES_investicijos + "\n                  " + Savivaldybes_biudzeto_lesos + "\n                  " + Valstybes_biudzeto_lesos + "\n                  " + Kitos_viesosios_lesos + "\n                  " + Privacios_lesos + "\n                </div>\n              </div>\n            </div>";
    };
    ProjectsListService.prototype.Query = function (extent) {
        if (extent === void 0) { extent = false; }
        if (extent) {
            return new Query({ geometry: extent });
        }
        else {
            return new Query();
        }
    };
    ProjectsListService.prototype.QueryTask = function (urlStr) {
        return new QueryTask({
            url: urlStr
        });
    };
    return ProjectsListService;
}());
ProjectsListService = __decorate([
    core_1.Injectable()
], ProjectsListService);
exports.ProjectsListService = ProjectsListService;
//# sourceMappingURL=projects-list.service.js.map