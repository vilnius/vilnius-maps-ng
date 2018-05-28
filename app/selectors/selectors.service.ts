import { Injectable } from '@angular/core';

@Injectable()
export class SelectorsService {

  //get unique attributes for future filtering
  getUniqueAttribute(projects: any, name: string) {
    return this.getListArray(projects, name).filter((value, i, array ) => array.indexOf(value) === i);
  }

  //get  array
  getListArray(projects: any, name: string) {
    return projects.map(value => value[name]).sort((a, b) => parseInt(a)-parseInt(b));
  }
}
