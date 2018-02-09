import { Component, Input, OnInit, OnChanges, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Chart } from 'chart.js';

import{ MapWidgetsService } from './map-widgets.service';

@Component({
  selector: 'sidebar-map',
  template: `
    <div [class.heat-sidebar]="sidebarHeatContent" class="col-xs-6 col-md-4 r-sidebar sidebar-right">
      <p class="build-p">{{title}}</p>
      <ng-content ></ng-content>
      <div id="build-inner" class="inner sub-build">
        <ng-container [ngTemplateOutlet]="sidebarHeatContent && heatContent"></ng-container>
        <ng-container [ngTemplateOutlet]="heatMonthsChart"></ng-container>
        <ng-container [ngTemplateOutlet]="heatClassesChart"></ng-container>
        <ng-container [ngTemplateOutlet]="sidebarHeatContent && infoTemplate"></ng-container>
      </div>
    </div>

    <ng-template #heatContent>
      <div [@innerSidebarState]="innerState">
        <h3>{{sidebarHeatContent?.ADRESAS}}</h3>
        <p class="split-half">
          <span class="font-l">sezonas<br /></span>
          {{sidebarHeatContent.SEZONAS}}-{{sidebarHeatContent.SEZONAS+1}}
        </p>
        <p class="split-half">
          <span>klasė<br /></span>
          <span [class.highlight]="sidebarHeatContent.REITING > 6" class="border-r-2">
            <strong>{{sidebarHeatContent.REITING}} ({{sidebarHeatContent.REITINGAS}})</strong>
          </span>
        </p>
        <div class="clear-both"></div>
        <p class="split-half">
          <span class="font-l">sezonas<br /></span>
          {{sidebarHeatContent.SEZONAS-1}}-{{sidebarHeatContent.SEZONAS}}
        </p>
        <p class="split-half">
          <span>klasė<br /></span>
          <span [class.highlight]="sidebarHeatContent.REITING > 6" class="border-r-2">
            <strong>{{sidebarHeatContent.REITING1}}</strong>
          </span>
        </p>
        <div class="clear-both"></div>
        <p class="split-half">
          <span class="font-l">sezonas<br /></span>
          {{sidebarHeatContent.SEZONAS-2}}-{{sidebarHeatContent.SEZONAS-1}}
        </p>
        <p class="split-half">
          <span>klasė<br /></span>
          <span [class.highlight]="sidebarHeatContent.REITING > 6" class="border-r-2">
            <strong>{{sidebarHeatContent.REITING2}}</strong>
          </span>
        </p>
        <div class="clear-both"></div>

        <div class="bt-wrapper">
          <p class="build-bt build-top" (click)="openSidaberGroup('classes')">
            <span class="animate">Bendro tipo namų klasių grafikas</span>
          </p>
          <p class="build-bt build-top" (click)="openSidaberGroup('months')">
            <span class="animate">Namo šilumos suvartojimo grafikas</span>
          </p>
          <p class="build-bt build-top" (click)="openSidaberGroup('info')">
            <span class="animate">Papildoma informacija</span>
          </p>
        </div>
      </div>
    </ng-template>
    <ng-template #heatMonthsChart>
      <div class="heat-months-graphic sidebar-container" [@monthsState]="sidebarMonthsState">
        <div class="build-p sidebar-header" (click)="closeSidaberGroup('months')"> <a href="javascript:void(0)" class="button close animate build-close">Atgal</a></div>
        <div class="heat-title"><p>Mėnesiniai šilumos suvartojimai
pagal mokėjimus už šilumą

        <span class="heat-tip"><span
          class="heat-highlight border-r-2"
          [popper]="'Mėnesinis šilumos suvartojimas pagal mokėjimus už šilumą yra įtakojamas normatyvinio karšto vandens gyvatuko ir netolygaus gyventojų karšto vandens suvartojimo, todėl šis kiekis neturi sutapti su Faktiniu kiekvieno pastato išskaičiuotu vartojimu (žiūrėti į 1 grafą)'"
          [popperTrigger]="'hover'"
          [popperPlacement]="'bottom'"
        >Paaiškinimas</span></span></p></div>
        <canvas width="326" height="400" #mChart></canvas>
      </div>
    </ng-template>
    <ng-template #heatClassesChart>
      <div class="heat-classes-graphic sidebar-container" [@classesState]="sidebarClassesState">
        <div class="build-p sidebar-header" (click)="closeSidaberGroup('classes')"> <a href="javascript:void(0)" class="button close animate build-close">Atgal</a></div>

        <div class="heat-title"><p>Faktinio energijos vartojimo klasė (metinė)
        <span class="heat-tip"><span
          class="heat-highlight border-r-2"
          [popper]="'Eliminuotos normatyvinio karšto vandens gyvatuko ir netolygaus gyventojų karšto vandens deklaravimo įtakos bei skirtingų šildymo sezonų trukmės ir skirtingų sezonų išorės temperatūrų įtakos'"
          [popperTrigger]="'hover'"
          [popperPlacement]="'bottom'"
        >Paaiškinimas</span></span>
        </p></div>
        <canvas width="326" height="400" #cChart></canvas>
        <div class="heat-info"><p>Grafike vaizduojama paskutinio šildymo sezono <strong>{{heatingClassesData?.totalResults}}</strong> namų palyginimas pagal energijos
          <a
            href="./app/docs/metodika_2013.pdf"
            target="_blank"
            [popper]="'Faktinio Energijos Vartojimo Klasė (FEVK) yra dydis, kuris parodo faktinį sunaudotos šilumos kiekį 1 m2 patalpų šildymui, eliminavus skirtingų šildymo sezonų įtakas pagal specialią skaičiavimo metodiką.  Šį dydį galima lyginti tarp skirtingų šildymo sezonų ir skirtingų ploto pastatų (šildymo sezonai turi skirtingą trukmę ir temperatūras, skaičiavimams imamas ne „normatyvinis“ gyvatukas, kiti deklaruoti dydžiai, o faktiniai dydžiai.  Pastatai pagal energijos vartojimą patalpų šildymui yra suskirstyti į 15 klasių. Mažiausiai šilumos patalpų šildymui vartoja 1-os klasės, daugiausiai 15 klasės pastatas.'"
            [popperTrigger]="'hover'"
            [popperPlacement]="'top'"
          >vartojimo klasę</a>
          <span
            [style.background-color]="selectionByTypeState ? '#e61c24' : '#ececec' "
            [style.color]="selectionByTypeState ? '#fff' : '#4c4c4c' "
            class="heat-highlight border-r-2 type-no"
            [popper]="popperContent"
            [popperTrigger]="'hover'"
            [popperPlacement]="'top'"
            (click)="selectBuildingsByType()"
          > {{sidebarHeatContent?.TIPINIS_PR}}
        </span> tipo namuose</p></div>
        <popper-content #popperContent>
         <span *ngIf="!selectionByTypeState else message">Žemėlapyje filtruokite tik šio tipo namus</span>
         <ng-template #message>Naikinti šio tipo namų filtravimą</ng-template>
       </popper-content>
      </div>
    </ng-template>
    <ng-template #infoTemplate>
      <div class="sidebar-container" [@infoState]="sidebarInfoState">
        <div class="build-p sidebar-header" (click)="closeSidaberGroup('info')"> <a href="javascript:void(0)" class="button close animate build-close">Atgal</a></div>
        <div class="main-s-content">
          <p>
            <span>Prižiūrinti organizacija<br /></span>
            {{sidebarHeatContent.PRIEZIURA}}
          </p>
          <p>
            <span>Tipinių namų rūšiavimas<br /></span>
            {{sidebarHeatContent.TIPINIS_PR}}
          </p>
          <p>
            <span>Statybos metai<br /></span>
            {{sidebarHeatContent.STATMETAI}}
          </p>
        </div>
        <div class="heat-info">
          <p><a href="http://www.vilnius.lt/lit/daugiabuciu_namu_atnaujinimas_modernizav/4234">Daugiabučių namų atnaujinimo tvarka</a></p>
          <p>Šilumos suvartojimo duomenys - UAB "Vilniaus energija"</p>
          <p>Kilus klausimams kreiptis <a href="mailto:e.vicemeras@vilnius.lt">e.vicemeras@vilnius.lt</a></p>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ['./app/map-widgets/sidebar.component.css'],
  animations: [
    trigger('innerSidebarState', [
      state('s-close', style({
        transform: 'translateX(326px)'
      })),
      state('s-open',   style({
        transform: 'translateX(0)'
      })),
      transition('s-open => s-close', animate('100ms ease-in')),
      transition('s-close => s-open', animate('100ms ease-out'))
    ]),
    trigger('classesState', [
      state('s-close', style({
        transform: 'translateX(326px)'
      })),
      state('s-open',   style({
        transform: 'translateX(0)'
      })),
      transition('s-open => s-close', animate('100ms ease-in')),
      transition('s-close => s-open', animate('100ms ease-out'))
    ]),
    trigger('monthsState', [
      state('s-close', style({
        transform: 'translateX(326px)'
      })),
      state('s-open',   style({
        transform: 'translateX(0)'
      })),
      transition('s-open => s-close', animate('100ms ease-in')),
      transition('s-close => s-open', animate('100ms ease-out'))
    ]),
    trigger('infoState', [
      state('s-close', style({
        transform: 'translateX(326px)'
      })),
      state('s-open',   style({
        transform: 'translateX(0)'
      })),
      transition('s-open => s-close', animate('100ms ease-in')),
      transition('s-close => s-open', animate('100ms ease-out'))
    ])
  ]
})

export class SidebarComponent implements OnInit, OnChanges {
  @Input() title;
  @Input() mainSidebarState;
  @Input() sidebarHeatContent;
  @ViewChild('mChart') heatMonthsChart: ElementRef;
  @ViewChild('cChart') heatClassesChart: ElementRef;

  heatingMonthsData: any;
  heatingClassesData: any;
  monthsChart: Chart;
  classesChart: Chart;
  lastHeatingYear: number;

  innerState =  's-close';
  sidebarMonthsState =  's-close';
  sidebarClassesState =  's-close';
  sidebarInfoState =  's-close';

  selectionByTypeState = false;

  constructor(private mapWidgetsService: MapWidgetsService) { }

  ngOnInit() {
    !this.title && (this.title = 'Informacija');
    //console.log('Tooltip', Tooltip);
  }

  selectBuildingsByType() {
    this.selectionByTypeState = !this.selectionByTypeState;
    this.mapWidgetsService.selectBuildingsByType(this.sidebarHeatContent.TIPINIS_PR, this.selectionByTypeState);
  }

  openSidaberGroup(name: string) {
    switch(name) {
      case 'months':
        this.sidebarMonthsState = 's-open';
        break;
      case 'classes':
        this.sidebarClassesState = 's-open';
        break;
      case 'info':
        this.sidebarInfoState = 's-open';
        break;
    }
  }

  closeSidaberGroup(name: string = '') {
    switch(name) {
      case 'months':
        this.sidebarMonthsState = 's-close';
        break;
      case 'classes':
        this.sidebarClassesState = 's-close';
        break;
      case 'info':
        this.sidebarInfoState = 's-close';
        break;
      default:
        this.sidebarMonthsState =  's-close';
        this.sidebarClassesState =  's-close';
        this.sidebarInfoState =  's-close';
    }

    //diselect buildigns by type if their are selected
    if (this.selectionByTypeState) {
      this.selectBuildingsByType();
    }
  }

  initHeatMonthsGraphic() {
    const el = this.heatMonthsChart.nativeElement.getContext('2d');
    this.monthsChart && this.monthsChart.clear();
    const datasets = [
      {
        label: `${this.lastHeatingYear}-${this.lastHeatingYear+1} m`,
        data: this.initMonthsDataset()[this.lastHeatingYear],
        backgroundColor: [
            'rgba(150, 106, 236, 0.2)'
        ],
        borderColor: [
            'rgba(150, 106, 236, 1)'
        ],
        borderWidth: 1,
        pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
        pointHoverBorderColor: 'rgba(150, 106, 236, 1)',
        pointBorderColor: 'rgba(255, 255, 255, 1)',
        pointBackgroundColor: 'rgba(150, 106, 236, 1)',
        pointHoverRadius: 5,
        pointRadius: 5
      },
      {
          label: `${this.lastHeatingYear-1}-${this.lastHeatingYear} m`,
          data: this.initMonthsDataset()[this.lastHeatingYear-1],
          backgroundColor: [
              'rgba(153, 195, 146, 0.2)'
          ],
          borderColor: [
              'rgba(153, 195, 146, 1)'
          ],
          borderWidth: 1,
          pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
          pointHoverBorderColor: 'rgba(153, 195, 146, 1)',
          pointBorderColor: 'rgba(255, 255, 255, 1)',
          pointBackgroundColor: 'rgba(153, 195, 146, 1)',
          pointHoverRadius: 5,
          pointRadius: 5
      },
      {
          label: `${this.lastHeatingYear-2}-${this.lastHeatingYear-1} m`,
          data: this.initMonthsDataset()[this.lastHeatingYear-2],
          backgroundColor: [
              'rgba(222, 135, 71, 0.2)'
          ],
          borderColor: [
              'rgba(222, 135, 71, 1)'
          ],
          borderWidth: 1,
          pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
          pointHoverBorderColor: 'rgba(222, 135, 71, 1)',
          pointBorderColor: 'rgba(255, 255, 255, 1)',
          pointBackgroundColor: 'rgba(222, 135, 71, 1)',
          pointHoverRadius: 5,
          pointRadius: 5
      }
    ];
    if (!this.monthsChart) {
      this.monthsChart = new Chart(el, {
        type: 'line',
        data: {
            labels: ["Spalis", "Lapkritis", "Gruodis", "Sausis", "Vasaris", "Kovas", "Balandis"],
            datasets
        },
        options: {
            tooltips: {
              caretSize: 0
            },
            legend:  {
              display: true
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: 'kWh/m²'
                    },
                    ticks: {
                      beginAtZero: false
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: 'Mėnuo'
                    },
                    gridLines: {
                      display: false
                    },
                    ticks: {
                      beginAtZero: false
                    }
                }]
            }
        }
      });
    } else {
      this.monthsChart.data.datasets = datasets;
      this.monthsChart.update();
    }
  }

  initMonthsDataset() {
    const dataset = {};
    this.heatingMonthsData.forEach(set=> {
      const att = set.attributes;
      dataset[att.SEZONAS] = [
        att.SPAL_KW,
        att.LAPKR_KW,
        att.GRUOD_KW,
        att.SAUS_KW,
        att.VASAR_KW,
        att.KOVAS_KW,
        att.BALAN_KW
      ];
    });
    return dataset;
  }

  initClassesData() {
    const labels = this.heatingClassesData.classes.map(label => label + ' klasė');
    const data = {
      labels,
      datasets: [{
        label: null,
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 2
      }]
    };
    const dataset = data.datasets[0];
    this.heatingClassesData.classes.forEach((name) => {
      dataset.label = this.heatingClassesData.dataByClasses[name].label + ', viso pastatų: ';
      dataset.data.push(this.heatingClassesData.dataByClasses[name].count);
      dataset.backgroundColor.push(this.heatingClassesData.dataByClasses[name].color);
      dataset.borderColor.push(this.heatingClassesData.dataByClasses[name].strokeColor);
    });
    return data;
  }

  initHeatClassesGraphic() {
    const el = this.heatClassesChart.nativeElement.getContext('2d');
    this.classesChart && this.classesChart.clear();
    const data = this.initClassesData();
    if (!this.classesChart) {
      this.classesChart = new Chart(el, {
        type: 'bar',
        data,
        options: {
          tooltips: {
            position: 'nearest',
            callbacks: {
              //bug: cutting off long label
              //solution: split label and add beforeTitle
              label: function(tooltipItem, data) {
                const label = data.datasets["0"].label.split(',')[1];
                const result = data.datasets["0"].data[tooltipItem.index];
                return label + result;
             },
              beforeTitle: function(tooltipItems, data) {
               return data.datasets["0"].label.split(',')[0];
             },
              title: (tooltipItem, chart) => {
                return '';
              } //add empty string
            }
          },
          legend:  {
            display: false
          },
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Namų skaičius'
              },
              ticks: {
                beginAtZero: true
              }
            }]
            ,
            xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Faktinio energijos suvartojimo klasė'
                },
                offset: true,
                gridLines: {
                  offsetGridLines: false,
                  display: false
                },
                barPercentage: 0.6,
                ticks: {
                  beginAtZero: false
                }
            }]
          }
        }
      });
    } else {
      this.classesChart.data = data;
      this.classesChart.update();
    }
  }

  ngOnChanges() {
    this.closeSidaberGroup();
    //close main heat content while adding animation
    this.innerState = 's-close';
    //console.log('%c Canvas', 'background: blue; color: white', this.heatMonthsChart);
    if (this.sidebarHeatContent && (this.mainSidebarState === 's-open')) {
      //add setTimeout  for main heat content animation
      setTimeout(()=>{
        this.innerState = 's-open';
      }, 200);
      this.lastHeatingYear = this.sidebarHeatContent.SEZONAS;
      //get data by months
      this.mapWidgetsService.queryHeatingDataByMonths(this.sidebarHeatContent.SEZONAS, this.sidebarHeatContent.ID_NAMO).then(data=> {
        this.heatingMonthsData = data;
        this.heatMonthsChart && this.initHeatMonthsGraphic();
      });
      //get data by house type and heat classes
      this.mapWidgetsService.queryHeatingDataByClasses(this.sidebarHeatContent.TIPINIS_PR, this.sidebarHeatContent.REITING).then(data=> {
        this.heatingClassesData = data;
        this.heatClassesChart && this.initHeatClassesGraphic();
      });
    }
  }
}
