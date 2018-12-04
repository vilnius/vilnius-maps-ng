import { Injectable } from '@angular/core';

import { MapService } from '../map.service';
import { IdentifyService } from '../services/identify/identify.service';
import { PointAddRemoveService } from '../query/point-add-remove.service';
import { ProjectsListService } from '../projects-list/projects-list.service';

import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FeatureQueryService {
  //deactivated theme filter properties, created and updated dinamycally (on click)
  //example: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true};
  private deactivatedThemeFilters: any;
  //theme filter fiters properties, created and updated dinamycally
  private deactivatedYearFilters: any;

  private expressionSQL = {
    theme: [],
    year: []
  };
  private expressionCommon = {
    theme: [],
    year: []
  };
  //pass expression to map component for list filtering based on active filters
  private expressionToMapComponent: String;

  // Observable  source, start from empty ("") string
  private expressionStObs = new BehaviorSubject<any>("");
  // Observable item stream
  expressionItem = this.expressionStObs.asObservable();

  constructor(private _mapService: MapService, private identify: IdentifyService, private projectsService: ProjectsListService, private pointAddRemoveService: PointAddRemoveService) { }

  //create years Object from years for filtering  by year or
  //create themes Object from themes for filtering  by theme
  sendToMap(years: string[], themes: Number[]) {
    //console.log("REDUCE: ", years.reduce((acc, cur, i) => {acc[cur] = true; return acc;}, {}) )
    this.deactivatedThemeFilters = themes.reduce((acc, cur) => { acc[cur.toString()] = true; return acc; }, {});
    this.deactivatedYearFilters = years.reduce((acc, cur) => { acc[cur] = true; return acc; }, {});
  }

  // service command
  changeExpression(expression) {
    this.expressionStObs.next(expression);
  }

  // return current SQL expression string which is set by UI filters
  getExpression() {
    return this.expressionToMapComponent;
  }

  getExpressionSQL() {
    //console.log("expression", this.expressionSQL);
    return this.expressionSQL;
  }

  //check if result has filter properties
  checkResult(expressionSQL, result) {
    let gotResult: boolean = false;
    if ((expressionSQL.theme.length === 0) && (expressionSQL.year.length === 0)) {
      gotResult = true;
    } else if ((expressionSQL.theme.length > 0) && (expressionSQL.year.length > 0)) {
      let hasTheme: boolean = false;
      let hasYear: boolean = false;
      for (let theme of expressionSQL.theme) {
        if (theme == result.feature.attributes.TemaID) {
          hasTheme = true;
          break;
        }
      }
      for (let year of expressionSQL.year) {
        if (year === result.feature.attributes.Igyvend_IKI.slice(0, 4)) {
          hasYear = true;
          break;
        }
      }
      if (hasTheme && hasYear) {
        gotResult = true;
      }
    } else if ((expressionSQL.theme.length > 0) && (expressionSQL.year.length === 0)) {
      for (let theme of expressionSQL.theme) {
        if (theme == result.feature.attributes.TemaID) {
          gotResult = true;
          break;
        }
      }
    } else {
      for (let year of expressionSQL.year) {
        if (year === result.feature.attributes.Igyvend_IKI.slice(0, 4)) {
          gotResult = true;
          break;
        }
      }
    }
    return gotResult;
  }

  //filter by theme
  filterFeatures(theme: Number) {
    //console.log("BENDRA UZKL" , this.expressionCommon);
    if (this.deactivatedThemeFilters[theme.toString()]) {
      let expression;
      let expressionFinal: string;
      //push theme to array
      this.expressionSQL.theme.push(theme);
      //filter by TemaID
      expression = this.getFilterQuery(this.expressionSQL.theme, "TemaID", "=");

      //change common expression
      this.expressionCommon.theme[0] = expression;
      expressionFinal = this.runDefinitionExpression("theme", "year");
      //console.log(this.expressionCommon.theme);
      //console.log("returnFeatureLayers", this._mapService.returnFeatureLayers());
      this._mapService.returnFeatureLayers().map(feature => {
        feature.definitionExpression = expressionFinal;
      });
      this.deactivatedThemeFilters[theme.toString()] = false;
      //console.log(this._mapService.returnFeatureLayers());

      this.filterDynamicMaps(expressionFinal);
    } else {
      //get indexof theme and remove it
      let index = this.expressionSQL.theme.indexOf(theme);
      let expression;
      let expressionFinal: string;
      if (index > -1) {
        this.expressionSQL.theme.splice(index, 1);
      }
      //filter by TemaID
      expression = this.getFilterQuery(this.expressionSQL.theme, "TemaID", "=");
      //change common expression
      this.expressionCommon.theme[0] = expression;
      expressionFinal = this.runDefinitionExpression("theme", "year");
      //console.log(this.expressionSQL);
      //console.log(this.expressionCommon.theme);
      this._mapService.returnFeatureLayers().map(feature => {
        //console.log("THEME", this.expressionCommon.theme[0]);
        //console.log("YEAR LENGTH", this.expressionCommon.year.length );
        feature.definitionExpression = expressionFinal;
      });
      this.deactivatedThemeFilters[theme.toString()] = true;

      this.filterDynamicMaps(expressionFinal);
    }
  }

  //filter dynamic layer by definitionExpression and SQL query by theme and year
  filterDynamicMaps(expression: any) {
    let projectsLayer = this._mapService.getProjectsDynamicLayer();
    projectsLayer.sublayers.forEach(sublayer => {
      sublayer.definitionExpression = expression;
    });

  }

  getFilterStatusTheme() {
    return this.deactivatedThemeFilters;
  }
  getFilterStatusYear() {
    return this.deactivatedYearFilters;
  }

  //run definition by specific expression depended on first and second filters
  //for example: first filter is themes and second filter is years
  runDefinitionExpression(firstFilter: string, secondFilter: string) {
    //console.log("THEME", this.expressionCommon[firstFilter][0]);
    //console.log("YEAR LENGTH", this.expressionCommon[secondFilter].length );
    if (this.expressionCommon[secondFilter].length > 0) {
      //if string is empty, like ""
      if ((this.expressionCommon[firstFilter][0].length > 0) && (this.expressionCommon[secondFilter][0].length > 0)) {
        this.expressionToMapComponent = "(" + this.expressionCommon[firstFilter][0] + ") AND (" + this.expressionCommon[secondFilter][0] + ")";
        this.changeExpression("(" + this.expressionCommon[firstFilter][0] + ") AND (" + this.expressionCommon[secondFilter][0] + ")");
        return "(" + this.expressionCommon[firstFilter][0] + ") AND (" + this.expressionCommon[secondFilter][0] + ")";
      } else if (((this.expressionCommon[secondFilter][0].length > 0) && (this.expressionCommon[firstFilter][0].length === 0))) {
        this.expressionToMapComponent = this.expressionCommon[secondFilter][0];
        this.changeExpression(this.expressionCommon[secondFilter][0]);
        return this.expressionCommon[secondFilter][0];
      } else {
        //alert(2)
        this.expressionToMapComponent = this.expressionCommon[firstFilter][0];
        this.changeExpression(this.expressionCommon[firstFilter][0]);
        return this.expressionCommon[firstFilter][0];
      }
    } else {
      this.expressionToMapComponent = this.expressionCommon[firstFilter][0];
      this.changeExpression(this.expressionCommon[firstFilter][0]);
      return this.expressionCommon[firstFilter][0];
    }
  }

  getFilterQuery(expressionArray: Array<any>, property: String, operator: string) {
    let queryStringClause: String = "";
    //console.log(expressionArray);
    for (let i = 0; i < expressionArray.length; i += 1) {
      if (expressionArray[i]) {
        if ((expressionArray.length - 1 - i) === 0) {
          if (operator === "=") {
            queryStringClause += property + operator + "" + expressionArray[i] + "";
          } else {
            queryStringClause += property + operator + "'%" + expressionArray[i] + "%'";
          }
        } else if ((expressionArray.length) === 0) {
          queryStringClause += "";
        } else {
          //if theme filter
          if (operator === "=") {
            queryStringClause += property + operator + "" + expressionArray[i] + " OR ";
          } else {
            //else year filter
            queryStringClause += property + operator + "'%" + expressionArray[i] + "%' OR ";
          }
        }
      }
    }
    return queryStringClause;
  }

  // filter by year
  yearFilterQuery(year) {
    //console.log("BENDRA UZKL", this.expressionSQL);
    //console.log("BENDRA UZKL", this.expressionCommon);
    if (this.deactivatedYearFilters[year]) {
      let expression;
      let expressionFinal: string;
      //push theme to array
      this.expressionSQL.year.push(year);
      expression = this.getFilterQuery(this.expressionSQL.year, "Igyvend_IKI", " LIKE ");
      //change common expression
      this.expressionCommon.year[0] = expression;
      expressionFinal = this.runDefinitionExpression("year", "theme");
      this._mapService.returnFeatureLayers().map(feature => {
        feature.definitionExpression = expressionFinal;
      });
      this.deactivatedYearFilters[year] = false;

      this.filterDynamicMaps(expressionFinal);
    } else {
      //get indexof theme and remove it
      let index = this.expressionSQL.year.indexOf(year);
      let expression;
      let expressionFinal: string;
      if (index > -1) {
        this.expressionSQL.year.splice(index, 1);
      }
      expression = this.getFilterQuery(this.expressionSQL.year, "Igyvend_IKI", " LIKE ");
      //change common expression
      this.expressionCommon.year[0] = expression;
      expressionFinal = this.runDefinitionExpression("year", "theme");
      //console.log(this.expressionCommon.year);
      this._mapService.returnFeatureLayers().map(feature => {
        feature.definitionExpression = expressionFinal;
      });
      this.deactivatedYearFilters[year] = true;

      this.filterDynamicMaps(expressionFinal);
    }
  }

  // identify projects return deffered object with results, init popup and selection graphics
  identifyProjects(projectsDynamicLayer, identifyParams, map, view, uniqueListItemId = 0) {
    return this.identify.identify(projectsDynamicLayer.url).execute(identifyParams).then((response) => {
      //return only 1 result, TODO remove map method and logic, as we wil identify only one result
      let results;
      if (!uniqueListItemId) {
        results = response.results.slice(0, 1);
      } else {
        //in filter compare number with string
        results = response.results.filter(result => result.feature.attributes.UNIKALUS_NR == uniqueListItemId);
      }

      if ((results.length > 0) && (projectsDynamicLayer.visible)) {
        let number = 0;
        //check results for geometry type
        let geometryTypes: any = {
          hasPoint: false, //every project will have point geometry by default
          hasLine: false,
          hasPolygon: false
        };
        //filter result by the last object (or active filters) and its unique id
        let uniqueID;
        let uniqueIdCount = 0;
        projectsDynamicLayer.sublayers.items.filter(layer => {
          results.forEach(result => {
            let expressionSQL = this.getExpressionSQL();
            if ((((layer.id === result.layerId) && (layer.maxScale < view.scale) && (view.scale < layer.minScale)) || ((layer.id === result.layerId) && (layer.minScale === 0))) && (this.checkResult(expressionSQL, result)) && (uniqueIdCount === 0)) {
              if (uniqueListItemId && (uniqueListItemId == result.feature.attributes.UNIKALUS_NR)) {
                //console.log(result.feature.attributes.UNIKALUS_NR, uniqueListItemId);
                //console.log("LAYER", layer, layer.id, result.layerId);
                uniqueID = result.feature.attributes.UNIKALUS_NR;
                //add geometry type to check if we clicked on point then proceed
                result.feature.geometry.type === "point" ? geometryTypes.hasPoint = true : "";
                result.feature.geometry.rings ? geometryTypes.hasPolygon = true : "";
                result.feature.geometry.paths ? geometryTypes.hasLine = true : "";
                uniqueIdCount += 1;
              } else {
                //if clicked on map view
                //console.log("LAYER", layer, layer.id, result.layerId);
                //if was not defined (only if item was clicked on list) add unique number
                uniqueID ? uniqueID : uniqueID = result.feature.attributes.UNIKALUS_NR;
                //add geometry type to check if we clicked on point then proceed
                result.feature.geometry.type === "point" ? geometryTypes.hasPoint = true : "";
                result.feature.geometry.rings ? geometryTypes.hasPolygon = true : "";
              }
            }
          });
        });

        //init if we click on point, then add graphics immediately
        return results.map(result => {
          //get filters SQL query
          let expressionSQL = this.getExpressionSQL();

          if ((uniqueID === result.feature.attributes.UNIKALUS_NR)) {

            let name = result.feature.attributes.Pavadinimas;
            let feature = result.feature;
            let layer = projectsDynamicLayer.sublayers.items.filter(layer => {
              if (layer.id === result.layerId) {
                return layer;
              }
            });
            //console.log("layer", layer);
            //add feature layer id
            feature["layerId"] = projectsDynamicLayer.id;
            //add sublayer id
            feature["subLayerId"] = result.layerId;

            //add selection graphic
            //if we did not catch point init identify by poly or Line (if polygon doesn't exist)
            //if (geometryTypes.hasPoint) {
            //start selection of graphics
            // this.pointAddRemoveService.showSelectionGraphicOnPoint(feature, this.map, this.view, this.projectsDynamicLayer, number);
            //we need to get point if we identify by clicking on list
            this.pointAddRemoveService.showSelectionGraphicCommon(feature, map, view, projectsDynamicLayer, number, geometryTypes);
            number += 1;
            //add only 1 feature, we do not need dublicate
            //only return feature for layers that is visible in current scale
            if (((layer["0"].maxScale < view.scale) && (view.scale < layer["0"].minScale)) || (layer["0"].minScale === 0)) {
              //return result based on activated filters
              if (this.checkResult(expressionSQL, result)) {
                //activate list from map element
                //TODO move to component
                this.projectsService.getFilterListName();

                feature.popupTemplate = {
                  title: `${name}`,
                  content: this.projectsService.getPopUpContent(result.feature.attributes)
                };
                return feature;
              }
            }
          }
        })
      }
    });
  }
}
