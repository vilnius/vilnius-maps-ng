import { Injectable } from '@angular/core';

import { BASEMAPS } from './basemaps'
import { MapService } from '../map.service';
import { MapOptions, HeatingDataValues } from '../options';

@Injectable()
export class MapWidgetsService {

  //DEFAULT basemap
  activeBasemap: string = "base-dark";

  constructor(private mapService: MapService) { }

  returnBasemaps(): any[] {
    return BASEMAPS;
  }

  setActiveBasemap(name: string) {
    this.activeBasemap = name;
  }

  toggleBasemap(id: string, view: any) {
    this.activeBasemap = id;
    this.filterBasemap(id, view);
  }

  returnActiveBasemap() {
    return this.activeBasemap;
  }

  //add current basemap visibilty
  filterBasemap(activeBasemMapId: string, view: any) {
    view.map.basemap.baseLayers.items.map((item) => {
      if (item.id === activeBasemMapId) {
        item.visible = true;
        activeBasemMapId === "base-dark"
          ? document.getElementsByClassName("container-fluid")[0].className += " dark"
          : document.getElementsByClassName("container-fluid")[0].classList.remove("dark");
      } else {
        item.visible = false;
        //if active base map is basemapEngineeringUrl, add  another  basemap as well ("base-dark" for example)
        ((this.activeBasemap === "base-en-t") && (item.id === "base-dark"))
          ? item.visible = true
          : void (0);

        ((this.activeBasemap === "base-en-s") && (item.id === "base-map"))
          ? item.visible = true
          : void (0);
      }
    })
  }

  //fetch heating data based on building id
  queryHeatingDataByMonths(year: number, id: number) {
    //add heating data url, check REST endpoint
    const url = MapOptions.themes.buildings.layers.silumosSuvartojimas.dynimacLayerUrls + '/3';
    const query = this.mapService.addQuery();
    const queryTask = this.mapService.addQueryTask(url);

    query.returnGeometry = false;
    query.outFields = ['*'];
    query.where = `(SEZONAS=${year}) AND (ID=${id}) OR (SEZONAS=${year - 1}) AND (ID=${id}) OR (SEZONAS=${year - 2}) AND (ID=${id})`;
    
    return queryTask.execute(query).then((result) => {
      return result.features;
    }, (error) => {
      console.error(error);
    });
  }

  //simple copmpare f for sort method
  compare(a, b) {
    return a - b;
  }

  addAdditionalData(data: any, rate) {
    if (rate <= 3) {
      data['color'] = HeatingDataValues.color.green;
      data['strokeColor'] = HeatingDataValues.color.green;
      data['label'] = 'Gera (1-3)';
    } else if (rate > 3 && rate <= 5) {
      data['color'] = HeatingDataValues.color.yellow;
      data['strokeColor'] = HeatingDataValues.color.yellow;
      data['label'] = 'Vidutinė (4-5)';
    } else if (rate > 5 && rate <= 8) {
      data['color'] = HeatingDataValues.color.orange;
      data['strokeColor'] = HeatingDataValues.color.orange;
      data['label'] = 'Bloga (6-8)';
    } else if (rate > 8 && rate <= 11) {
      data['color'] = HeatingDataValues.color.red;
      data['strokeColor'] = HeatingDataValues.color.red;
      data['label'] = 'Labai bloga (9-11)';
    } else if (rate > 11 && rate <= 15) {
      data['color'] = HeatingDataValues.color.purple;
      data['strokeColor'] = HeatingDataValues.color.purple;
      data['label'] = 'Ypatingai bloga (12-15)';
    }
    return data;
  }

  //count unique results by class and by overall count
  countHeatingResultsByClass(results, currentRate) {
    let dataByClass = {};
    let uniqueClasses = [];
    results.forEach((result) => {
      const classRating = result.attributes.REITING;
      const isClassIncluded =  uniqueClasses.includes(classRating);
      if (classRating) {
        !isClassIncluded && uniqueClasses.push(classRating);
        if (dataByClass[classRating]) {
          dataByClass[classRating].count +=1;
        } else {
          dataByClass[classRating] = {
            'count': 1
          }
          //add addtitional data to object
          dataByClass[classRating] = this.addAdditionalData(dataByClass[classRating], classRating);
          classRating === currentRate ? dataByClass[classRating]['strokeColor'] = '#136bc5': dataByClass[classRating]['strokeColor'];
        }
      };
    });
    //rearange classes by increasing order
    uniqueClasses = uniqueClasses.sort(this.compare);
    return {
      dataByClasses: dataByClass,
      classes: uniqueClasses,
      totalResults: results.length
    };
  }

  queryHeatingDataByClasses(type: string, currentRate: number) {
    //add heating data url, check REST endpoint
    const url = MapOptions.themes.buildings.layers.silumosSuvartojimas.dynimacLayerUrls + '/1';
    const query = this.mapService.addQuery();
    const queryTask = this.mapService.addQueryTask(url);
    query.returnGeometry = true;
    query.outFields = ['*'];
    query.where = `TIPINIS_PR LIKE '${type}'`;
    return queryTask.execute(query).then((result) => {
      //console.log('%c REZULT C ', 'background:orange; color: white', result.features);
      const counted = this.countHeatingResultsByClass(result.features, currentRate);
      return counted;
    }, (error) => {
      console.error(error);
    });
  }

  //run feature query and select build by their TYPE
  //now for buldings theme only
  //TODO create reusable selection method
  selectBuildingsByType(type: string, toggleState) {
    const map = this.mapService.returnMap();

    //filter feature layers
    const featureLayer = map.findLayerById('feature-silumosSuvartojimas')
    toggleState ? featureLayer.definitionExpression = `TIPINIS_PR='${type}'` : featureLayer.definitionExpression = '';

    //filter dynamic layers
    const dynLayers =  map.findLayerById('silumosSuvartojimas')
    dynLayers.sublayers.items["0"].sublayers.items.forEach((item)=> {
      toggleState ? item.definitionExpression = `TIPINIS_PR='${type}'` : item.definitionExpression = '';
    })
  }
}
