import { Injectable } from '@angular/core';

import { ObservableInput } from 'rxjs';

import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");

export interface DataStore {
  elderates: any[],
  mainInfo: any[],
  summary: any[],
  info: any[]
}

@Injectable()
export class MapKindergartensService {
  constructor() { }

  getAllQueryDataPromise(urlStr: string, outFields: string[]) {
    let query = this.addQuery();
    const queryTask = this.addQueryTask(urlStr);
    query.where = "1=1";
    query.outFields = outFields;
    query.returnGeometry = false;
    return queryTask.execute(query).then(r => r.features.map(feature => feature.attributes)) as ObservableInput<ObservableInput<any>>;
  }

  addQuery() {
    return new Query();
  }

  addQueryTask(url: string) {
    return new QueryTask({ url });
  }

}
