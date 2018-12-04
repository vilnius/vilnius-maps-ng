import { Injectable } from '@angular/core';

import { MapService } from '../../map.service';
import { MapDefaultService } from '../../themes/default/map-default.service';
import { ShareButtonService } from '../../services/share-button.service';

import IdentifyTask = require("esri/tasks/IdentifyTask");
import IdentifyParameters = require("esri/tasks/support/IdentifyParameters");
import on = require("dojo/on");
import all = require("dojo/promise/all");

@Injectable()
export class IdentifyService {

  constructor(
    private mapService: MapService,
    private mapDefaultService: MapDefaultService,
    private shareButtonService: ShareButtonService) { }

  //identify for mapservice only
  identify(layer: any) {
    return new IdentifyTask(layer);
  }

  identifyParams() {
    return new IdentifyParameters();
  }

  //identify dafault theme layers
  identifyLayers(view) {
    const identifyParams = this.identifyParams();
    view.popup.dockOptions = {
      position: 'bottom-left'
    };
    const mapClickEvent = on(view, "click", (event) => {
			//check if layer is suspended
      const suspended = this.mapService.getSuspendedIdentitication();
      //store all deffered objects of identify task in def array
      let def = [];
      let ids: any = this.shareButtonService.getVisibleLayersIds(view);
      let visibleLayersIds: number[] = ids.identificationsIds;
      view.popup.dockEnabled = false;
      view.popup.dockOptions = {
        // Disables the dock button from the popup
        buttonEnabled: true,
        // Ignore the default sizes that trigger responsive docking
        breakpoint: false,
        position: 'bottom-left'
      }
      identifyParams.geometry = event.mapPoint;
      identifyParams.mapExtent = view.extent;
      identifyParams.tolerance = 10;
      identifyParams.width = view.width;
      identifyParams.height = view.height;
      identifyParams.layerOption = 'all';

      //foreach item execute task
      view.layerViews.items.forEach(item => {
        // do not execute if layer is for buffer graphics and if layer is GroupLayer with list mnode 'hide-children' or type is group which means it is dedicated for retrieving data to custom sidebar via feature layer hitTest method
        // skip FeatureSelection layer as well wich is created only for Feature selection graphics
				// TODO remove or refactor allLayers identification
        if ((item.layer.id !== "bufferPolygon") && (item.layer.id !== "allLayers_") && (!suspended) && (item.layer.listMode !== 'hide-children') && (item.layer.type !== 'group') && (item.layer.id !== 'FeatureSelection') && (item.layer.id !== 'AreaSelection') && (item.layer.popupEnabled)) {
          //if layer is buffer result, add custom visibility
          if (item.layer.id === "bufferLayers") {
            identifyParams.layerIds = [0];
          } else {
            identifyParams.layerIds = [visibleLayersIds[item.layer.id]];
          }

          let defferedList = this.identify(item.layer.url).execute(identifyParams).then((response) => {
            //console.log("RSP", response);
            //console.log("ids",ids);
            let results = response.results.reverse();
            return results.map((result) => {
              let name = result.layerName;
              let feature = result.feature;
              feature.popupTemplate = {
                title: `${name}`,
                content: this.mapDefaultService.getVisibleLayersContent(result)
              };
              //add feature layer id
              feature["layerId"] = item.layer.id;
              return feature;
            });
          }).then(function(response) {
            //console.log('response', response)
            return response;
          }, (error) => { console.error(error); });

          def.push(defferedList);
        }
      });


      //using dojo/promise/all function that takes multiple promises and returns a new promise that is fulfilled when all promises have been resolved or one has been rejected.
      all(def).then(function(response) {
        let resultsMerge = [].concat.apply([], response.reverse()); //merger all results
        //console.log('response resultsMerge', resultsMerge)
        //remove emtpy Values
        resultsMerge = resultsMerge.filter((value) => value);
        if (resultsMerge.length > 0) {
          view.popup.open({
            features: resultsMerge,
            location: event.mapPoint
          });
        }
      });

    }, (error) => { console.error(error); });
    //TODO REMOVE
    // if (!window.esriMap) {
    // 	window.esriMap = [];
    // 	window.mapClickEvent = {};
    // 	window.mapClickEvent[Math.random()] = mapClickEvent
    // 	window.mapClickEvent[Math.random()] = view
    // 	window.mapClickEvent[Math.random()] = map
    // 	window.esriMap.push(mapClickEvent);
    // } else {
    // 		window.esriMap.push(mapClickEvent);
    // 		window.mapClickEvent[Math.random()] = mapClickEvent
    // 		window.mapClickEvent[Math.random()] = view
    // 		window.mapClickEvent[Math.random()] = map
    // }

    return mapClickEvent;
  }

  showItvPopupOnCLick(view: any, event: any, identify: any, identifyParams: any) {
    identifyParams.geometry = event.mapPoint;
    identifyParams.mapExtent = view.extent;
    identifyParams.tolerance = 5;
    identifyParams.width = view.width;
    identifyParams.height = view.height;
    identifyParams.layerOption = 'top';

    identify.execute(identifyParams).then((response) => {
      let results = response.results;
      return results.map((result) => {
        let feature = result.feature;
        feature.popupTemplate = {
          title: '{Pavadinimas}',
          content: `
                  <p><span class="n{TemaId}-theme projects-theme"></span> {Tema} <br /><span>Tema</span></p>
                  <p>{Busena}<br /><span>Projekto būsena</span</p>
                  <p>{Projekto_aprasymas} <br /><span>Aprašymas</span></p>
                  <p>{Igyvend_NUO} - {Igyvend_IKI} m.<br /><span>Įgyvendinimo trukmė</span></p>
                  <p><a href="{Nuoroda_i_projekta}" target="_blank">{Nuoroda_i_projekta}</a> <br /><span>Projekto nuoroda</span></p>
                  <p>{Veiksmo_nr_ITVP } <br /><span>Programos veiksmas </span></p>
                  <p>{Vykdytojas}<br /><span>Vykdytojas</span></p>
                  <p><a href="{Kontaktai}">{Kontaktai}</a> <br /><span>Kontaktai</span></p>
                  <div class="finance-list">
                    <div>
                    <p>{Projekto_verte} Eur<br /><span>Projekto vertė</span></p>
                    </div>
                    <p>{ES_investicijos} Eur <br /><span>Europos Sąjungos investicijos</span></p>
                    <p>{Savivaldybes_biudzeto_lesos} Eur<br /><span>Savivaldybės biudžeto lėšos</span></p>
                    <p>{Valstybes_biudzeto_lesos} Eur<br /><span>Valstybės biudžeto lėšos</span></p>
                    <p>{Kitos_viesosios_lesos} Eur<br /><span> Kitos viešosios lėšos</span></p>
                    <p>{Privacios_lesos} Eur<br /><span> Privačios lėšos</span></p>
                  </div>
                `
        };
        return feature;
      });
    }).then(function(response) {
      if (response.length > 0) {
        view.popup.open({
          features: response,
          location: event.mapPoint
        });
      }
    }, (error) => { console.error(error); });
  }
}
