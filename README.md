# Vilnius maps

Vilnius city municipality administration (VCMA) interactive maps based on [ArcGis API] 4.x and [Angular] 6.x

![screenshot](https://raw.githubusercontent.com/anged/vm-ng/master/sreenshot.png)

## Vilnius maps live
[www.maps.vilnius.lt](https://maps.vilnius.lt)

## Start Vilnius maps
Dowload and run the following at the command line to run the app in development mode:
```bash
npm install
npm start
```

Create dev build:
```bash
npm run build
```

Create production build:
```bash
npm run build --prod
```
Note: currently using express js and ejs in production  
  
Check the npm packages described in the package.json.  

## Configuration file
Add default funcionality themes with Dynamic layers based on ArcMaps *.mxd project and REST services to and existing options.ts file


## Example
``` HTML
// Create new theme with default Dynamic layer funcionality

export const MapOptions: any = {
  themes: {
    buildings: { // add new unique theme
      url: "https://maps.vilnius.lt/maps_vilnius/?theme=theme-buildings", // while migrating to ArcGis 4.x is not completely finished use url for static navigation to ArcGis 3.x app
      production: true, // if theme is ready for production
      custom: true, // true if theme funcionality is custom
      name: "Pastatai ir statyba", // theme name
      id: "pastatai-statyba", // theme id class and theme URL query name
      imgUrl: "./app/img/statyba.png", // image URL
      imgAlt: "Pastatai ir statyba", // image alt attribute
      layers: {
        administravimas: { // layer unique name
          dynimacLayerUrls:  // dynamicService URL, only 1 url per uniquer Layer
          "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Pastatu_administravimas/MapServer",
          featureLayerUrls: [
            "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Pastatu_administravimas/MapServer/1"
          ]
        }
      }
    },
    teritory: {
      production: true, // if theme is ready for production
      name: "Teritorijų planavimas", // theme name
      id: "teritoriju-planavimas", // theme id class and theme URL query name
      imgUrl: "./app/img/teritorijos.png", // image URL
      imgAlt: "Teritorijų planavimas", // image alt attribute
      layers: { // best practise to use 1 layer service per theme in order to save as much as possible ArcSOC processes, multiple layers works as well.
        teritorijuPlanavimas: { // layer unique name //
          dynimacLayerUrls:  // dynamicService URL, only 1 url per uniquer Layer
          "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Teritoriju_planavimas/MapServer",
          name: "Teritorijų planavimas:", //name of service
          isGroupService: true, // deprecated in ArcGis API 4.x version
          opacity: 0.9 // opacity from 0 to 1
        }
      }
    }
	}

```

## Resources
* [VMCA Maps built with Esri ArcGis API 3.x ](https://github.com/anged/vm)
* [Example app using the ArcGIS API for JavaScript v3 in an Angular2 app ](https://github.com/tomwayson/angular2-esri-example)
* [Using the ArcGIS API for JavaScript in Applications built with webpack](http://tomwayson.com/2016/11/27/using-the-arcgis-api-for-javascript-in-applications-built-with-webpack/)
* [Create Angular applications with a Webpack based tooling.](https://angular.io/docs/ts/latest/guide/webpack.html)

## Notes
For older commits use package.json with match version exactly instead of compatible with version, see following [commit](https://github.com/anged/vm-ng/commit/f581b1e5a53b3a99a8f0d2bd8583cd2a37706c6d)


NPM 6.1.0  
Node v10.x  
Webpack 4.x  

## ToDo
add Angular CLI  
JIT instead of AOT  
switch to esri-loader  
bundle esri api libraries  
remove unnecessary styles, move to sass  
add tests  
add external options configuration application with OAuth  
refactor :)  

[Angular]:https://angular.io/
[ArcGis API]:https://developers.arcgis.com/javascript/
