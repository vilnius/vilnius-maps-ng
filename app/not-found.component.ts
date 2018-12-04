import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

import { Subscription } from 'rxjs';

import { MapOptions } from './options';

@Component({
  selector: 'themes-map',
  template: `
    <div class="vp-maintenance" >
      <div class="vp-msg-wrap" >
        <img src="./app/img/vilnius_logo.png" border= "0" alt= "Vilnius logo" >
        <h2>{{message}}</h2>
        <p>Peržiūrėkite <a routerLink="/">visas temas</a></p>
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
      background: rgba(54, 52, 53, 1);
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
    p {
      color: #fff;
      font-size: 20px;
    }
    a:hover {
      border-bottom: 1px solid #e61c24;
    }
  `]
})
export class NotFoundComponent implements OnInit {
  //execution of an Observable,
  queryUrlSubscription: Subscription;

  message = MapOptions.notFound.msg;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.queryUrlSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParam: any) => {
        //navigate specific legacy map urls
        if (queryParam['theme'] === 'teritory-planning') {
          this.router.navigate(['/teritoriju-planavimas']);
        }
      }
    );
    this.queryUrlSubscription.unsubscribe();
  }
}
