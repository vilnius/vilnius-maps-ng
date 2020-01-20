import { Injectable } from '@angular/core';
import { MapService } from '../../map.service';

import StreamLayer = require('esri/layers/StreamLayer');
import Renderer = require('esri/renderers/Renderer');
import Graphic = require('esri/Graphic');
import { IStreamConfig } from './IStreamConfig';
import StreamLayerView = require('esri/views/layers/StreamLayerView');
import Map = require("esri/Map");
import { TimeInterval } from 'rxjs/internal/operators/timeInterval';
import LabelClass = require('esri/layers/support/LabelClass');
import watchUtils = require("esri/core/watchUtils");
import MapView = require('esri/views/MapView');
import Accessor = require('esri/core/Accessor');
import { errorHandler } from '@angular/platform-browser/src/browser';


@Injectable()
export class MapStreamService {
  private stream: StreamLayer;
  private streamLayerView: StreamLayerView;
  private map: Map;
  private watchHandles = [];
  private timeoutID;
  private config: IStreamConfig;
  private id: string;
  private queryParams;
  private streamSuspended = false;
  handle;
  constructor(private mapService: MapService) { }

  addStream(url: string, visible: boolean, title: string, style: string, color = '#ef7f1a', setRotation = false, rotationAttribute = 'direction', stops=null, id) {
    // create stream layer 
    const streamLayer = new StreamLayer({
      url,
      id,
      title,
      visible,
      // outFields: [rotationAttribute, 'Field1', 'Field2'],
      labelsVisible: true,
      purgeOptions: {
        displayCount: 500,
        age: 2
      }
    });

    const rotationRenderer = {
      type: 'simple', // autocasts as new SimpleRenderer()
      symbol: {
        type: 'simple-marker', // autocasts as new SimpleMarkerSymbol()
        style,
        // use an SVG path to create an arrow shape
        // Legend widget doesn't honot path property so legend will be empty
        path: 'M54.15199047330047,1.621444913480601 C36.122233905216476,1.621444913480601 21.505981653418786,16.23769716527829 21.505981653418786,34.26745373336229 C21.505981653418786,52.29742629134226 43.94538793811259,94.34698721310683 54.15199047330047,94.34698721310683 S86.79799929318216,52.29721030144628 86.79799929318216,34.26745373336229 C86.79799929318216,16.23769716527829 72.18174704138447,1.621444913480601 54.15199047330047,1.621444913480601',
        color,
        outline: {
          color: [0, 0, 0, 0.7],
          width: 0.5
        },
        // since the arrow points down, you can set the angle to 180
        // to force it to point up (0 degrees North) by default
        angle: 180,
        size: 15
      },
      visualVariables: [
        {
          type: 'rotation', // indicates that symbols should be rotated based on value in field
          field: (graphic: Graphic) => parseInt(graphic.attributes[rotationAttribute]), // field containing aspect values
          rotationType: 'geographic'
        }
      ]
    } as any as Renderer;

    if (stops) {
      (rotationRenderer as any).visualVariables = [
        ...(rotationRenderer as any).visualVariables,
        stops
      ]
    }

    const labelClass = new LabelClass({
      labelExpressionInfo: { expression: '$feature.Field1' },
      symbol: {
        type: 'text',  // autocasts as new TextSymbol()
        color: 'black',
        haloSize: 1,
        haloColor: 'white'
      } as any
    }) as LabelClass;

    streamLayer.labelingInfo = [labelClass];
    streamLayer.renderer = rotationRenderer;

    return streamLayer;

  }

  createStreamService(config: IStreamConfig, id: string, queryParams=null) {
    const { url, visible = false, title, style, color = '#ef7f1a', setRotation = false, rotationAttribute, stops } = config;
    this.config = config;
    this.id = id;
    this.map = this.mapService.returnMap();
    this.queryParams = queryParams;
    const streamParams = queryParams[id]; 
    this.stream = this.addStream(url, visible, title, style, color, setRotation, rotationAttribute, stops, id);
    this.map.add(this.stream);
    this.setLayerView(this.stream, streamParams);
  }

  setLayerView(stream: StreamLayer, streamParams: string) {
    stream.on('layerview-create', (event) => {
      if (streamParams) {
        this.setdefaultVisibility(event.layerView.layer, streamParams);
      }
      //  yes event.layerView is actual StreamLayerView with all properties and methods
      this.streamLayerView = event.layerView as StreamLayerView;

      // add watch
      this.addWatchProperty('stationary');

    });
  }

  setdefaultVisibility(layer, streamParams: string) {
    // the stream services has only one layer if it is included, layer must be visible
    if (streamParams.split('!').includes('0')) {
      layer.visible = true;
    }
  }

  disconnectSocket() {
    this.timeoutID = setTimeout(() => { 
      // connect / disconnect methods are removed from future API, as listening was moved to webworkers
      // TODO remove layers instead of disconnecting
      this.streamLayerView.disconnect();
      this.streamSuspended = true;
    }, 1000 * 60 * 10);
  }

  clearTimeOut() {
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
      this.timeoutID = null;
    }

  }

  removeStream(fn=null) {
    if (this.streamLayerView) {
      this.streamLayerView.disconnect();
      this.stream.destroy()
      this.map.remove(this.stream);
      this.stream = null;
      this.streamLayerView = null;
    }
    if (fn) {
      fn();
    }

  }

  destroy() {
    // ceck strema because we calling destrou on every Destroy 
    if (this.stream) {
      this.clearTimeOut();
      this.removeStream();
      this.removeHandles();
      this.config = null;
      this.id = null;
      this.streamSuspended = false;
    }

  }


  addWatchProperty(prop: string) {
    const mapView = this.mapService.getView();
    this.disconnectSocket()

    mapView.then((view) => {
      const handle = view.watch(prop, (value: boolean) => {
        // renew disconnection every time and clear previous timers
        this.clearTimeOut();
        this.disconnectSocket()

        if (this.streamSuspended) {
          this.renewStreamLayer();
        }
     
  
      });
      this.watchHandles.push(handle);
    });


  }

  renewStreamLayer() {
    this.clearTimeOut();
    this.removeHandles();
    this.removeStream(() => {
      this.createStreamService(this.config, this.id, this.queryParams);
      this.streamSuspended = false;
    });
  }

  removeHandles(): void {
    this.watchHandles.forEach(handle => {
      handle.remove();
    });
    this.watchHandles = [];
  }

  getStreamLayerView(): StreamLayerView {
    return this.streamLayerView;
  }

}