"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/http");
var map_component_1 = require("./map.component");
var app_component_1 = require("./app.component");
var menu_component_1 = require("./menu/menu.component");
var map_service_1 = require("./map.service");
var projects_list_service_1 = require("./projects-list/projects-list.service");
var projects_list_component_1 = require("./projects-list/projects-list.component");
var projects_filter_service_1 = require("./projects-list/projects-filter.service");
var autocomplete_component_1 = require("./autocomplete/autocomplete.component");
var search_service_1 = require("./search/search.service");
var identify_service_1 = require("./services/identify/identify.service");
var feature_query_service_1 = require("./query/feature-query.service");
var text_highlight_pipe_1 = require("./pipes/text-highlight.pipe");
var menu_themes_component_1 = require("./menu/menu-themes.component");
var menu_tools_component_1 = require("./menu/menu-tools.component");
var menu_layers_itv_component_1 = require("./menu/menu-layers-itv.component");
var menu_legend_itv_component_1 = require("./menu/menu-legend-itv.component");
var draggable_directive_1 = require("ng2draggable/draggable.directive");
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        imports: [
            platform_browser_1.BrowserModule,
            forms_1.FormsModule,
            http_1.HttpModule,
            http_1.JsonpModule
        ],
        declarations: [
            app_component_1.AppComponent,
            map_component_1.MapComponent,
            menu_component_1.MenuComponent,
            projects_list_component_1.ProjectsListComponent,
            autocomplete_component_1.AutoCompleteComponent,
            menu_themes_component_1.MenuThemesComponent,
            menu_tools_component_1.MenuToolsComponent,
            menu_layers_itv_component_1.MenuLayersItvComponent,
            menu_legend_itv_component_1.MenuLegendItvComponent,
            text_highlight_pipe_1.TextHighlightPipe,
            //3rd party declarations
            draggable_directive_1.Draggable
        ],
        providers: [
            map_service_1.MapService,
            projects_list_service_1.ProjectsListService,
            projects_filter_service_1.ProjectsFilterService,
            search_service_1.SearchService,
            feature_query_service_1.FeatureQueryService,
            identify_service_1.IdentifyService
        ],
        bootstrap: [app_component_1.AppComponent]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map