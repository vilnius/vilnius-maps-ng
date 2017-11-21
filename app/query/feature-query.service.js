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
var projects_filter_service_1 = require("../projects-list/projects-filter.service");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var FeatureQueryService = (function () {
    function FeatureQueryService(_mapService, projectsFilterService) {
        this._mapService = _mapService;
        this.projectsFilterService = projectsFilterService;
        this.expressionSQL = {
            theme: [],
            year: []
        };
        this.expressionCommon = {
            theme: [],
            year: []
        };
        // Observable  source, start from empty ("") string
        this.expressionStObs = new BehaviorSubject_1.BehaviorSubject("");
        // Observable item stream
        this.expressionItem = this.expressionStObs.asObservable();
    }
    //create years Object from years for filtering  by year or
    //create themes Object from themes for filtering  by theme
    FeatureQueryService.prototype.sendToMap = function (years, themes) {
        //console.log("REDUCE: ", years.reduce((acc, cur, i) => {acc[cur] = true; return acc;}, {}) )
        this.deactivatedThemeFilters = themes.reduce(function (acc, cur, i) { acc[cur.toString()] = true; return acc; }, {});
        this.deactivatedYearFilters = years.reduce(function (acc, cur, i) { acc[cur] = true; return acc; }, {});
    };
    // service command
    FeatureQueryService.prototype.changeExpression = function (expression) {
        this.expressionStObs.next(expression);
    };
    // return current SQL expression string which is set by UI filters
    FeatureQueryService.prototype.getExpression = function () {
        return this.expressionToMapComponent;
    };
    //filter by theme
    FeatureQueryService.prototype.filterFeatures = function (theme) {
        //console.log("BENDRA UZKL" , this.expressionCommon);
        if (this.deactivatedThemeFilters[theme.toString()]) {
            var expression = void 0;
            var expressionFinal_1;
            //push theme to array
            this.expressionSQL.theme.push(theme);
            //filter by TemaID
            expression = this.getFilterQuery(this.expressionSQL.theme, "TemaID", "=");
            //change common expression
            this.expressionCommon.theme[0] = expression;
            expressionFinal_1 = this.runDefinitionExpression("theme", "year");
            //console.log(this.expressionSQL);
            //console.log(this.expressionCommon.theme);
            this._mapService.returnFeatureLayers().map(function (feature) {
                feature.definitionExpression = expressionFinal_1;
            });
            this.deactivatedThemeFilters[theme.toString()] = false;
        }
        else {
            //get indexof theme and remove it
            var index = this.expressionSQL.theme.indexOf(theme);
            var expression = void 0;
            var expressionFinal_2;
            if (index > -1) {
                this.expressionSQL.theme.splice(index, 1);
            }
            //filter by TemaID
            expression = this.getFilterQuery(this.expressionSQL.theme, "TemaID", "=");
            //change common expression
            this.expressionCommon.theme[0] = expression;
            expressionFinal_2 = this.runDefinitionExpression("theme", "year");
            //console.log(this.expressionSQL);
            //console.log(this.expressionCommon.theme);
            this._mapService.returnFeatureLayers().map(function (feature) {
                //console.log("THEME", this.expressionCommon.theme[0]);
                //console.log("YEAR LENGTH", this.expressionCommon.year.length );
                feature.definitionExpression = expressionFinal_2;
            });
            this.deactivatedThemeFilters[theme.toString()] = true;
        }
    };
    FeatureQueryService.prototype.getFilterStatusTheme = function () {
        return this.deactivatedThemeFilters;
    };
    FeatureQueryService.prototype.getFilterStatusYear = function () {
        return this.deactivatedYearFilters;
    };
    //run definition by specific expression depended on first and second filters
    //for example: first filter is themes and second filter is years
    FeatureQueryService.prototype.runDefinitionExpression = function (firstFilter, secondFilter) {
        //console.log("THEME", this.expressionCommon[firstFilter][0]);
        //console.log("YEAR LENGTH", this.expressionCommon[secondFilter].length );
        if (this.expressionCommon[secondFilter].length > 0) {
            //if string is empty, like ""
            if ((this.expressionCommon[firstFilter][0].length > 0) && (this.expressionCommon[secondFilter][0].length > 0)) {
                this.expressionToMapComponent = "(" + this.expressionCommon[firstFilter][0] + ") AND (" + this.expressionCommon[secondFilter][0] + ")";
                this.changeExpression("(" + this.expressionCommon[firstFilter][0] + ") AND (" + this.expressionCommon[secondFilter][0] + ")");
                return "(" + this.expressionCommon[firstFilter][0] + ") AND (" + this.expressionCommon[secondFilter][0] + ")";
            }
            else if (((this.expressionCommon[secondFilter][0].length > 0) && (this.expressionCommon[firstFilter][0].length === 0))) {
                this.expressionToMapComponent = this.expressionCommon[secondFilter][0];
                this.changeExpression(this.expressionCommon[secondFilter][0]);
                return this.expressionCommon[secondFilter][0];
            }
            else {
                //alert(2)
                this.expressionToMapComponent = this.expressionCommon[firstFilter][0];
                this.changeExpression(this.expressionCommon[firstFilter][0]);
                return this.expressionCommon[firstFilter][0];
            }
        }
        else {
            this.expressionToMapComponent = this.expressionCommon[firstFilter][0];
            this.changeExpression(this.expressionCommon[firstFilter][0]);
            return this.expressionCommon[firstFilter][0];
        }
    };
    FeatureQueryService.prototype.getFilterQuery = function (expressionArray, property, operator) {
        var queryStringClause = "";
        //console.log(expressionArray);
        for (var i = 0; i < expressionArray.length; i += 1) {
            if (expressionArray[i]) {
                if ((expressionArray.length - 1 - i) === 0) {
                    if (operator === "=") {
                        queryStringClause += property + operator + "'" + expressionArray[i] + "'";
                    }
                    else {
                        queryStringClause += property + operator + "'%" + expressionArray[i] + "%'";
                    }
                }
                else if ((expressionArray.length) === 0) {
                    queryStringClause += "";
                }
                else {
                    //if theme filter
                    if (operator === "=") {
                        queryStringClause += property + operator + "'" + expressionArray[i] + "' OR ";
                    }
                    else {
                        //else year filter
                        queryStringClause += property + operator + "'%" + expressionArray[i] + "%' OR ";
                    }
                }
            }
        }
        return queryStringClause;
    };
    //filter by year
    FeatureQueryService.prototype.yearFilterQuery = function (year) {
        //console.log("BENDRA UZKL", this.expressionSQL);
        //console.log("BENDRA UZKL", this.expressionCommon);
        if (this.deactivatedYearFilters[year]) {
            var expression = void 0;
            var expressionFinal_3;
            //push theme to array
            this.expressionSQL.year.push(year);
            expression = this.getFilterQuery(this.expressionSQL.year, "Igyvend_IKI", " LIKE ");
            //change common expression
            this.expressionCommon.year[0] = expression;
            expressionFinal_3 = this.runDefinitionExpression("year", "theme");
            this._mapService.returnFeatureLayers().map(function (feature) {
                feature.definitionExpression = expressionFinal_3;
            });
            this.deactivatedYearFilters[year] = false;
        }
        else {
            //get indexof theme and remove it
            var index = this.expressionSQL.year.indexOf(year);
            var expression = void 0;
            var expressionFinal_4;
            if (index > -1) {
                this.expressionSQL.year.splice(index, 1);
            }
            expression = this.getFilterQuery(this.expressionSQL.year, "Igyvend_IKI", " LIKE ");
            //change common expression
            this.expressionCommon.year[0] = expression;
            expressionFinal_4 = this.runDefinitionExpression("year", "theme");
            //console.log(this.expressionCommon.year);
            this._mapService.returnFeatureLayers().map(function (feature) {
                feature.definitionExpression = expressionFinal_4;
            });
            this.deactivatedYearFilters[year] = true;
        }
    };
    return FeatureQueryService;
}());
FeatureQueryService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [map_service_1.MapService, projects_filter_service_1.ProjectsFilterService])
], FeatureQueryService);
exports.FeatureQueryService = FeatureQueryService;
//# sourceMappingURL=feature-query.service.js.map