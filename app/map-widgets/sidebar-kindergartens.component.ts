import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { MapOptions } from '../options';
import { SearchService } from '../search/search.service';
import { MapWidgetsService } from './map-widgets.service';
import { MapService } from '../map.service';
import { DataStore } from '../themes/kindergartens/map-kindergartens.service';
import { SelectorsService } from '../selectors/selectors.service';
import { MenuToolsService } from '../menu/menu-tools.service';
import { Symbols } from '../menu/symbols';

import Graphic = require('esri/Graphic');
import BufferParameters = require('esri/tasks/support/BufferParameters');
import Polygon = require('esri/geometry/Polygon');
import FeatureSet = require('esri/tasks/support/FeatureSet');

@Component({
  selector: 'sidebar-kindergartens',
  templateUrl: './app/map-widgets/sidebar-kindergartens.component.html',
  styleUrls: ['./app/map-widgets/sidebar.component.css'],
  animations: [
    trigger('innerSidebarState', [
      state('s-close', style({
        transform: 'translateX(326px)'
      })),
      state('s-open', style({
        transform: 'translateX(0)'
      })),
      transition('s-open => s-close', animate('100ms ease-in')),
      transition('s-close => s-open', animate('100ms ease-out'))
    ]),
    trigger('infoState', [
      state('s-close', style({
        transform: 'translateX(326px)'
      })),
      state('s-open', style({
        transform: 'translateX(0)'
      })),
      transition('s-open => s-close', animate('100ms ease-in')),
      transition('s-close => s-open', animate('100ms ease-out'))
    ])
  ],
})

export class SidebarKindergartensComponent implements OnInit, OnChanges {
  @ViewChild('searchWidgetDOM') searchWidgetDOM: ElementRef;
  @Input() title;
  @Input() mainSidebarState;
  @Input() sidebarContent;
  @Input() dataStore: DataStore;
  @Output() stateChange = new EventEmitter<string>();

  innerState = 's-close';
  sidebarInfoState = 's-close';

  selectionByFilterState = false;

  groups: Array<any>;

  analyzeParams = {
    eldership: 0,
    groupByAge: '',
    groupByLang: '',
    hasVacancy: false,
    groupByType: '',
    groupByName: '',
    groupByAddress: '',
    bufferSize: 2
  };

  //dataStore: DataStore;

  //filters data
  dataAge: any[];
  dataLang: any[];
  dataType: any[];
  dataName: any[];

  searchWidget: any;

  filteredGartens: any[];

  geometryService: any;

  //full administration area
  fullArea: any;

  selectedGartenId: number;
  filtersOn = false;
  distance: number;

  constructor(
    private cdr: ChangeDetectorRef,
    private mapWidgetsService: MapWidgetsService,
    private mapService: MapService,
    private selectorsService: SelectorsService,
    private searchService: SearchService,
    private menuToolsService: MenuToolsService
  ) { }

  ngOnInit() {
    !this.title && (this.title = 'Informacija');
    this.geometryService = this.menuToolsService.addGeometryService(MapOptions.mapOptions.staticServices.geometryUrl);

    this.simpleQuery(MapOptions.themes.kindergartens.layers.darzeliai.dynimacLayerUrls + '/3').then(features => {
      this.fullArea = features[0];
    })
  }

  ngDoCheck() {
    this.cdr.detectChanges();
  }

  //check if any filter is has been set
  isFiltered() {
    const { groupByAge, groupByLang, hasVacancy, groupByType, groupByName, groupByAddress } = this.analyzeParams;
    //console.log('change', this.analyzeParams);
    if ((groupByAge !== '') ||
      (groupByLang !== '') ||
      hasVacancy ||
      (groupByType !== '') ||
      (groupByName !== '') ||
      (groupByAddress !== '')) {
      this.filtersOn = true;
      this.cdr.detectChanges();
    } else {
      this.filtersOn = false;
      this.cdr.detectChanges();
    }

  }

  resetFilters() {
    const search = this.searchService.returnGartensSearchWidget();
    search.searchTerm = '';
    this.selectedGartenId = null;
    //remove existing graphic
    this.mapService.removeFeatureSelection();
    this.filtersOn = false;
    this.filteredGartens = this.dataStore.mainInfo;
    this.analyzeParams = {
      eldership: null,
      groupByAge: '',
      groupByLang: '',
      hasVacancy: false,
      groupByType: '',
      groupByName: '',
      groupByAddress: '',
      bufferSize: 2
    };
    this.filterGartens();
  }

  selectGartens(id: number, domElement) {
    //console.log('selected \n', id, '\n', domElement);
    domElement.scrollTop = 0;
    const map = this.mapService.returnMap();
    const view = this.mapService.getView();
    const featureLayer = map.findLayerById('feature-darzeliai');
    const query = this.mapService.addQuery();
    this.selectedGartenId = id;

    //remove existing graphic
    this.mapService.removeFeatureSelection();

    query.returnGeometry = true;
    query.where = `GARDEN_ID=${id}`;
    featureLayer.queryFeatures(query).then((results) => {
      const features = results.features[0];
      let fullData = null;
      const dataStore = this.dataStore;
      dataStore.mainInfo.forEach(data => {
        if (data.GARDEN_ID === id) {
          fullData = Object.assign({}, data);
        }
      });

      view.goTo({
        target: features.geometry,
        zoom: 4
      }, MapOptions.animation.options);

      this.sidebarContent = fullData;

      this.toggleInfoContent();

      if (this.dataStore && this.sidebarContent) {
        this.groups = this.dataStore.info.filter(data => data.DARZ_ID === this.sidebarContent.GARDEN_ID);
        this.cdr.detectChanges();

      }
      const groupFeatureSelectionLayer = this.mapService.initFeatureSelectionGraphicLayer('FeatureSelection', features.layer.maxScale, features.layer.minScale, 'hide');
      const { geometry, layer, attributes } = features;
      const selectionGraphic = this.mapService.initFeatureSelectionGraphic('point', geometry, layer, attributes, '26px', 'dash');
      groupFeatureSelectionLayer.graphics.add(selectionGraphic);
      map.add(groupFeatureSelectionLayer);
    });
  }

  filterGartens() {
    const search = this.searchService.returnGartensSearchWidget();
    this.selectionByFilterState = true;
    const view = this.mapService.getView();
    view.graphics.removeAll();
    // remove existing graphic
    this.mapService.removeFeatureSelection();
    // remove info content and selection if exists
    this.selectedGartenId = null;
    this.sidebarContent = null;

    if (search.searchTerm.length > 0) {
      this.distance = this.analyzeParams.bufferSize;
      this.analyzeParams.groupByAddress = search.searchTerm;
      this.isFiltered();
      // search using search widget
      search.autoSelect = true;
      search.search().then((e) => {
        const searchGeometry = e.results[0].results[0].feature.geometry;
        this.mapService.runQueryByGeometry(MapOptions.themes.kindergartens.layers.darzeliai.dynimacLayerUrls + '/2', searchGeometry).then((result: FeatureSet) => {
          this.analyzeParams.eldership = result.features[0].attributes.NR;
          const idsGartens = this.mapWidgetsService.filterKindergartents(this.dataStore, this.analyzeParams);
          this.createBuffer(this.analyzeParams, e.results[0].results[0].feature).then(buffer => {
            const url = MapOptions.themes.kindergartens.layers.darzeliai.dynimacLayerUrls + '/0';
            this.createQuery(buffer, url, idsGartens).then((filteredIds: any[]) => {
              this.filteredGartens = this.dataStore.mainInfo.filter(data => filteredIds.includes(data.GARDEN_ID));
              this.mapWidgetsService.selectKindergartens(filteredIds, this.selectionByFilterState, buffer);
              if (this.filteredGartens.length > 0) {
                this.createBufferPolygon(this.fullArea, buffer);
              }

              this.cdr.detectChanges();
            });
          })
        });
      });
    } else {
      const idsGartens = this.mapWidgetsService.filterKindergartents(this.dataStore, this.analyzeParams);
      this.distance = null;

      // do not use search widget
      this.filteredGartens = this.dataStore.mainInfo.filter(data => idsGartens.includes(data.GARDEN_ID));
      this.mapWidgetsService.selectKindergartens(idsGartens, this.selectionByFilterState);

      this.cdr.detectChanges();
    }
  }

  openSidaberGroup(name: string) {
    switch (name) {
      case 'info':
        this.sidebarInfoState = 's-open';
        break;
    }
  }

  closeSidaberGroup(name: string = '') {
    switch (name) {
      case 'info':
        this.sidebarInfoState = 's-close';
        break;
      default:
        this.sidebarInfoState = 's-close';
    }
  }

  createBuffer(options: any, point) {
    //add required options for buffer execution
    let parameters = new BufferParameters();
    const view = this.mapService.getView();
    parameters.distances = [options.bufferSize];
    parameters.unit = "kilometers";
    parameters.geodesic = true;
    //options.bufferSpatialReference = new SpatialReference({wkid: 3346});
    parameters.bufferSpatialReference = view.spatialReference;
    //parameters.spatialReference = new SpatialReference({wkid: 2600});
    parameters.outSpatialReference = view.spatialReference;
    parameters.geometries = [point.geometry];
    return this.geometryService.buffer(parameters).then((results) => {
      const polyline = new Graphic({
        geometry: results[0]
      });
      return polyline;
    });
  }

  createBufferPolygon(geometries, geometry) {
    const view = this.mapService.getView();
    //console.log('DIF', geometries, geometry);
    return this.geometryService.difference([geometries.geometry], geometry.geometry).then((results) => {
      //console.log('DIF', results);
      let polygon = new Polygon({
        rings: results[0].rings,
        spatialReference: view.spatialReference
      });
      const selectionRing = new Graphic({
        geometry: polygon,
        symbol: Symbols.selectionPolygonDark
      });
      view.graphics.add(selectionRing);
    });
  }

  //create buffer query and return results
  createQuery(polyline, url, ids: number[]) {
    const query = this.mapService.addQuery();
    const queryTask = this.mapService.addQueryTask(url);
    const idsQueryString = ids.join(', ');
    query.returnGeometry = false;
    //TODO add fixed logic, currently if no ids matching, create not existing query
    query.where = (idsQueryString.length > 0) ? `GARDEN_ID in (${idsQueryString})` : 'GARDEN_ID=9999999';
    query.outFields = ["*"];
    query.geometry = polyline.geometry;

    return queryTask.execute(query).then((result) => {
      const featuresIds = result.features.map((feature) => {
        return feature.attributes.Garden_Id;
      });

      //console.log('featuresIds', featuresIds);

      return featuresIds;
    }, (error) => {
      console.error(error);
    });
  }


  simpleQuery(url) {
    const query = this.mapService.addQuery();
    const queryTask = this.mapService.addQueryTask(url);
    query.where = '1=1';
    query.returnGeometry = true;
    query.outFields = ["*"];
    return queryTask.execute(query).then((result) => {
      const features = result.features;
      return features;
    }, (error) => {
      console.error(error);
    });
  }

  toggleInfoContent() {
    //close main heat content while adding animation
    this.innerState = 's-close';

    if (this.sidebarContent && (this.mainSidebarState === 's-open')) {
      //add setTimeout  for main heat content animation
      setTimeout(() => {
        this.innerState = 's-open';
        this.cdr.detectChanges();
      }, 200);
    }
  }

  closeInfo() {
    this.selectedGartenId = null;
    this.sidebarContent = null;
    //remove existing graphic
    this.mapService.removeFeatureSelection();
    this.cdr.detectChanges();
  }

  ngOnChanges() {
    if (this.dataStore) {
      this.filteredGartens = this.dataStore.mainInfo;
      this.dataAge = this.selectorsService.getUniqueAttribute(this.dataStore.info, 'TYPE_LABEL');
      //console.log("UNIQUE dataAge: ", this.dataAge)
      this.dataLang = this.selectorsService.getUniqueAttribute(this.dataStore.info, 'LAN_LABEL');
      //console.log("UNIQUE dataLang: ", this.dataLang)
      this.dataType = this.selectorsService.getUniqueAttribute(this.dataStore.mainInfo, 'SCHOOL_TYPE');
      //console.log("UNIQUE dataType: ", this.dataType)
      this.dataName = this.selectorsService.getUniqueAttribute(this.dataStore.mainInfo, 'LABEL');
    }

    if (this.dataStore && this.sidebarContent) {
      this.groups = this.dataStore.info.filter(data => data.DARZ_ID === this.sidebarContent.GARDEN_ID);
      this.selectedGartenId = this.sidebarContent.GARDEN_ID;
    } else {
      this.selectedGartenId = null;
    }
    this.closeSidaberGroup();
    this.toggleInfoContent();
    this.cdr.detectChanges();
  }
}
