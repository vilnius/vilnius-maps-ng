import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable()
export class SwipeToolService {
	private subject = new Subject<boolean>();
	toolActive$ = this.subject.asObservable();

  constructor(
  ) { }

	getSwipeStatus() {
		return this.toolActive$;
	}

	closeSwipe() {
		this.subject.next(false);
	}

	toggleSwipe(state) {
			this.subject.next(state);
	}

}
