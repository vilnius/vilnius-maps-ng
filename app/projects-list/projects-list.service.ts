import { Injectable } from '@angular/core';

import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");

import { Subject } from 'rxjs';
import { map, first } from 'rxjs/operators';

@Injectable()
export class ProjectsListService {

  private projectsByExtent: any[] = [];
  private projectsByWord: any[] = [];

  //radio buttons data binding for filtering by map or by word
  //using for direct viewing on map with hitTest method as well
  mainFilterCheck: String = 'word';

	// FIXME remove subject, change to Osbervable or remove multiple conncection to Subject
  private projectsSubject = new Subject<any>();
  galleryArr = this.projectsSubject.asObservable();
  fullListItem = this.projectsSubject.asObservable().pipe(
      map(item => item.map(innerItem => { return { attributes: innerItem.attributes } })),
			first()
  );

  getProjects() {
    return this.projectsByExtent;
  }

  getAllProjects() {
    return this.projectsByWord;
  }

  filterAutoComplete(projects: any) {
    //return projects for autocomplete filters if we want to filter by extent list
    return this.projectsByWord = projects;
    //return projects for autocomplete filters if we want to filter full list
  }

  runProjectsQuery(urlStr: string, queryExpression: any, inputValue) {
    let query = new Query();
    //console.log("QUERY on and out EXTENT");
    //return geometry in order to get popup and graphic on list click
    query.returnGeometry = true;

    // if input value is empty asign to empty string, else make additiniol sql query
    // UPDATED words are filtered same way if first letter is uppercase or lowercase
    // TODO make search by word case insesitive
    let valueAutocomplete = inputValue.length > 0 ? "((Pavadinimas LIKE '%" + inputValue.charAt(0).toLowerCase() + inputValue.slice(1) + "%')" + " OR " + "(Pavadinimas LIKE '%" + inputValue.charAt(0).toUpperCase() + inputValue.slice(1) + "%'))" : "";
    query.outFields = ["*"];
    //check if query expression was set by filters
    typeof (queryExpression) !== "undefined" ? query.where = "(" + queryExpression + ")" : query.where = "";
    let queryTask = this.QueryTask(urlStr);
    let task;
    //console.log(query)
    if ((queryExpression.length === 0) && (valueAutocomplete.length === 0)) {
      query.where = "1=1";
    } else if ((queryExpression.length === 0) && (valueAutocomplete.length > 0)) {
      query.where = valueAutocomplete;
    } else if ((queryExpression.length > 0) && (valueAutocomplete.length > 0)) {
      query.where += " AND " + valueAutocomplete;
    }

    return queryTask.execute(query).then((result) => {
      task = result.features;
      this.projectsByWord = task;
      //console.log(task);
      return task;
    }, (error) => { console.error(error); });
  }

  runProjectsQueryExtent(urlStr: string, extent: Object, queryExpression: any) {
    let query = this.Query(extent);
    //console.log("QUERY on and in EXTENT");
    //return geometry in order to get popup and graphic on list click
    query.returnGeometry = true;

    query.outFields = ["*"];
    //check if query expression was set by filters
    typeof (queryExpression) !== "undefined" ? query.where = queryExpression : query.where = "";
    let queryTask = this.QueryTask(urlStr);
    let task;
    return queryTask.execute(query).then((result) => {
      task = result.features;
      this.projectsByExtent = task;
      return task;
    }, (error) => { console.error(error); });
  }

  //get full list of existing projects
  getAllProjectsQueryData(urlStr: string) {
    //console.log("QUERY on INIT");
    let query = new Query();
    //get all data
    query.where = "1=1";
    query.outFields = ["*"];
    let queryTask = this.QueryTask(urlStr);
    queryTask.execute(query).then((result) => {
      //this.fullListObs.next(result.features);
      this.projectsSubject.next(result.features);
      return result.features;
    }, (error) => { console.error(error); });
  }

  //get popup content
  getPopUpTitle(attributes: any) {
    return attributes.Pavadinimas;
  }
  //get popup content
  //whenever getPopUpContent executes in projectsService, Observable is beeing subscribed on projectsListComponent and added to popup
  //pass selection string to indentify that content is for selected graphic, so Observable must not be used
  getPopUpContent(attributes: any, selection: string = "") {
    let TemaID = attributes.TemaID,
      uniqueID = attributes.UNIKALUS_NR,
      Tema = attributes.Tema,
      //set title to empty string
      galleryTitle = "",
      galleryImages = (function() {
        //console.log('attributes', attributes)
        //use ==, as with identify method we receive only string values (values are converted to string by API),
        if (attributes.PAV == 1) {
          let arr;
          galleryTitle = '<p>Nuotraukų galerija:</p><img id="gallery-loader"style="width: 20px; margin: 20px auto; display: block" src="app/img/ajax-loader.gif">';
          //return gallery based on number of images
          switch (parseInt(attributes.PAV_K)) {
            case 2:
              arr = [
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_1_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_1.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_2_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_2.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                }
              ];
              break;
            case 3:
              arr = [
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_1_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_1.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_2_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_2.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_3_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_3.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                }
              ];
              break;
            case 4:
              arr = [
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_1_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_1.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_2_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_2.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_3_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_3.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_4_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_4.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                }
              ];
              break;
            case 5:
              arr = [
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_1_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_1.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_2_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_2.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_3_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_3.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_4_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_4.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_5_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_5.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                }
              ];
              break;
            case 6:
              arr = [
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_1_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_1.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_2_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_2.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_3_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_3.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_4_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_4.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_5_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_5.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                },
                {
                  thumbnail: "./app/img/projects/thumbnail/U_" + uniqueID + "_6_tn.jpg",  //image src for the thumbnail
                  image: "./app/img/projects/U_" + uniqueID + "_6.jpg"//, //image src for the image
                  //text: Tema //optional text to show for the image
                }
              ];
              break;
              default:

                arr =  [
                    {
                      thumbnail: "./app/img/projects/U_" + uniqueID + "_1.jpg",  //image src for the thumbnail
                      image: "./app/img/projects/U_" + uniqueID + "_1.jpg"//, //image src for the image
                      //text: Tema //optional text to show for the image
                    }
                  ];
            }
        return arr;
      } else {
        return [];
      }
    })(),
      Busena = '<p><span>Projekto būsena</span><br /><span class="type-' + attributes.Busena[0] + ' projects-theme"></span>' + attributes.Busena + '</p>',
      Statusas = attributes.Statusas ? '<p><span>Etapas</span><br />' + attributes.Statusas + '</p>' : "",
      Partneris = attributes.Projekto_partneris ? '<p><span>Partneris</span><br />' + attributes.Projekto_partneris + '</p>' : "",
      Projekto_aprasymas = attributes.Projekto_aprasymas ? "<p><span>Aprašymas</span><br />" + attributes.Projekto_aprasymas + "</p>" : "-",
      Igyvend_NUO = attributes.Igyvend_NUO ? attributes.Igyvend_NUO : "-",
      Igyvend_IKI = attributes.Igyvend_IKI ? '– ' + attributes.Igyvend_IKI : '',
      //Lesos : remove values of sum in EURO that eaquals 0 string
      Projekto_verte = attributes.Projekto_verte ? (attributes.Projekto_verte[0] !== '0' ? '<p><span>Projekto vertė</span><br />' + attributes.Projekto_verte + ' Eur</p>' : '') : '',
      ES_investicijos = attributes.ES_investicijos ? (attributes.ES_investicijos[0] !== '0' ? '<p><span>Europos Sąjungos investicijos</span><br />' + attributes.ES_investicijos + ' Eur</p>' : '') : '',
      Savivaldybes_biudzeto_lesos = attributes.Savivaldybes_biudzeto_lesos ? (attributes.Savivaldybes_biudzeto_lesos[0] !== '0' ? '<p><span>Savivaldybės biudžeto lėšos</span><br />' + attributes.Savivaldybes_biudzeto_lesos + ' Eur</p>' : '') : "-",
      Valstybes_biudzeto_lesos = attributes.Valstybes_biudzeto_lesos ? (attributes.Valstybes_biudzeto_lesos[0] !== '0' ? '<p><span>Valstybės biudžeto lėšos</span><br />' + attributes.Valstybes_biudzeto_lesos + ' Eur</p>' : '') : '',
      Kitos_viesosios_lesos = attributes.Kitos_viesosios_lesos ? (attributes.Kitos_viesosios_lesos[0] !== '0' ? '<p><span> Kitos viešosios lėšos</span><br />' + attributes.Kitos_viesosios_lesos + ' Eur</p>' : '') : '',
      Privacios_lesos = attributes.Privacios_lesos ? (attributes.Privacios_lesos[0] !== '0' ?  (attributes.Privacios_lesos[0] !== 'N' ? '<p><span> Privačios lėšos</span><br />' + attributes.Privacios_lesos + ' Eur</p>' : '') : '') : '',
      //TODO some attr has http:// prefix, filter it
      Nuoroda_i_projekta = attributes.Nuoroda_i_projekta ? (attributes.Nuoroda_i_projekta.slice(0, 4) === "http" ? '<p><span>Projekto nuoroda</span><br /><a href="' + attributes.Nuoroda_i_projekta + '" target="_blank">' + attributes.Nuoroda_i_projekta + '</a></p>' : '<p><span>Projekto nuoroda</span><br /><a href="http://' + attributes.Nuoroda_i_projekta + '" target="_blank">' + attributes.Nuoroda_i_projekta + '</a></p>') : '',
      Programa = attributes.Programa ? '<p><span>Programa </span><br />' + attributes.Programa + '</p>' : '',
      Vykdytojas = attributes.Vykdytojas ? '<p><span>Vykdytojas</span><br />' + attributes.Vykdytojas + '</p>' : '',
      Kontaktai = attributes.Kontaktai ? '<p><span>Kontaktai</span><br /><a href="mailto:' + attributes.Kontaktai + '">' + attributes.Kontaktai + '</a></p>' : '';

    //push onto subject unless we are generating content for selection graphic
    //this.galleryObs.next([]); //return to destroy compontent // bug fix
    //selection === "selection" ? "" : this.galleryObs.next(galleryImages);
    selection === "selection" ? "" : this.projectsSubject.next(galleryImages);

    // return string interpolation
    return `<div class="esri-popup-renderer">
              <div class="esri-popup-renderer__text esri-popup-renderer__content-element">
                <p><span>Tema</span><br /><span class="n${TemaID}-theme projects-theme"></span> ${Tema} </p>
                ${Busena}
                ${Statusas}
                ${Projekto_aprasymas}
                <p><span>Įgyvendinimo trukmė</span><br />${Igyvend_NUO} ${Igyvend_IKI} m.</p>
                ${Nuoroda_i_projekta}
                ${Programa}
                ${Vykdytojas}
                ${Partneris}
                ${Kontaktai}
                <div class="finance-list">
                  <div>
                  ${Projekto_verte}
                  </div>
                  ${ES_investicijos}
                  ${Savivaldybes_biudzeto_lesos}
                  ${Valstybes_biudzeto_lesos}
                  ${Kitos_viesosios_lesos}
                  ${Privacios_lesos}
                </div>

                <div id="gallery-container">${galleryTitle}</div>
              </div>
            </div>`;
  }

  Query(extent: Object = false) {
    if (extent) {
      return new Query({ geometry: extent });
    } else {
      return new Query();
    }
  }

  QueryTask(urlStr: string) {
    return new QueryTask({
      url: urlStr
    });
  }

  //get active name of the filter
  getFilterListName() {
    return this.mainFilterCheck;
  }
  setFilterListName(name) {
    this.mainFilterCheck = name;
  }
}
