import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

function _window(): any {
  return window;
}

@Injectable()
export class WindowRef {
  get nativeWindow() : any {
    return _window() as any;
  }

  uiCollapse$ = new Subject<string>();
}
