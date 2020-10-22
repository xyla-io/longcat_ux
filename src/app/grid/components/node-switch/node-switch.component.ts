import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { throttleTime, takeUntil } from 'rxjs/operators';
import { ChannelOps, ChannelEnum } from 'src/app/iomap/models/channel';
import { RowNode, GridApi, ICellRendererParams } from 'ag-grid-community';
import { BadgeBubble } from 'src/app/grid/components/badge-category-counts/badge-category-counts.component';
import { iGridLeaf } from '../../interfaces/grid-leaf.interface';

@Component({
  selector: 'app-node-switch',
  templateUrl: './node-switch.component.html',
  styleUrls: ['./node-switch.component.scss']
})
export class NodeSwitchComponent implements OnInit, OnDestroy {
  ChannelOps = ChannelOps;

  @ViewChild('leafContainer', { read: ViewContainerRef, static: true }) leafContainer: ViewContainerRef;

  leafComponentRef: ComponentRef<iGridLeaf<any, any>>;

  gridAPI: GridApi;
  node: RowNode;
  nodeValue: string;
  nodeField: string;
  clicks$: Subject<null> = new Subject();
  destroyed$: Subject<null> = new Subject();
  isPlaceholder: boolean;
  dataSubject$ = new Subject<any>();
  cellRendererParams: ICellRendererParams
  onlyChildIsOwnPlaceholder = false;
  channel?: ChannelEnum;

  context: any;
  bubbles: BadgeBubble[];
  _gridEvents$ = new Subject();
  get gridEvents$(): Observable<any> {
    return this._gridEvents$.asObservable();
  }

  groupNodesContext(nodeField: string) {
    return this.context ? this.context.groupNodes ? this.context.groupNodes[nodeField] : {} : {};
  }

  constructor(
    private resolver: ComponentFactoryResolver,
  ) { }

  ngOnInit() {
    this.clicks$
      .pipe(throttleTime(500))
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.node.setExpanded(!this.node.expanded);
        this.gridAPI.resetRowHeights();
      })
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  registerGridEvents(params: ICellRendererParams) {
    const forwardGridEvent = (event) => { this._gridEvents$.next(event); }
    const eventList = [ RowNode.EVENT_EXPANDED_CHANGED ];
    eventList.forEach(eventName => { this.node.addEventListener(eventName, forwardGridEvent); })
    params.addRenderedRowListener('virtualRowRemoved', () => {
      eventList.forEach(eventName => { this.node.removeEventListener(eventName, forwardGridEvent); })
    })
  }

  /**
   * ag-grid's initialization hook for setting up a custom-rendered row
   * component such as this
   */
  agInit(params: ICellRendererParams) {
    this.initComponent(params);
    this.registerGridEvents(params);
  }

  initComponent(params: ICellRendererParams) {
    this.gridAPI = params.api;
    if (params.value) {
      this.nodeValue = params.value;
    }
    this.node = params.node as RowNode;
    this.context = params.context;
    this.bubbles = this.context.bubbles;
    this.channel = (this.node.data && (this.node.data.channel || this.node.data.columns.channel))
      || (this.node.allLeafChildren && this.node.allLeafChildren[0] && (this.node.allLeafChildren[0].data || {}).channel)

    if (this.node && this.node.field) {
      this.nodeField = this.node.field;
      if (this.nodeField.startsWith('columns.')) {
        this.nodeField = 'performanceGroup'
      }
      this.onlyChildIsOwnPlaceholder = this.node.allLeafChildren 
        && this.node.allLeafChildren.length === 1 
        && this.node.allLeafChildren[0].data.isPlaceholder
        && this.node.field !== 'entityLevel';

    } else if (!this.node.allChildrenCount) {
      this.nodeField = 'leaf'
      this.isPlaceholder = params.data.isPlaceholder;
      if (!this.isPlaceholder) {
        const { nodeType } = this.node.data;
        const customLeafComponent = nodeType && this.context.leafComponents ? this.context.leafComponents[nodeType] : undefined;
        const leafComponent = customLeafComponent ? customLeafComponent : this.context.leafComponent;
        this.leafContainer.clear();
        const factory = this.resolver.resolveComponentFactory<iGridLeaf<any, any>>(leafComponent);
        this.leafComponentRef = this.leafContainer.createComponent<iGridLeaf<any, any>>(factory);
        this.leafComponentRef.instance.data$ = this.dataSubject$.asObservable();
        this.leafComponentRef.instance.node = this.node;
        this.leafComponentRef.instance.gridAPI = this.gridAPI;
        this.leafComponentRef.instance.context = this.context;
        this.leafComponentRef.changeDetectorRef.detectChanges();
        this.dataSubject$.next(this.node.data);
      }
    }
  }

  /**
   * ag-grid's refresh hook which will be called to
   * determine if the whole component needs to be redrawn from scratch
   * each time the node's data is updated
   * 
   * @return
   *  true if ag-grid doesn't need to redraw (we were able to update the view ourselves)
   *  false if ag-grid does need to redraw
   */
  refresh(params) {
    if (params.data) {
      this.dataSubject$.next(this.node.data);
      return true;
    }
    // Return false so ag-grid will redraw group rows
    return false;
  }

  onClick() {
    if (this.onlyChildIsOwnPlaceholder) {
      return;
    }
    this.clicks$.next();
  }

  onAddNode(event: MouseEvent, nodeField: string) {
    const groupNodesContext = this.groupNodesContext(nodeField);
    if (typeof groupNodesContext.onAddNode === 'function') {
      groupNodesContext.onAddNode(this.node);
    }
  }
}
