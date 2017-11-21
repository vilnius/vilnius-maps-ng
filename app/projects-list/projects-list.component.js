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
var feature_query_service_1 = require("../query/feature-query.service");
var projects_filter_service_1 = require("./projects-filter.service");
var projects_list_service_1 = require("./projects-list.service");
var options_1 = require("../options");
var Point = require("esri/geometry/Point");
var ProjectsListComponent = (function () {
    function ProjectsListComponent(myElement, _mapService, filterThemes, projectsFilter, projectsListService) {
        this._mapService = _mapService;
        this.filterThemes = filterThemes;
        this.projectsFilter = projectsFilter;
        this.projectsListService = projectsListService;
        this.onFilter = new core_1.EventEmitter();
        this.query = '';
        this.filteredList = [];
        //activated filters number badge property
        this.activatedFiltersNumber = 0;
        //radio buttons data binding for filtering by map or by word
        //using for direct viewing on map with hitTest method as well
        this.mainFilterCheck = 'word';
        this.elementRef = myElement;
        this.selectedIdx = -1;
    }
    ;
    //activate word or map list item
    ProjectsListComponent.prototype.activateList = function (e, listName) {
        if (listName === "word") {
            this.wordListActive = e.target.id;
            //deactivate mapListActive
            this.mapListActive = null;
        }
        else {
            this.mapListActive = e.target.id;
            //deactivate wordListActive
            this.wordListActive = null;
        }
    };
    //getactivatedListName
    ProjectsListComponent.prototype.getListName = function () {
        return this.mainFilterCheck;
    };
    //identify list item
    ProjectsListComponent.prototype.identifyListItem = function (e, project) {
        e.stopPropagation();
        //close advanced filters container if opened
        this.buttonActive ? this.buttonActive = false : this.buttonActive;
        //start idenfify, pass project
        this.identifyAttributes(project);
    };
    ProjectsListComponent.prototype.removeSelectionLayers = function () {
        //find layer and remove it, max 4 layers: polygon, polyline, point, and additional point if scale is set from point to point in mxd
        this._mapService.removeSelectionLayers(this.map);
    };
    //list item identify
    ProjectsListComponent.prototype.identifyAttributes = function (project) {
        var _this = this;
        var query = this.projectsListService.Query();
        var number = 0;
        //remve any selection layers
        this.removeSelectionLayers();
        //TODO remove old graphic if exists
        this.view.graphics.items = [];
        query.where = "UNIKALUS_NR=" + project.attributes.UNIKALUS_NR;
        query.outFields = ["*"];
        query.returnGeometry = true;
        //get point coordinates from points layer
        this.featureLayers.map(function (layer) { return layer.queryFeatures(query).then(function (results) {
            var pointXY;
            //execute query to get selection geometry only after point coordinates has been asigned to let pointXY, and only on first point element (number = 0)
            if ((results.geometryType === "point")) {
                pointXY = _this.getPointXY(results);
                //this.view.popup =  "undefined";
                //clear popup
                _this.view.popup.clear();
                _this.view.popup.visible = false;
                //change popup position
                _this.view.popup.dockEnabled = true,
                    _this.view.popup.position = 'bottom-center',
                    //console.log( results.features[0]);
                    //console.log(results.features[0].geometry.type);
                    //create selected projects graphic layers
                    _this.initPopup(results, pointXY);
            }
            _this.queryResultsToGraphic(_this.map, results, layer, number);
            // + 1 after queryResultsToGraphic()
            number += 1;
        }, function (err) { return console.log(err); }); });
    };
    ProjectsListComponent.prototype.getPointXY = function (results) {
        //get only point coordinates
        var pointX, pointY;
        pointX = results.features[0].geometry.x;
        pointY = results.features[0].geometry.y;
        //return x and y in array
        return [pointX, pointY];
    };
    //selection results to graphic by creating new graphic layer
    ProjectsListComponent.prototype.queryResultsToGraphic = function (map, results, layer, number) {
        this._mapService.selectionResultsToGraphic(map, results.features[0], results.features[0].layer.maxScale, results.features[0].layer.minScale, layer, number);
    };
    //init Popup only on point for all geomtry type based on scale
    ProjectsListComponent.prototype.initPopup = function (results, pointXY) {
        var pt = new Point({
            x: pointXY[0],
            y: pointXY[1],
            spatialReference: 3346
        });
        this.openPopUp(results, pt);
    };
    ProjectsListComponent.prototype.openPopUp = function (results, point) {
        this.view.popup.open({
            location: point,
            title: results.features[0].attributes.Pavadinimas,
            content: this.projectsListService.getPopUpContent(results.features[0].attributes)
        });
        this.view.goTo({
            target: point
        }, options_1.MapOptions.animation.options);
    };
    //get radio button value on selection
    ProjectsListComponent.prototype.change = function (e) {
        this.mainFilterCheck = e.target.value;
    };
    ProjectsListComponent.prototype.getList = function () {
        //console.log("FEATURES: ", this.projectsListOriginal)
        return this.fullList;
    };
    ProjectsListComponent.prototype.filter = function (event) {
        //console.log("EVENTAS: ", event.code)
        if (this.query !== "") {
            // this.filteredList = this.getList().filter(function (el) {
            //     return el.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
            // }.bind(this));
            this.filteredList = this.getList().filter(function (project) {
                return project.attributes.Pavadinimas.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
            }.bind(this));
            //console.log(event.target.value)
            //console.log("SARASAS: ", this.filteredList)
            //emit filter list and input value for additional query task if any additional filtering occurs
            this.onFilter.emit([this.filteredList, event.target.value]);
            if (event.code == "ArrowDown" && this.selectedIdx < this.filteredList.length) {
                this.selectedIdx++;
            }
            else if (event.code == "ArrowUp" && this.selectedIdx > 0) {
                this.selectedIdx--;
            }
        }
        else {
            this.filteredList = [];
            //emit filter list and input value for additional query task if any additional filtering occurs
            //console.log("SARASAS: ", this.filteredList)
            this.onFilter.emit([this.filteredList, event.target.value]);
        }
    };
    ProjectsListComponent.prototype.select = function (item) {
        //console.log(item);
        this.query = item;
        this.filteredList = [];
        this.selectedIdx = -1;
        //this.onFilter.emit(item);
    };
    ProjectsListComponent.prototype.handleBlur = function () {
        if (this.selectedIdx > -1) {
            this.query = this.filteredList[this.selectedIdx];
        }
        this.filteredList = [];
        this.selectedIdx = -1;
    };
    ProjectsListComponent.prototype.handleClick = function (event) {
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
    //theme filter
    ProjectsListComponent.prototype.filterFeatures = function (theme) {
        this.filterThemes.filterFeatures(theme);
        this.activeTheme = this.filterThemes.getFilterStatusTheme();
        //console.log(this.filterThemes.getFilterStatusTheme());
        //count total activated filter number bind property to badge
        this.countActivatedFilter();
    };
    //year filtrer
    ProjectsListComponent.prototype.filterYear = function (year) {
        this.filterThemes.yearFilterQuery(year);
        this.activeYear = this.filterThemes.getFilterStatusYear();
        //count total activated filter number bind property to badge
        this.countActivatedFilter();
    };
    //count total activated filter number bind property to badge
    ProjectsListComponent.prototype.countActivatedFilter = function () {
        //check if native Objects.values exists
        Object.values = Object.values || (function (object) { return Object.keys(object).map(function (key) { return object[key]; }); });
        this.activatedFiltersNumber = Object.values(this.activeYear).reduce(function (acc, cur, i) { !cur ? acc += 1 : acc; return acc; }, 0) + Object.values(this.activeTheme).reduce(function (acc, cur, i) { !cur ? acc += 1 : acc; return acc; }, 0);
    };
    ProjectsListComponent.prototype.ngOnInit = function () {
        console.log("LOADING 2");
        //get full list binding and then proceed
        var allFeatureList = this.getList();
        //set projetcs unique final years for filtering
        //this.projectsFinalYears = this.projectsFilter.getUniqueAttributeSubStr(this.getList(), "PABAIGA", 4);
        this.projectsFinalYears = this.projectsFilter.getUniqueAttributeSubStr(allFeatureList, "Igyvend_IKI", 4);
        //console.log(  this.projectsFinalYears);
        //set projects unique themes for filtering
        //this.projectsThemes = this.projectsFilter.getUniqueAttribute(this.getList(), "TEMA");
        //filter by TemaID
        this.projectsThemes = this.projectsFilter.getUniqueAttribute(allFeatureList, "TemaID");
        //console.log("143", this.projectsThemes );
        //send years and themes array to Map object in feature query service
        this.filterThemes.sendToMap(this.projectsFinalYears, this.projectsThemes);
        //set active class on init
        this.activeTheme = this.filterThemes.getFilterStatusTheme();
        this.activeYear = this.filterThemes.getFilterStatusYear();
    };
    return ProjectsListComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], ProjectsListComponent.prototype, "featureLayers", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], ProjectsListComponent.prototype, "map", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], ProjectsListComponent.prototype, "view", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], ProjectsListComponent.prototype, "projectsList", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], ProjectsListComponent.prototype, "projectsListOriginal", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], ProjectsListComponent.prototype, "fullList", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], ProjectsListComponent.prototype, "fullListChanged", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], ProjectsListComponent.prototype, "highlight", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], ProjectsListComponent.prototype, "mapListActive", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], ProjectsListComponent.prototype, "wordListActive", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", Object)
], ProjectsListComponent.prototype, "onFilter", void 0);
ProjectsListComponent = __decorate([
    core_1.Component({
        selector: 'projects-list',
        host: {
            '(document:click)': 'handleClick($event)',
        },
        providers: [projects_filter_service_1.ProjectsFilterService],
        templateUrl: './app/projects-list/projects-list.component.html'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef, map_service_1.MapService, feature_query_service_1.FeatureQueryService, projects_filter_service_1.ProjectsFilterService, projects_list_service_1.ProjectsListService])
], ProjectsListComponent);
exports.ProjectsListComponent = ProjectsListComponent;
//# sourceMappingURL=projects-list.component.js.map