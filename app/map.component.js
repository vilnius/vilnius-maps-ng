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
var map_service_1 = require("./map.service");
var projects_list_service_1 = require("./projects-list/projects-list.service");
var search_service_1 = require("./search/search.service");
var options_1 = require("./options");
var projects_list_component_1 = require("./projects-list/projects-list.component");
var watchUtils = require("esri/core/watchUtils");
var feature_query_service_1 = require("./query/feature-query.service");
var identify_service_1 = require("./services/identify/identify.service");
var MapComponent = (function () {
    function MapComponent(_mapService, elementRef, projectsService, search, featureService, identify) {
        this._mapService = _mapService;
        this.elementRef = elementRef;
        this.projectsService = projectsService;
        this.search = search;
        this.featureService = featureService;
        this.identify = identify;
        this.itvFeatureUrl = options_1.MapOptions.themes.itvTheme.layers.uniqueProjects;
        this.sqlString = "";
        this.autocompleteValue = "";
    }
    MapComponent.prototype.getSqlString = function () {
        return this.sqlString;
    };
    MapComponent.prototype.onFilter = function (items) {
        //first item  of items array (items[0]) is filteredList, second input value
        this.autocompleteValue = this.projectsService.filterAutoComplete(items[1]);
        //console.log(this.fullListChanged);
        //console.log(this.autocompleteValue);
        //getprojects when writing in autocomplet box as well
        this.getProjects(options_1.MapOptions.themes.itvTheme.layers.uniqueProjects, this.view.extent, this.sqlString);
    };
    MapComponent.prototype.getFullListChanged = function () {
        return this.fullListChanged;
    };
    MapComponent.prototype.getProjects = function (itvFeatureUrl, extent, sqlStr) {
        var _this = this;
        //execute queryTask on projects with extent
        this.projectsService.runProjectsQueryExtent(itvFeatureUrl, extent, sqlStr).then(function () {
            _this.projectsListArr = _this.projectsService.getProjects();
            _this.projectsListArrToComponent = _this.projectsService.getProjects();
        });
        //execute queryTask on projects without extent
        var inputValue = this.autocompleteValue;
        this.projectsService.runProjectsQuery(itvFeatureUrl, sqlStr, inputValue).then(function () {
            _this.fullListChanged = _this.projectsService.getAllProjects();
        });
    };
    MapComponent.prototype.getFilteredprojects = function (view, sqlStr) {
        var itvFeatureUrl = this.itvFeatureUrl;
        this.getProjects(itvFeatureUrl, view.extent, sqlStr);
    };
    MapComponent.prototype.initView = function (view) {
        var _this = this;
        var itvFeatureUrl = this.itvFeatureUrl;
        var identify = this.identify.identify(options_1.MapOptions.themes.itvTheme.layers.identifyLayer);
        var identifyParams = this.identify.identifyParams();
        //get projects when interacting with the view
        watchUtils.whenTrue(view, "stationary", function (b) {
            var sqlStr = _this.getSqlString();
            // Get the new extent of the view only when view is stationary.
            if (view.extent) {
                _this.getProjects(itvFeatureUrl, view.extent, sqlStr);
            }
        });
        //console.log("VIEW", view.on)
        view.on("pointer-move", function (event) {
            //console.log("MOUSE event", event.native)
        });
        view.on("click", function (event) {
            //find layer and remove it, max 4 layers: polygon, polyline, point, and additional point if scale is set from point to point in mxd
            _this._mapService.removeSelectionLayers(_this.map);
            //TODO close any popup if opened,store current view in service
            //this.view.popup.close()
            //run hitTest check graphics in the view
            _this.hitTestFeaturePopup(view, event);
            //init popup on click event widh identify service
            //this.identify.showItvPopupOnCLick(view, event, identify, identifyParams);
        }, function (error) { console.error(error); });
    };
    //activate word or map list item directly from map
    MapComponent.prototype.activateList = function (id, listName) {
        if (listName === "word") {
            this.wordListActive = id;
            //deactivate mapListActive
            this.mapListActive = null;
        }
        else {
            this.mapListActive = id;
            //deactivate wordListActive
            this.wordListActive = null;
        }
    };
    MapComponent.prototype.hitTestFeaturePopup = function (view, event) {
        var _this = this;
        // the hitTest() checks to see if any graphics in the view
        // intersect the given screen x, y coordinates
        var screenPoint = {
            x: event.x,
            y: event.y
        };
        view.hitTest(screenPoint)
            .then(function (features) {
            //activate list from map element
            console.log(_this.projectsListComponent.getListName());
            console.log(features.results["0"].graphic.attributes.UNIKALUS_NR);
            var currentFilterName = _this.projectsListComponent.getListName();
            _this.activateList(features.results["0"].graphic.attributes.UNIKALUS_NR, currentFilterName);
            //start selection of graphics
            _this._mapService.selectionResultsToGraphic(_this.map, features.results["0"].graphic, features.results["0"].graphic.layer.maxScale, features.results["0"].graphic.layer.minScale, features.layer, 0);
            //find feature layer and asign popup template to feature
            _this.map.findLayerById(features.results["0"].graphic.layer.id).popupTemplate = {
                title: _this.projectsService.getPopUpTitle(features.results["0"].graphic.attributes),
                content: _this.projectsService.getPopUpContent(features.results["0"].graphic.attributes)
            };
        });
    };
    MapComponent.prototype.addFeaturesToMap = function () {
        var _this = this;
        //count feature layers and add to map
        this._mapService.countRestlayers("https://zemelapiai.vplanas.lt/arcgis/rest/services/TESTAVIMAI/ITV_test_masteliavimas_no_goups_p/MapServer?f=pjson").subscribe(function (json) {
            var layersCount = json.layers.length;
            //creat layers arr
            var featureLayerArr = _this._mapService.createFeatureLayers(layersCount, options_1.MapOptions.themes.itvTheme.layers.mapLayer);
            _this.featureLayers = featureLayerArr;
            //add layers
            _this.map.addMany(featureLayerArr);
            _this.view.whenLayerView(featureLayerArr[0]).then(function (layerView) {
                //console.log("layerView:", layerView);
            });
        });
    };
    MapComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log("LOADING");
        //get full list on init
        this.projectsService.getAllProjectsQueryData(options_1.MapOptions.themes.itvTheme.layers.uniqueProjects).then(function (allLayers) {
            //console.log("150 ", allLayers)
            _this.fullList = allLayers;
        });
        // create the map
        this.map = this._mapService.initMap(options_1.MapOptions.mapOptions);
        //create view
        this.view = this._mapService.viewMap(this.map);
        //add  basemap layer
        this.map.add(this._mapService.initTiledLayer(options_1.MapOptions.mapOptions.staticServices.basemapUrl));
        //console.log(this.map)
        //add additional layer as base
        this.map.add(this._mapService.initDynamicLayer("https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/ITV_teritorijos/MapServer", 0.2));
        //count feature layers, init and add feature layers to map
        this.addFeaturesToMap();
        this.view.then(function (view) {
            //do not initVIew on every new subscribe event
            //subscribe expression str change, when user is filtering projects-theme
            _this.subscription = _this.featureService.expressionItem.subscribe(function (sqlStr) {
                //console.log("SUBSCRIPTION: ", sqlStr);
                _this.sqlString = sqlStr;
                //get properties on filtering event passing a sql string
                _this.getFilteredprojects(view, sqlStr);
            });
            //add default search widget
            view.ui.add(_this.search.defaultSearchWidget(view), {
                position: "top-left",
                index: 2
            });
            //init view and get projects on vie stationary property changes
            _this.initView(view);
        });
    };
    MapComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    return MapComponent;
}());
__decorate([
    core_1.ViewChild(projects_list_component_1.ProjectsListComponent),
    __metadata("design:type", projects_list_component_1.ProjectsListComponent)
], MapComponent.prototype, "projectsListComponent", void 0);
MapComponent = __decorate([
    core_1.Component({
        selector: 'esri-map',
        template: "\n  <div class=\"container-fluid\">\n    <div class=\"row\">\n      <div class=\"col-xs-12 col-md-8 map-col\">\n        <div id=\"map\">\n          <div id=\"building-help\" class=\"animate\">\n      \t\t\t<a href=\"#help-gallery\">\n      \t\t\t\t<p title=\"Valdymo instrukcija\">i</p>\n      \t\t\t</a>\n      \t\t</div>\n          <menu-map  *ngIf=\"projectsListArr\" [view]=\"view\"></menu-map>\n        </div>\n      </div>\n      <div class=\"col-xs-6 col-md-4\" *ngIf=\"projectsListArr\">\n        <projects-list [featureLayers]=\"featureLayers\" [view]=\"view\" [map]=\"map\" [projectsList]=\"projectsListArrToComponent\" [projectsListOriginal]=\"projectsListArr\" [fullList]=\"fullList\" [fullListChanged]=\"fullListChanged\" [mapListActive]=mapListActive [wordListActive]=wordListActive (onFilter)=\"onFilter($event)\" [highlight]=\"autocompleteValue\"></projects-list>\n      </div>\n    </div>\n  </div>\n  "
    }),
    __metadata("design:paramtypes", [map_service_1.MapService, core_1.ElementRef, projects_list_service_1.ProjectsListService, search_service_1.SearchService, feature_query_service_1.FeatureQueryService, identify_service_1.IdentifyService])
], MapComponent);
exports.MapComponent = MapComponent;
//# sourceMappingURL=map.component.js.map