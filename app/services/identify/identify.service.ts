import { Injectable } from '@angular/core';

import IdentifyTask = require ("esri/tasks/IdentifyTask");
import IdentifyParameters = require ("esri/tasks/support/IdentifyParameters");

@Injectable()
export class IdentifyService {

  //identify for mapservice only
    identify(layer: any) {
        return new IdentifyTask(layer);
    }

    identifyParams() {
      return new IdentifyParameters();
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
