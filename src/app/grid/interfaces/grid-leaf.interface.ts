import { RowNode, GridApi } from "ag-grid-community";
import { Component, ChangeDetectorRef, Input, OnInit, OnDestroy, ChangeDetectionStrategy, Provider, Type, ViewEncapsulation } from "@angular/core";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { cloneDeep } from "lodash-es";
import { distinctUntilChanged, takeUntil, tap } from "rxjs/operators";
import { Class } from "src/app/util/decorators/static-implements.decorator";

export enum ViewModeEnum {
  Collapsed = 'collapsed',
  Expanded = 'expanded',
}

export interface iGridLeaf<TData, TContext> extends Component {
  data$: Observable<TData>;
  node: RowNode;
  gridAPI: GridApi;
  context: TContext;
  changeDetector: ChangeDetectorRef;
}

export class GridLeaf<TData, TContext> implements iGridLeaf<TData, TContext>, OnInit, OnDestroy {
  @Input() data$: Observable<TData>;
  @Input() set node(node: RowNode) {
    this._node = node;
  };
  @Input() gridAPI: GridApi;
  @Input() context: TContext;

  get node() { return this._node; }
  protected _node: RowNode;
  data: TData;
  editedData: TData;

  protected destroyed$ = new Subject();

  constructor(
    public changeDetector: ChangeDetectorRef,
    ...args: any[]
  ) {
  }

  ngOnInit() {
    this.data$
      .pipe(
        takeUntil(this.destroyed$),
        distinctUntilChanged((a, b) => a === b)
      )
      .subscribe(data => this.onReceiveData(data));
  }

  onReceiveData(data: TData) {
    this.data = data;
    this.editedData = cloneDeep(data);
    this.changeDetector.detectChanges();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}

export class CollapsibleGridLeaf<TData, TContext> extends GridLeaf<TData, TContext> {
  ViewModeEnum = ViewModeEnum;

  @Input() data$: Observable<TData>;
  @Input() gridAPI: GridApi;
  @Input() set node(node) {
    this._node = node;
    this.viewMode$.next((node as any).viewMode);
  }
  protected viewMode$ = new BehaviorSubject((this.node as any || {}).viewMode || this.defaultViewMode);
  get defaultViewMode() { return CollapsibleGridLeaf.defaultViewMode; }
  static viewHeight() { return 60; }
  static get defaultViewMode() { return ViewModeEnum.Collapsed; }
}

export interface iSubjective<S> {
  subjects: S;
}

export function Subjective<
  S,
  TBase extends Class<any>
>(Base: TBase): TBase&Class<iSubjective<S>> {
  return class extends Base implements iSubjective<S>, OnInit {
    subjects: S;
    constructor(
      ...args: any[]
    ) {
      super(...args);
    }
    ngOnInit() {
      super.ngOnInit();
      this.subjects = this.context.nodeSubjects;
    }
  }
}
