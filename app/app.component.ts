import { Component, OnInit } from '@angular/core';

import { Title, Meta }     from '@angular/platform-browser';

import { MapOptions } from './options';

@Component({
  selector: 'vilnius-maps',
  templateUrl: './app/app.component.html'
})
export class AppComponent implements OnInit {
  title = 'Vilniaus interaktyvūs žemėlapiai';
  snapshotUrl: string;

  constructor(private titleService: Title, private metaService: Meta) { }

  ngOnInit() {
      this.snapshotUrl = window.location.pathname.slice(1);
      let themes: any = MapOptions.themes;
      for (let theme in themes) {
        //if hasOwnProperty and if not custom theme
        if (themes.hasOwnProperty(theme)) {
          let themeId = themes[theme].id; //get unique theme id
          if (themeId === this.snapshotUrl) {
            let newTitle = themes[theme].name;
            const description = themes[theme].description;
            newTitle ? (newTitle = newTitle + " / " + this.title) : (newTitle = this.title);
            let newMeta = description ? description : newTitle;
            //current meta
            let metaElement = this.metaService.getTags('name=description');
            //add meta const name: MetaDefinition = {name: 'application-name', content: 'Name of my application'};
            let metadDefinition = {name: 'description', content: newMeta};
            this.metaService.updateTag(metadDefinition);
            //set titles
            this.titleService.setTitle(newTitle);
          }
        }
      }

      //create link tag for oembed
      //TODO change to server side link tag
      const currentUrl = window.location.href;
      let link = document.createElement('link');
      link.rel = 'alternate';
      link.type = 'text/json+oembed';
      link.href = `http://vilniausplanas.lt/oembed/?url=${currentUrl}`;
      document.head.appendChild(link);
  }
}
