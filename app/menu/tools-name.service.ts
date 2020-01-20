import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { filter, startWith, distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class ToolsNameService {
  private subject = new Subject<string>();
  currentToolName = this.subject.asObservable()
    .pipe(
			//distinctUntilChanged(),
			filter(name => name.length > 0),
			//startWith('empty')
    );

  setCurentToolName(name: string) {
    this.subject.next(name);
  }
}
