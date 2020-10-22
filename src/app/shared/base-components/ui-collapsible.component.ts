import { ChangeDetectorRef, OnDestroy, OnInit } from "@angular/core";
import { fromEvent, Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { WindowRef } from "src/app/services/app/window.service";
import { v4 as uuid } from 'uuid';

export interface UICollapsibleConfig {
  collapseOnWindowClick: boolean;
}

export class UICollapsible implements OnInit, OnDestroy {

  protected _isOpen = false;
  destroyed$ = new Subject();
  uuid = uuid();
  uiCollapsibleConfig: UICollapsibleConfig = {
    collapseOnWindowClick: false,
  };

  get isOpen() {
    return this._isOpen;
  }
  set isOpen(isOpen) {
    this._isOpen = isOpen;
    this.window.uiCollapse$.next(this.uuid);
  }

  constructor(
    protected window: WindowRef,
    protected changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    fromEvent(this.window.nativeWindow, 'click')
      .pipe(takeUntil(this.destroyed$))
      .pipe(filter(() => this.uiCollapsibleConfig.collapseOnWindowClick))
      .subscribe(() => {
        this.isOpen = false;
        this.changeDetector.detectChanges();
      });

    this.window.uiCollapse$
      .pipe(takeUntil(this.destroyed$))
      .pipe(filter(x => x !== this.uuid))
      .subscribe((x) => {
        this._isOpen = false;
        this.changeDetector.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}