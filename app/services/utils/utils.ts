export class Utils {
	static setMenuLayersAnchor() {
		// simply activate :target speudo class with location href
		const hrefArray = window.location.href.split('#');

		// do not activate :target class  when navigating to first page (lenght !==2)
		//  or links doesn't have :target class
		if (hrefArray.length === 2) {
			const target = hrefArray.pop();
			if (target === 'layers') {
				window.location.href = window.location.href;
			}

		}

	}

	static setMenuLayersAnchorOnPageLoad(url = '') {
				window.location.hash = 'layers'
	}

}
