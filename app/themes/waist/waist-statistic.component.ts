import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, DoCheck } from '@angular/core';
import { MapService } from '../../map.service';

@Component({
  selector: 'waist-statistic',
  templateUrl: './app/themes/waist/waist-statistic.component.html',
  styles: [`
    :host {
      position: fixed;
      bottom: 77px;
      background-color: #fff;
      margin: 0 auto;
      right: 0;
      left: 0;
      max-width: 400px;
      padding: 10px;
      background: rgba(250, 250, 250, 0.85);
      z-index: 7;
    }

    .flex-container {
      padding: 0;
      margin: 0;
      list-style: none;
      display: -webkit-box;
      display: -moz-box;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      justify-content: space-around;
      flex-flow: row wrap;
      -webkit-flex-flow: row wrap;
    }
    
    .flex-item {
      padding: 5px;
      width: 48%;
      height: auto;
      margin-top: 5px;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    p {
      font-size: 30px;
      letter-spacing: -0.8px;
    }

    h2:first-child {
      float: none;
      margin-left: 0;
    }

    .waist-stat__name {
      display: block;
      padding-top: 2px;
      font-size: 15px;
      font-weight: 400;
      color: #4c4c4c;
      line-height: 1;

      letter-spacing: 0.02px;
    }

    .waist-stat__count {
      background: #00ff6a;
      padding: 2px 5px;
      border-radius: 2px;
    }

    .waist-stat--late {
      background: #ffc045;
    }

    .waist-stat__alert {
      background: #e61c24;
      padding: 2px 5px;
      color: #fff;
      border-radius: 2px;
    }
    
    .waist-stat__alert span,
    .waist-stat__count span {
      color: #4c4c4c;
      left: 10px;
    }

    .waist-stat__alert span {
      color: #fff;
    }

  `]
})
export class WaistStatisticComponent implements OnInit, OnChanges {
  @Input() content: any;
  nextDay = ' ';

  constructor(private cdr: ChangeDetectorRef, private mapService: MapService) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.createQuery('https://atviras.vplanas.lt/arcgis/rest/services/Testavimai/Konteineriu_isv_grafikai/MapServer/1');
  }

  doSomethingOnComplete() {

  }

  parseAmount(): number {
    return + this.content.graphic.attributes.Svoris_kg;
  }

  async createQuery(url) {
    const query = this.mapService.addQuery();
    const queryTask = this.mapService.addQueryTask(url);
    query.returnGeometry = false;
    query.where = `Konteinerio_Nr='${this.content.graphic.attributes.Konteinerio_Nr}'`;
    query.outFields = ['*'];
    const results = await queryTask.execute(query).then((result) => {
      return result;
    }, (error) => {
      console.error(error);
    });

    this.getNextDay(results);
  
  }

  getNextDay(result): void {
    // TODO add current date logic when date is null
    const currentDate = this.content.graphic.attributes.Pakelimo_data_laikas_V_short ? this.content.graphic.attributes.Pakelimo_data_laikas_V_short : '2019-03-17';
    let dates = result.features.map((feature => feature.attributes.Planuojama_isvezimo_data_V_striped)).sort();
    if (dates.indexOf(currentDate) + 1) {
      const newDate = dates[dates.indexOf(currentDate) + 1]
      this.nextDay =  newDate ? newDate: '-';
      // console.log('next day',dates, dates.indexOf(currentDate + 1), this.nextDay);

    } else {
      const nDates = [...dates, currentDate].sort();
      const newDate = nDates[nDates.indexOf(currentDate) + 1]
      this.nextDay =  newDate ? newDate: '-';
      // console.log('next day',nDates, currentDate, nDates.indexOf(currentDate + 1), this.nextDay);

    }
    this.cdr.detectChanges();
  }

};


