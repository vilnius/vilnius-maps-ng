import { Injectable } from '@angular/core';

import { MapService } from '../map.service';
import { MapOptions, HeatingDataValues } from '../options';

@Injectable()
export class MapWidgetsService {

  constructor(private mapService: MapService) { }

  // fetch heating data based on building id
  queryHeatingDataByMonths(year: number, id: number) {
    // add heating data url, check REST endpoint
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

  // simple copmpare f for sort method
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

  // count unique results by class and by overall count
  countHeatingResultsByClass(results, currentRate) {
    let dataByClass = {};
    let uniqueClasses = [];
    results.forEach((result) => {
      const classRating = result.attributes.REITING;
      const isClassIncluded = uniqueClasses.includes(classRating);
      if (classRating) {
        !isClassIncluded && uniqueClasses.push(classRating);
        if (dataByClass[classRating]) {
          dataByClass[classRating].count += 1;
        } else {
          dataByClass[classRating] = {
            'count': 1
          }
          //add addtitional data to object
          dataByClass[classRating] = this.addAdditionalData(dataByClass[classRating], classRating);
          classRating === currentRate ? dataByClass[classRating]['strokeColor'] = '#136bc5' : dataByClass[classRating]['strokeColor'];
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
    const dynLayers = map.findLayerById('silumosSuvartojimas')
    dynLayers.sublayers.items["0"].sublayers.items.forEach((item) => {
      toggleState ? item.definitionExpression = `TIPINIS_PR='${type}'` : item.definitionExpression = '';
    })
  }

  selectKindergartens(ids: number[], toggleState, buffer = null) {
    const map = this.mapService.returnMap();
    const view = this.mapService.getView();
    const idsQueryString = ids.join(', ');
    //console.log(idsQueryString)
    //filter feature layers
    const featureLayer = map.findLayerById('feature-darzeliai');
    //console.log(featureLayer);
    (toggleState && (ids.length > 0)) ? featureLayer.definitionExpression = `GARDEN_ID in (${idsQueryString})` : featureLayer.definitionExpression = 'GARDEN_ID = 9999';

    //filter dynamic layers
    const dynLayers = map.findLayerById('darzeliai')
    dynLayers.sublayers.items.forEach((item) => {
      //console.log(item)
      //id 0 is layer of kindergartens
      if (item.id === 0) {
        (toggleState && (ids.length > 0)) ? item.definitionExpression = `GARDEN_ID in (${idsQueryString})` : item.definitionExpression = 'GARDEN_ID = 9999';
      }
    });
    if (ids.length > 0) {
      featureLayer.queryExtent().then(function(results) {
        // go to the extent of the results satisfying the query
        //console.log('queryExtent', results, view.zoom)
        //console.log('buf', buffer)
        const extent = results.extent;
        const width = ((extent.xmax - extent.xmin) / view.width) * 450;
        //console.log('px', view.width, extent.xmax - extent.xmin, (extent.xmax - extent.xmin) / view.width);
        extent.xmin = extent.xmin - width;
        extent.ymin = extent.ymin - width;
        extent.xmax = extent.xmax + width;
        extent.ymax = extent.ymax + width;
        if (buffer) {
          buffer.geometry.extent.xmin = buffer.geometry.extent.xmin - width;
          buffer.geometry.extent.ymin = buffer.geometry.extent.ymin - width;
          buffer.geometry.extent.xmax = buffer.geometry.extent.xmax + width;
          buffer.geometry.extent.ymax = buffer.geometry.extent.ymax + width;
        }
        //if result is only one object (width === 0)
        if (!width) {
          view.goTo({
            target: buffer ? buffer : extent,
            zoom: 3
          }, MapOptions.animation.options);
        } else {
          view.goTo({
            target: buffer ? buffer : extent//,
            //zoom: 1
          }, MapOptions.animation.options);
        }
      });
    } else {
      view.goTo({
        target: featureLayer.fullExtent
      }, MapOptions.animation.options);
    }
  }

  filterKindergartents(dataStore, { eldership, groupByAge, groupByLang, groupByName, groupByType, hasVacancy }) {
    //console.log("STORE", dataStore, '\n', eldership, groupByAge, groupByLang, groupByName, groupByType, hasVacancy)
    const gartens = dataStore.mainInfo;
    const elderate = dataStore.elderates.filter(data => data.ID === eldership)[0];
    const eldarateLabel = elderate ? elderate.LABEL : '';
    let gartensIDs = [];
    gartens.forEach((garten) => {
      const idByAge = dataStore.info.map(data => {
        if (data.TYPE_LABEL === groupByAge) {
          return data.DARZ_ID;
        }
      });
      const idByLang = dataStore.info.map(data => {
        if (data.LAN_LABEL === groupByLang) {
          return data.DARZ_ID;
        }
      });
      const idByVacancy = dataStore.summary.map(data => {
        if (data.FREE_SPACE > 0) {
          return data.DARZ_ID;
        }
      });

      if (((garten.ELDERATE === eldarateLabel) || (!eldership) || (garten.ELDERATE === 'Visos seniūnijos')) &&
        ((garten.SCHOOL_TYPE === groupByType) || (groupByType === '')) &&
        ((garten.LABEL === groupByName) || (groupByName === '')) &&
        (idByAge.includes(garten.GARDEN_ID) || (groupByAge === '')) &&
        (idByLang.includes(garten.GARDEN_ID) || (groupByLang === ''))) {
        if (hasVacancy) {
          if (idByVacancy.includes(garten.GARDEN_ID)) {
            return gartensIDs.push(garten.GARDEN_ID);
          }
        } else {
          return gartensIDs.push(garten.GARDEN_ID);
        }
      }
    });
    return gartensIDs;
  }
}
