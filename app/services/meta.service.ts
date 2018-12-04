import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MapOptions } from '../options';

@Injectable()
export class MetaService {
	// in production we use express and ejs templates,
	// how ever routing is based on Angular routing
	// so we add basic meta tags when routes changes
	// default title
	title = MapOptions.defaultTitle;

	constructor(private titleService: Title, private metaService: Meta) { }

	setMetaData() {
		const snapshotUrl = window.location.pathname.slice(1);
		let themes: any = MapOptions.themes;
		for (let theme in themes) {
			//if hasOwnProperty and if not custom theme
			if (themes.hasOwnProperty(theme)) {
				let themeId = themes[theme].id; //get unique theme id
				if (themeId === snapshotUrl) {
					let newTitle = themes[theme].name;
					const description = themes[theme].description;
					newTitle ? (newTitle = newTitle + " / " + this.title) : (newTitle = this.title);
					let newMeta = description ? description : newTitle;
					let metadDefinition = {name: 'description', content: newMeta};
					this.metaService.updateTag(metadDefinition);
					this.titleService.setTitle(newTitle);
				}
			}
		}
	}

}
