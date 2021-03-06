import { Injectable } from '@angular/core';

import { MapOptions } from '../../options';
import { MapService } from '../../map.service';
import { MapKindergartensService } from './map-kindergartens.service';

import findKey from 'lodash-es/findKey';
import pick from 'lodash-es/pick';
import forIn from 'lodash-es/forIn';

import { forkJoin, from, Observable, Subject, ObservableInput } from 'rxjs';

@Injectable()
export class KindergartensLayersService {
  dataStoreS = new Subject<ObservableInput<any>>();
  dataStore$  = this.dataStoreS.asObservable();
  constructor(private mapService: MapService, private mapKindergartensService: MapKindergartensService) { }

  addCustomLayers(queryParams, snapshotUrl) {
    let dataStore$: Observable<any>;
    //using lodash find and pick themeLayer from options
    const themeName = findKey(MapOptions.themes, { "id": snapshotUrl.path });
    const themeLayers = pick(MapOptions.themes, themeName)[themeName]["layers"];
    const mapEsri = this.mapService.returnMap();

    //all theme layers will be added to common group layer
    const mainGroupLayer = this.mapService.initGroupLayer(themeName + 'group', 'Ikimokylinio ugdymo įstaigos', 'show');
    mapEsri.add(mainGroupLayer);

    mainGroupLayer.on("layerview-create", (event) => {
          //create group and add all grouped layers to same group, so we could manage group visibility
          const groupLayer = this.mapService.initGroupLayer('kindergartensSub' + 'group', 'Ikimokylinio ugdymo įstaigos', 'hide-children');
          mainGroupLayer.add(groupLayer);

      groupLayer.on("layerview-create", (event) => {
        forIn(themeLayers, (layer, key) => {
          const popupEnabled = false;

          //add feature layer with opacity 0
          this.mapService.pickCustomThemeLayers(layer, key, queryParams, groupLayer, 0, 'simple-marker');

          this.mapService.pickMainThemeLayers(layer, key, queryParams, popupEnabled, groupLayer);

          // create data Observables from promises and forkJoin all Observables
          const url = layer.dynimacLayerUrls
          const dataElderates$ = from(
            this.mapKindergartensService.getAllQueryDataPromise(url + '/4', ['ID', 'LABEL'])
          );
          const dataMainInfo$ = from(
            this.mapKindergartensService.getAllQueryDataPromise(url + '/5', ['GARDEN_ID', 'LABEL', 'EMAIL', 'PHONE', 'FAX', 'ELDERATE', 'ELDERATE2', 'ELDERATE3', 'ELDERATE4', 'SCHOOL_TYPE'])
          );
          const dataInfo$ = from(
            this.mapKindergartensService.getAllQueryDataPromise(url + '/6', ['DARZ_ID', 'LAN_LABEL', 'TYPE_LABEL', 'CHILDS_COUNT', 'FREE_SPACE'])
          );
          const dataSummary$ = from(
            this.mapKindergartensService.getAllQueryDataPromise(url + '/7', ['DARZ_ID', 'CHILDS_COUNT', 'FREE_SPACE'])
          );


          dataStore$ = forkJoin(
            dataElderates$,
            dataMainInfo$,
            dataInfo$,
            dataSummary$,
            (elderates: any[], mainInfo: any[], info: any[], summary: any[]) => ({
              elderates,
              mainInfo,
              info,
              summary
            })
          );

          this.dataStoreS.next(dataStore$);
        });

        //set raster layers
        const rasterLayers = this.mapService.getRasterLayers();
        this.mapService.setRasterLayers(rasterLayers);
      });

    });

    // return dataStore$;
  }

}
