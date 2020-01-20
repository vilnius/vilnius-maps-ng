import { Injectable } from '@angular/core';

import { MapOptions } from '../../options';
import { MapService } from '../../map.service';

@Injectable()
export class MapDefaultService {
  dynamicLayersArray: any[] = [];
  urlArray: string[] = [];

  constructor(private mapService: MapService) { }

  getUrls(): string[] {
    return this.urlArray;
  }

  // return Dynimac Layers
  initDefaultDynamicLayers(themeServiceUrl: any, id: string, name: string, opacity: number, raster: boolean = false): any {
    let dynamicLayer = this.mapService.initDynamicLayer(themeServiceUrl, id, name, opacity);
    dynamicLayer["isRaster"] = raster;
    return dynamicLayer;
  }

  // get service based on theme
  getDefaultDynamicLayers(urlTheme: string): any[] {
    let themes: any = MapOptions.themes;
    for (let theme in themes) {
      //if hasOwnProperty and if not custom theme
      if ((themes.hasOwnProperty(theme)) && (!themes[theme].custom)) {
        let themeId = themes[theme].id; //get unique theme id
        if (themeId === urlTheme) {
          return this.returnDynamicLayersArray(theme);
        }
      }
    }
  }

  returnDynamicLayersArray(themeId: string): any[] {
    let layers = MapOptions.themes[themeId].layers;
    let layersArr: any[] = [];
    for (let layer in layers) {
      if (layers.hasOwnProperty(layer)) {
        let url = layers[layer].dynimacLayerUrls; //get url
        //init dynaimc layer bases on url and push it to array
        let id = layer; // get id
        let name = layers[layer].name; //get name
        let opacity = layers[layer].opacity;
        let raster = layers[layer].isRaster;
        //do not push service with Raster
        if (!raster) {
          this.urlArray.push(url);
        }
        //opacity ? opacity : opacity = 1;
        layersArr.push(this.initDefaultDynamicLayers(url, id, name, opacity, raster));
      }
    }

    return layersArr;
  }

  //validate ArcGis date string
  isValidDate(dateStr, reg) {
    return dateStr.match(reg) !== null;
  };

  getVisibleLayersContent(result): string {
    let reg = /(\d+)[.](\d+)[.](\d+)\s.*/; //regex: match number with . char, clear everything else
    let feature = result.feature,
      content = " ",
      layerName = result.layerName,
      attributes = feature.attributes;

    feature.attributes.layerName = layerName;

    for (let resultAtr in attributes) {
      if (attributes.hasOwnProperty(resultAtr)) {
        //Filter specific string values
        if (!(resultAtr.toLowerCase() == "objectid" || resultAtr == "layerName" || resultAtr.match(/shape/i) || resultAtr == "Class value" || resultAtr == "Pixel Value" || resultAtr.match(/count/i) ||  resultAtr == "OBJECTID" || resultAtr == "layerName" || resultAtr == "SHAPE" || resultAtr == "SHAPE.area" || resultAtr == "OID" || resultAtr == "Shape.area" || resultAtr == "SHAPE.STArea()" || resultAtr == "Shape" || resultAtr == "SHAPE.len" || resultAtr == "Shape.len" || resultAtr == "SHAPE.STLength()" || resultAtr == "SHAPE.fid" ||
          resultAtr == "Class value" || resultAtr == "Pixel Value" || resultAtr == "Count_" //TEMP check for raster and other str properties, use match case insensitive where possible
        )) { //add layers attributes that you do not want to show
          //AG check for date string
          if (this.isValidDate(attributes[resultAtr], reg)) {
            let attributeDate = attributes[resultAtr]; 
            content += "<p><span>" + resultAtr + "</br></span>" + attributes[resultAtr].replace(reg, '$1-$2-$3') + "<p>";
          } else {
            var attributeResult = attributes[resultAtr];
            if (attributeResult !== null) { //attributes[resultAtr] == null  equals to (attributes[resultAtr]  === undefined || attributes[resultAtr]  === null)
              if ((attributeResult === " ") || (attributeResult === "Null")) {
                attributeResult = "-";
              }

            } else {
              attributeResult = "-";
            }
            //check if url contains http or https  + :// string with regex, TODO refactor
            if (attributeResult.match("^https?://", "i")) {
              content += `<p><span>${resultAtr}</br></span><a href='${attributeResult}' rel="noopener noreferrer" target='_blank'>Nuoroda</a><p>`;
            } else {
              content += "<p><span>" + resultAtr + "</br></span>" + attributeResult + "<p>";
            }

          }
        } else if (resultAtr == "Class value" || resultAtr == "Pixel Value") {
          //TEMP check for raster properties 	and add custom msg
          content = '<p class="raster">Išsamesnė sluoksnio informacija pateikiama Meniu lauke <strong>"Žymėjimas"</strong></p>';
        }

      }
    }
    return content;
  }

}
