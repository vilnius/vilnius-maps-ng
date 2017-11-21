"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var ProjectsFilterService = (function () {
    function ProjectsFilterService() {
    }
    //get unique attributes for future filtering
    ProjectsFilterService.prototype.getUniqueAttribute = function (projects, name) {
        return this.getThemesListArray(projects, name).filter(function (value, i, array) { return array.indexOf(value) === i; });
    };
    //get themes array
    ProjectsFilterService.prototype.getThemesListArray = function (projects, name) {
        return projects.map(function (value) { return value.attributes[name]; }).sort(function (a, b) { return parseInt(a) - parseInt(b); });
    };
    //get unique Year string array attributes with substring
    ProjectsFilterService.prototype.getUniqueAttributeSubStr = function (projects, name, index) {
        var yearsArr = this.getUniqueAttribute(projects, name).map(
        //do not add empty string "", which can appear if year was not defined by adding if statement and returning undefined values
        function (a) { if ((a !== "") && a)
            return a.substring(0, index); }).
            sort(function (a, b) { return parseInt(a) - parseInt(b); }).
            filter(function (a, i, array) { return array.indexOf(a) == i; }).
            filter(function (a) { return a; }); // finaly filter undefined values
        return yearsArr;
    };
    return ProjectsFilterService;
}());
ProjectsFilterService = __decorate([
    core_1.Injectable()
], ProjectsFilterService);
exports.ProjectsFilterService = ProjectsFilterService;
//# sourceMappingURL=projects-filter.service.js.map