import { Component } from '@angular/core';

import { MapOptions } from '../options';

@Component({
  selector: 'maintenance-mod',
  template: `
    <div class="vp-maintenance">
      <div class="vp-msg-wrap">
        <img src="./app/img/vilnius_logo.png" border="0" alt="Vilnius logo">
        <h2>{{message}}</h2>
      </div>
    </div>
  `,
  styles: [`
    .vp-maintenance {
      position: fixed;
      height: 100%;
      display: block;
      width: 100%;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      z-index: 30;
      background: rgba(54, 52, 53, 0.8);
    }
    .vp-msg-wrap {
      position: fixed;
      top: 50%;
      -webkit-transform: translateY(-50%);
      -ms-transform: translateY(-50%);
      transform: translateY(-50%);
      text-align: center;
      padding: 0 20px;
      max-width: 860px;
      margin: 0 auto;
      left: 0;
      right: 0;
    }
    .vp-msg-wrap h2 {
      text-align: center;
      line-height: 1.6;
      color: #fff;
    }
    .vp-msg-wrap img {
      width: 140px;
    }
  `]
})

export  class MaintenanceComponent {
  message = MapOptions.maintenance.msg;
  constructor() {}
}
