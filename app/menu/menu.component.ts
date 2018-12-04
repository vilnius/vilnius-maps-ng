import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { MapOptions } from '../options';
import { MapService } from '../map.service';
import { ShareButtonService } from '../services/share-button.service';
import { MenuService } from './menu.service';
import { ProfileToolContainerComponent } from './tools/profile/profile-tool-container.component'; // re-export the named thing

import watchUtils = require("esri/core/watchUtils");

@Component({
  selector: 'menu-map',
	entryComponents: [ProfileToolContainerComponent],
  templateUrl: './app/menu/menu.component.html'//,
})
export class MenuComponent implements OnInit, OnDestroy {
  @Input() view: any;
  @Input() allLayerslayer: any;
  //@ViewChild(ProfileElevationComponent) profileElevationComponent: ProfileElevationComponent;
	ProfileToolContainerComponent = ProfileToolContainerComponent;

  mobileActive: boolean = false;

  //add tools active class and remove menu wrapper inm order to use tools on map directly
  toolsActive: boolean = false;
  subLayersActive: any = false;
  subListSubscribtion: Subscription;

  //get all anchor elements and run hash
  //create array from array-like object
  aTagList: any;

  themeName: string;

  visibleSubLayerNumber: number;
  //state if we want to disable help box
  componentsVisibleSubLayerNumberState: number = 1;

  options = MapOptions;

  // check if route changes completely, because we using hash attribute for menu navigation
  // using for progressBar
  route: string;

  //Listen to tools component close event
  onClose(event: boolean) {
    this.toolsActive = event;
  }

  //Hash toggle, get all anchor elements
  constructor(
    private mapService: MapService,
    private router: Router,
    private menuService: MenuService, private shareButtonService: ShareButtonService) {
    // temporary: Hash toggle, reload, new page,
    window.location.hash = '#';
  }

  //activate mobile nav menu
  activateMenuBtn() {
    this.mobileActive = !this.mobileActive;
    window.location.hash = '#';
    let el = document.getElementById('menu-top');
    //activation on mobile devices
    if (this.mobileActive) {
      el.className += " menu-active";
    } else {
      el.classList.remove("menu-active");
    }
  }

  //activate mobile nav menu
  activateMenuBtnOnDesktopMode() {
    this.mobileActive = !this.mobileActive;
    let el = document.getElementById('menu-top');
    //activation on mobile devices
    if (this.mobileActive) {
      el.className += " menu-active";
    } else {
      el.classList.remove("menu-active");
    }
  }

  hash(e) {
    if (window.location.hash === e.currentTarget.getAttribute('href')) {
      window.location.hash = '#closed';
      e.preventDefault();  // AG for JQuery same as": return false (in this case, prevents event handlers after click event)
    }
  }

  closeToggle() {
    window.location.hash = "#";
  }

  //init target pseudo clas on menu
  targetTheme() {
    window.location.hash === "#theme" ? window.location.hash = "#" : window.location.hash = "#theme";
    //set  toolsActive to false and get back menu wrapper for mobile
    this.toolsActive = false;
  }
  targetLayers() {
    window.location.hash === "#layers" ? window.location.hash = "#" : window.location.hash = "#layers";
    //set  toolsActive to false and get back menu wrapper for mobile
    this.toolsActive = false;
  }
  targetLegend() {
    window.location.hash === "#legend" ? window.location.hash = "#" : window.location.hash = "#legend";
    //set  toolsActive to false and get back menu wrapper for mobile
    this.toolsActive = false;
  }
  targetTools() {
    window.location.hash === "#tools" ? window.location.hash = "#" : window.location.hash = "#tools";
    //remove menu wrapper in order to use tools directly on mapPoint
    this.toolsActive = !this.toolsActive;
  }
  targetOpenData() {
    window.location.hash === "#open-data" ? window.location.hash = "#" : window.location.hash = "#open-data";
    //set  toolsActive to false and get back menu wrapper fro mobile
    this.toolsActive = false;
  }



  watchLayers() {
    watchUtils.whenTrue(this.view, "updating", () => {
      this.componentsVisibleSubLayerNumberState = this.menuService.getVisibleSubLayerNumberState();
      //check if help box is enabled with componentsVisibleSubLayerNumberState
      if (this.componentsVisibleSubLayerNumberState) {
        this.getVisibleSubLayerNumber();
      }
    });
  }

  getVisibleSubLayerNumber() {
    this.themeName === "projektai" ? this.visibleSubLayerNumber = this.shareButtonService.getVisibleSubLayerNumber(this.view, true) : this.visibleSubLayerNumber = this.shareButtonService.getVisibleSubLayerNumber(this.view);
  }

  closeSubListHelp() {
    this.visibleSubLayerNumber = null;
    this.componentsVisibleSubLayerNumberState = this.menuService.setVisibleSubLayerNumberState(0);
  }

  toggleSubState() {
    this.menuService.toggleSubListState();
  }

  ngOnInit(): void {
    this.route = this.router.url.slice(1).split('#')[0].split('?')[0];

    //load message about sublayers if they are visible on Init
    this.view.on("layerview-create", (event) => {
      // refresh layer with goTo, since 4.6 API
      // do not refresh when selecting adn creating feature selection layer
      // custom teams usually
      if ((event.layer.type !== 'graphics') && ((event.layer.type === 'map-image'))) {
        const mapView = this.mapService.getView();
        const center = mapView.center
        center.x += 0.001;
        center.y += 0.001;
        mapView.goTo(center);
      }

      //get visibleSubLayerNumber when allLayers layer uis loaded
      event.layer.id === "allLayers" ? this.getVisibleSubLayerNumber() : void (0);
    });

    this.watchLayers();

    //get all anchor elements and run hash
    //create array from array-like object
    this.aTagList = Array.from(document.getElementsByTagName('a'));
    this.aTagList.map(a => a.addEventListener('click', this.hash, false));

    this.themeName = window.location.pathname.slice(1);

    //subscribe to sub layer list button activation
    this.subListSubscribtion = this.menuService.subLayersActivation.subscribe(activeState => {
      //console.log("STATE SUBLAYERS", activeState)
      this.subLayersActive = activeState;
      //get state after subscribe, if help box is closed initiate it
      if ((!this.menuService.getVisibleSubLayerNumberState()) && activeState) {
        this.componentsVisibleSubLayerNumberState = this.menuService.setVisibleSubLayerNumberState(1);
        this.getVisibleSubLayerNumber();
      }
    })


    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event) => {
        // split # if using menuService
        // split ? if using url query params
        this.themeName = this.router.url.slice(1).split('#')[0].split('?')[0];

        // check if route changes completely, because we using hash attribute for menu navigation
        if (this.route !== this.themeName) {
          this.route = this.themeName;
        }

        //console.log('Active Route', this.themeName, this.router.url, event);
      });
  }

  ngOnChanges() {
    //console.log('MENU', this.themeName)
  }

  ngOnDestroy() {
    this.subListSubscribtion.unsubscribe();
  }
}
