import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable()
export class ToolsNameService {
  private subject = new Subject<string>();
  currentToolName = this.subject.asObservable()
    .pipe(
			filter(name => name.length > 0)
    );

  setCurentToolName(name: string) {
    this.subject.next(name);
  }
}
