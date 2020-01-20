import { Injectable } from '@angular/core';

import { MapService } from '../../../map.service';
import { MenuToolsService } from '../../menu-tools.service';
import { MapOptions } from '../../../options';
import { Symbols } from '../../symbols';
import { FileIndex } from './fileIndex';
import { ToolsList } from '../../tools.list';

import Geoprocessor = require('esri/tasks/Geoprocessor');
import Draw = require('esri/views/2d/draw/Draw');
import Graphic = require('esri/Graphic');
import Polygon = require('esri/geometry/Polygon');
import FeatureSet = require('esri/tasks/support/FeatureSet');
import geometryEngine = require('esri/geometry/geometryEngine');
import { HttpClient } from '@angular/common/http';
import { interval, of, Observable, forkJoin, from } from 'rxjs';
import { takeUntil, filter, mapTo, tap, switchMapTo, take, map } from 'rxjs/operators';
import { property } from 'lodash-es';

// AG using only one instance as we not using more than 1 tool at the same time
@Injectable()
export class DwgService {
  draw: Draw;
  view: any;
  polygon: Polygon;
  graphic: Graphic;
  featureSet = new FeatureSet();
  tool: string = 'dwg';
  toolTitle: string;
  zip1OutputTitle: string;
  zip2OutputTitle: string;
  resultsMessage: string;
  time: number;
  limits: number;

  // file results promises
  fileResults = [];

  // file results urls
  fileResultsurls = {
    zip1: null,
    zip2: null,
    succes: null
  };
  calculatedUnits: number | string
  job: IPromise<any>
  geo: Geoprocessor;

  constructor(
    private mapService: MapService,
    private menuToolsService: MenuToolsService,
    private  http: HttpClient
  ) { }

  initDraw(view): Draw {
    this.view = view;
    this.draw = new Draw({
      view
    });
    return this.draw;
  }

  setTool(tool: string): void {
    this.tool = tool;
  }

  initGeoprocessor(view) {
    const url = this.tool === ToolsList.dwg ? MapOptions.mapOptions.staticServices.extractDWG.url : MapOptions.mapOptions.staticServices.extractDWGTech.url;
    if (this.tool === ToolsList.dwg) {
      this.zip1OutputTitle = MapOptions.mapOptions.staticServices.extractDWG.zipFiles.zip1.title;
      this.zip2OutputTitle = MapOptions.mapOptions.staticServices.extractDWG.zipFiles.zip2.title;
      this.resultsMessage = MapOptions.mapOptions.staticServices.extractDWG.message;
      this.time = MapOptions.mapOptions.staticServices.extractDWG.aproxExtractTime;
      this.toolTitle = MapOptions.mapOptions.staticServices.extractDWG.title;
      this.limits = MapOptions.mapOptions.staticServices.extractDWG.limitsFrontEnd;

    } else {
      this.zip1OutputTitle = MapOptions.mapOptions.staticServices.extractDWGTech.zipFiles.zip1.title;
      this.zip2OutputTitle = MapOptions.mapOptions.staticServices.extractDWGTech.zipFiles.zip2.title;
      this.resultsMessage = MapOptions.mapOptions.staticServices.extractDWGTech.zipFiles.message;
      this.time = MapOptions.mapOptions.staticServices.extractDWGTech.aproxExtractTime;
      this.toolTitle = MapOptions.mapOptions.staticServices.extractDWGTech.title;
      this.limits = MapOptions.mapOptions.staticServices.extractDWGTech.limitsFrontEnd;
    }
    this.geo = new Geoprocessor({
      url,
      outSpatialReference: view.spatialReference
    });
    return this.geo;
  }

  deactivateAndDisable(evt: Event, drawActive: boolean) {
    // on complete remove class
    // check if drawActive -> unsuspend
    if ((evt.type === "draw-complete") && drawActive) {
      // first unsuspend layers on draw-complete event
      // set timeout, needed for point element specificallly as we do not want to start identify method too early
      setTimeout(() => {
        this.mapService.unSuspendLayersToggle();
      }, 800);
    }
  }

  drawPolygon(evt, drawActive: boolean, ended = false) {
    //on complete remove class
    this.deactivateAndDisable(evt, drawActive);

    let vertices = evt.vertices;
    //remove existing graphic
    this.view.graphics.removeAll();
    // create a new polygon
    const polygon = new Polygon({
      rings: vertices,
      spatialReference: this.view.spatialReference
    });

    // create a new graphic representing the polygon, add it to the view
    let graphic = new Graphic({
      geometry: polygon,
      symbol: Symbols.polygonSymbol
    });

    // using graphic to show clear button
    // add only if graphic has more than 1 vertex, equal length mroe than 2 arrays
    if (polygon.rings[0].length > 1) {
      this.graphic = graphic;
    }

    this.view.graphics.add(graphic);

    // calculate the area of the polygon
    let area = geometryEngine.planarArea(polygon, "hectares");
    if (area < 0) {
      area = - area;
    }
    // start displaying the area of the polygon
    this.labelAreas(polygon, area, ended);
  }

  //Label polygon with its area
  labelAreas(geom, area: number, ended: boolean) {
    const graphic = this.menuToolsService.createAreaLabelGraphic(geom, area, ended, 'ha');
    this.view.graphics.add(graphic);

    this.calculatedUnits = area.toFixed(4);
  }

  submitExtractJob() {
    let params = {};

    //null succes result
    this.fileResultsurls.succes = null;

    this.fileResults = [];
    this.featureSet.features = [this.graphic];
    params[MapOptions.mapOptions.staticServices.extractDWG.params.name] = this.featureSet;
    this.job = this.geo.submitJob(params);
    return this.job.then((res) => {
      const jobId = res.jobId

      if (res.jobStatus !== 'job-failed') {
        const zip1OutputName = this.tool === ToolsList.dwg ? MapOptions.mapOptions.staticServices.extractDWG.zipFiles.zip1.name : MapOptions.mapOptions.staticServices.extractDWGTech.zipFiles.zip1.name;
        const zip2OutputName = this.tool === ToolsList.dwg ? MapOptions.mapOptions.staticServices.extractDWG.zipFiles.zip2.name : MapOptions.mapOptions.staticServices.extractDWGTech.zipFiles.zip2.name;
        //get results
        const zip1 = this.geo.getResultData(jobId, zip1OutputName);
        const zip2 = this.geo.getResultData(jobId, zip2OutputName);
        // order is important check enum FileIndex
        this.fileResults.push.apply(this.fileResults, [zip1, zip2]);
        this.executeFilesPromises(this.fileResults);
        return true;
      } else {
        this.fileResultsurls.succes = false;
        return false;
      }

    }).catch(function(error) {
      console.warn('VP Warn', error);
      // return false and do not execute next step in component
      return false;
    });
  }


  executeFilesPromises(fileResults: any[]) {
    forkJoin(
      fileResults
    ).subscribe((response) => {
      console.log(response)
      this.fileResultsurls.zip1 = response[0].value.url;
      this.fileResultsurls.zip2 = response[1].value.url;
      this.fileResultsurls.succes = true
    });
  }

  //additional method to get job id and cancel job
  getJobinfo(): Observable<string> {
    const geo = this.geo as any;
    const jobs = Object.keys(geo._updateTimers);
    return interval(1000)
    .pipe(
      // tap(b => { console.log('TAP', b) }),
      switchMapTo(of(jobs)
        .pipe(
          // tap(jobs => { console.log('TAP', jobs) }),
          filter(jobs => jobs.length > 0),
          map(jobs => jobs[0])
        )
      ),
      take(1)
    )
  }

  cancelJob() {
    if (this.job) {
      // main method using _updateTimer property
      const geo = this.geo as any;
      const jobId = Object.keys(geo._updateTimers)[0];
      this.geo.cancelJob(jobId);

      // additional method in case  _updateTimer not available
      this.job.cancel();
        this.getJobinfo().subscribe(jobId => {
          this.geo.cancelJob(jobId)}
        )
    

      
    } 

  }

}
