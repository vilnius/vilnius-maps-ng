import { Component, Input, Output, EventEmitter, ElementRef, OnInit, OnDestroy, ViewChild  } from '@angular/core';

import { MapService } from '../map.service';
import { FeatureQueryService } from '../query/feature-query.service';
import { ProjectsFilterService } from './projects-filter.service';
import { ProjectsListService } from './projects-list.service';
import { IdentifyService } from '../services/identify/identify.service';
import { PointAddRemoveService } from '../query/point-add-remove.service';
import { MapOptions } from '../options';
import { PopupTemplates } from '../services/identify/popup-templates';

import on = require("dojo/on");
import Point = require("esri/geometry/Point");
import { Subscription } from 'rxjs/Subscription';
import all = require("dojo/promise/all");


@Component({
  selector: 'projects-list',
  host: {
    '(document:click)': 'handleClick($event)',
  },
  providers: [ProjectsFilterService],
  templateUrl: './app/projects-list/projects-list.component.html'
})

export class ProjectsListComponent implements OnInit, OnDestroy {
  @Input() featureLayers: any;
  @Input() map: any;
  @Input() view: any;
  @Input() projectsList: any;
  @Input() projectsListOriginal: any;
  @Input() fullListChanged: any;
  @Input() highlight: string;
  @Output() onFilter = new EventEmitter<any>();

  mapListActive: number;
  wordListActive: number;

  fullList: any;

  public query = '';
  public projects: any[];
  public filteredList = [];
  public elementRef;
  selectedIdx: number;
  projectsThemes: Number[];
  projectsFinalYears: string[];
  buttonActive: false;
  activeTheme: Object;
  activeYear: Object;
  //activated filters number badge property
  activatedFiltersNumber: number = 0;

  //calculate selection point coordinates    let pointX;
  pointX: number;
  pointY: number;

  //radio buttons data binding for filtering by map or by word
  //using for direct viewing on map with hitTest method as well
  mainFilterCheck: String = 'word';

  fullListSubscription: Subscription;
  pointSubscription: Subscription;


  keyUpDelay = (() => {
    let timer = 0;
    return function(callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();

  constructor(myElement: ElementRef, private _mapService: MapService, private filterThemes: FeatureQueryService, private projectsFilter: ProjectsFilterService, private projectsListService: ProjectsListService, private identify: IdentifyService, private pointAddRemoveService: PointAddRemoveService) {
    this.elementRef = myElement;
    this.selectedIdx = -1;
  }

  //activate word or map list item
  activateList(e = null, listName: string = null) {
    if (listName === "word") {
      this.wordListActive = e.target.id;
      //deactivate mapListActive
      this.mapListActive = null;
    } else if (listName === "map") {
      this.mapListActive = e.target.id;
      //deactivate wordListActive
      this.wordListActive = null;
    } else {
      //deactivate list selection
      this.wordListActive = null;
      this.mapListActive = null;
    }
  }

  //getactivatedListName
  getListName() {
    return this.mainFilterCheck;
  }

  //when searching address select filter by extention
  selectFilterByExtention() {
    this.mainFilterCheck = "map";
    this.projectsListService.setFilterListName(this.mainFilterCheck)
    //alert("map")
  }

  //identify list item
  identifyListItem(e, project) {
    e.stopPropagation();
    //close advanced filters container if opened
    this.buttonActive ? this.buttonActive = false : this.buttonActive;
    //start idenfify, pass project
    this.identifyAttributes(project);
  }

  removeSelectionLayers(): void {
    //find layer and remove it, max 4 layers: polygon, polyline, point, and additional point if scale is set from point to point in mxd
    this._mapService.removeSelectionLayers(this.map);
  }

  //activate word or map list item directly from map
  activateListByID(id: number = null, listName: String = null) {
    if (listName === "word") {
      this.wordListActive = id;
      //deactivate mapListActive
      this.mapListActive = null;
    } else {
      this.mapListActive = id;
      //deactivate wordListActive
      this.wordListActive = null;
    }
  }

  //list item identify
  identifyAttributes(project: any) {
    let query = this.projectsListService.Query();
    let queryTask = this.projectsListService.QueryTask(MapOptions.themes.itvTheme.layers.uniqueProjects + "/0");
    let number: number = 0;
    //get point coordinates from points layer
    let n = 0;

    //remve any selection layers
    this.removeSelectionLayers();

    //TODO remove old graphic if exists
    this.view.graphics.items = [];
    query.where = "UNIKALUS_NR=" + project.attributes.UNIKALUS_NR;
    query.outFields = ["*"];
    query.returnGeometry = true;
    queryTask.execute(query).then((results) => {
      let projectsDynamicLayer = this._mapService.getProjectsDynamicLayer()
      //store all deffered objects of identify task in def array
      let def: Array<any> = [];
      let identify = this.identify.identify(MapOptions.themes.itvTheme.layers.identifyLayer);
      let identifyParams = this.identify.identifyParams();
      let geometry = results.features["0"].geometry;

      identifyParams.geometry = geometry;
      identifyParams.mapExtent = this.view.extent;
      identifyParams.tolerance = 10;
      identifyParams.width = this.view.width;
      identifyParams.height = this.view.height;
      identifyParams.layerOption = 'visible';
      identifyParams.returnGeometry = true;

      let defferedList = this.filterThemes.identifyProjects(projectsDynamicLayer, identifyParams, this.map, this.view, project.attributes.UNIKALUS_NR)
        .then((response) => {
          //console.log('response', response);
          //filter empty response which was received after map method
          let responseMerge = response.filter(res => res);
          let currentFilterName: String = this.projectsListService.getFilterListName();
          this.activateListByID(parseInt(responseMerge["0"].attributes.UNIKALUS_NR), currentFilterName);
          //console.log('response 2', responseMerge);
          return response;
        }, (error) => { console.error(error); });

      def.push(defferedList);

      //using dojo/promise/all function that takes multiple promises and returns a new promise that is fulfilled when all promises have been resolved or one has been rejected.
      all(def).then((response) => {
        //console.log('response def', response)
        let resultsMerge = [].concat.apply([], response.reverse()); //merge all results
        //console.log('response resultsMerge', resultsMerge)
        //filter empty response again (just in case) which was received after map method
        resultsMerge = resultsMerge.filter(res => res);
        //console.log('response resultsMerge 2', resultsMerge)
        //console.log('getPointCoordinates2', this.pointAddRemoveService.getPointCoordinates())
        this.pointSubscription = this.pointAddRemoveService.pointItem.subscribe(point => {
        //console.log("POINT", point);
        if (resultsMerge.length > 0) {
          //let point = this.pointAddRemoveService.getPointCoordinates();
          this.view.goTo({
          target: point
        }, MapOptions.animation.options);
          //this.view.center = point;
          //alert(point.x)
          this.view.popup.open({
            features: resultsMerge,
            location: point
          });
          //TODO change logic
          //unsubscribe point subscribtion after popup opens
          setTimeout(()=>{this.pointSubscription.unsubscribe()}, 200)
        }
        });
      });

      //count found attributes, a in mxds we are using same layer but with different scale
      let countFoundAttributes: number = 0;
      n++;

      //console.log(results)
      //if (results.features.length > 0) {
      let pointXY: number[];

      //execute query to get selection geometry only after point coordinates has been asigned to let pointXY, and only on first point element (number = 0)
      if ((results.geometryType === "point") && (results.features["0"].attributes.UNIKALUS_NR === project.attributes.UNIKALUS_NR)) {
        //console.log(number);
        //console.log("Rezultatai", results);
        //console.log("countFoundAttributes", countFoundAttributes);
        if (countFoundAttributes === 0) {
          pointXY = this.getPointXY(results);
          //this.view.popup =  "undefined";
          //clear popup
          this.view.popup.clear();
          this.view.popup.visible = false;
          //change popup position
          this.view.popup.dockEnabled = true;
          this.view.popup.position = 'bottom-center';
          this.initPopup(results, pointXY);
          //this.queryResultsToGraphic(this.map, results, layer, number);
          countFoundAttributes += 1;
        }

      }
      // + 1 after queryResultsToGraphic()
      number += 1;

    }, (err) => console.log(err))

  }

  getPointXY(results: any) {
    //get only point coordinates
    let pointX, pointY;
    pointX = results.features[0].geometry.x;
    pointY = results.features[0].geometry.y;
    //return x and y in array
    return [pointX, pointY]
  }

  //selection results to graphic by creating new graphic layer
  queryResultsToGraphic(map: any, results: any, layer: any, number: number): void {
    this._mapService.selectionResultsToGraphic(map, results.features[0], results.features[0].layer.maxScale, results.features[0].layer.minScale, layer, number);
  }

  //init Popup only on point for all geomtry type based on scale
  initPopup(results: any, pointXY) {
    let pt = new Point({
      x: pointXY[0],
      y: pointXY[1],
      spatialReference: 3346
    });
    this.openPopUp(results, pt);
  }

  openPopUp(results: any, point: any) {
    this.view.popup.open({
      location: point,
      title: results.features[0].attributes.Pavadinimas,
      content: this.projectsListService.getPopUpContent(results.features[0].attributes)
    });

    this.view.goTo({
      target: point
    }, MapOptions.animation.options);
  }

  //get radio button value on selection
  change(e) {
    this.mainFilterCheck = e.target.value;
    this.projectsListService.setFilterListName(e.target.value)
  }

  getList() {
    //console.log("FEATURES: ", this.projectsListOriginal)
    return this.fullList;
  }

  filter(event: any) {
    //add setTimeout and clearTimeout
    this.keyUpDelay(() => {
      //console.log("EVENTAS: ", event.code)
      if (this.query !== "") {
        // this.filteredList = this.getList().filter(function (el) {
        //     return el.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
        // }.bind(this));
        this.filteredList = this.getList().filter(function(project) {
          const projectsName = project.attributes.Pavadinimas.toLowerCase();
          return projectsName.indexOf(this.query.toLowerCase()) > -1;
        }.bind(this));

        //console.log(event.target.value)
        //console.log("SARASAS: ", this.filteredList)
        //emit filter list and input value for additional query task if any additional filtering occurs
        this.onFilter.emit([this.filteredList, event.target.value]);

        //UPDATE if query is not empty asign this.fullListChanged = this.filteredList;
        this.fullListChanged = this.filteredList;

        if (event.code == "ArrowDown" && this.selectedIdx < this.filteredList.length) {

          this.selectedIdx++;
          //console.log(this.selectedIdx);
        } else if (event.code == "ArrowUp" && this.selectedIdx > 0) {
          this.selectedIdx--;
          //console.log(this.selectedIdx);
        }
      } else {
        this.filteredList = [];
        //emit filter list and input value for additional query task if any additional filtering occurs
        //console.log("SARASAS: ", this.filteredList)
        this.onFilter.emit([this.filteredList, event.target.value]);
      }
    }, 200);
  }

  select(item) {
    //console.log(item);
    this.query = item;
    this.filteredList = [];
    this.selectedIdx = -1;
    //this.onFilter.emit(item);
  }

  handleBlur() {
    if (this.selectedIdx > -1) {
      this.query = this.filteredList[this.selectedIdx];
    }
    this.filteredList = [];
    this.selectedIdx = -1;
  }

  handleClick(event) {
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
  }

  //theme filter
  filterFeatures(theme: Number) {
    this.filterThemes.filterFeatures(theme);
    this.activeTheme = this.filterThemes.getFilterStatusTheme();
    //console.log(this.filterThemes.getFilterStatusTheme());
    //count total activated filter number bind property to badge
    this.countActivatedFilter();
    //console.log("VIEW", this.view)
  }
  //year filtrer
  filterYear(year: String) {
    this.filterThemes.yearFilterQuery(year);
    this.activeYear = this.filterThemes.getFilterStatusYear();
    //count total activated filter number bind property to badge
    this.countActivatedFilter();
  }

  //count total activated filter number bind property to badge
  countActivatedFilter() {
    //check if native Objects.values exists
    Object.values = Object.values || (object => Object.keys(object).map(key => object[key]));
    this.activatedFiltersNumber = Object.values(this.activeYear).reduce((acc, cur, i) => { !cur ? acc += 1 : acc; return acc; }, 0) + Object.values(this.activeTheme).reduce((acc, cur, i) => { !cur ? acc += 1 : acc; return acc; }, 0);
  }

  unsubscribe() {
    setTimeout(() => {
      this.fullListSubscription.unsubscribe();
    }, 2000)
  }

  ngOnInit() {
    //console.log("LOADING 2");
    //this.subscription ? this.subscription.unsubscribe() : this.subscription;
    //get full list binding and then proceed
    //let allFeatureList = this.getList();
    //let allFeatureList = this.fullList;
    //set projetcs unique final years for filtering
    this.fullListSubscription = this.projectsListService.fullListItem.subscribe(fullList => {
      this.fullList = fullList;
      this.projectsFinalYears = this.projectsFilter.getUniqueAttributeSubStr(fullList, "Igyvend_IKI", 4);
      //console.log(  this.projectsFinalYears);
      //set projects unique themes for filtering
      //this.projectsThemes = this.projectsFilter.getUniqueAttribute(this.getList(), "TEMA");
      //filter by TemaID
      this.projectsThemes = this.projectsFilter.getUniqueAttribute(fullList, "TemaID");
      //console.log("143", this.projectsThemes );
      //send years and themes array to Map object in feature query service
      this.filterThemes.sendToMap(this.projectsFinalYears, this.projectsThemes);
      //set active class on init
      this.activeTheme = this.filterThemes.getFilterStatusTheme();
      this.activeYear = this.filterThemes.getFilterStatusYear();
      //unsebscribe as we got full list that will not chnage
      this.unsubscribe();
    }
    );
  }

  ngOnDestroy() {
    this.unsubscribe();
    this.pointSubscription.unsubscribe();
  }
}