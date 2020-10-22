import { Component, OnInit, Input, OnDestroy, OnChanges, Output, EventEmitter, SimpleChanges, ComponentRef } from '@angular/core';
import { GridOptions, RowNode, GridApi, ColumnRowGroupChangedEvent, ColDef, RowGroupOpenedEvent, FilterChangedEvent } from 'ag-grid-community';
import { GridDefaults, GridSorting, GridOps } from 'src/app/util/grid';
import { NodeSwitchComponent } from '../node-switch/node-switch.component';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { AgGridAngular } from 'ag-grid-angular';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { NodeSourceUpdateEvent, NodeTypeEnum, NodeData, NodeTreeView, NodeTreeColumnConfig, NodeTreeMergeOptions, NodeOps } from '../../interfaces/node-ops';
import { NodeUtil } from '../../util/node-util';
import { iGridLeaf } from '../../interfaces/grid-leaf.interface';
import { Class } from 'src/app/util/decorators/static-implements.decorator';
import { GridGroup } from '../../interfaces/grid-group.abstract';
import { SessionService } from 'src/app/services/api/session.service';
import { AbstractTemplate, RecordOfTemplates } from 'src/app/dashboard/interfaces/template';
import { transform } from 'lodash-es';
import { url as urlUtil } from 'development_packages/xylo/src/browser';

export interface IOGridOptions {
  leafComponents?: Partial<Record<NodeTypeEnum, Class<iGridLeaf<any, IOGridContext>>>>;
  groupComponents?: Partial<Record<NodeTypeEnum, Class<GridGroup>>>;
  nodeSubjects?: Record<string, Subject<any>>;
  hideHeader?: boolean;
  rowGroupPanelShow?: 'always'|'never'|'onlyWhenGrouping';
}

export interface IOGridFilterEvent {
  filters: { 
    [filterColumn: string]: {
      filterType: 'set'
      values: any[];
    };
  };
}

interface IOGridRegroupEvent {
  columns: string[];
};

export interface IOGridColumnsChangeEvent {
  columnNames: string[];
}

export interface IOGridNodeTemplatesUpdate {
  [url: string]: Record<string, any>|null;
}

export interface IOGridContext {
  regroupNodes$: BehaviorSubject<IOGridRegroupEvent>;
  filterChange$: BehaviorSubject<IOGridFilterEvent>;
  nodeTemplatesUpdate: EventEmitter<IOGridNodeTemplatesUpdate>;
  leafComponents: Partial<Record<NodeTypeEnum, Class<iGridLeaf<any, IOGridContext>>>>;
  groupComponents: Partial<Record<NodeTypeEnum, Class<GridGroup>>>;
  nodeSubjects: Record<string, Subject<any>>;
}

export interface IOGridState {
  rowGroupStates: Record<string, any>;
};

export interface IOGridStateUpdate extends Partial<IOGridState> {};

@Component({
  selector: 'app-io-grid',
  templateUrl: './io-grid.component.html',
  styleUrls: ['./io-grid.component.scss']
})
export class IoGridComponent implements OnInit, OnChanges, OnDestroy, NodeTreeView {
  @Input() nodeTemplates: RecordOfTemplates<AbstractTemplate> = {};
  @Input() groupByColumns: string[];
  @Input() sources: Observable<any>[];
  @Input() options: IOGridOptions = {};
  @Input() gridState: IOGridState = {
    rowGroupStates: {},
  };
  @Output() columnsChange = new EventEmitter<IOGridColumnsChangeEvent>();
  @Output() nodeTemplatesUpdate = new EventEmitter<IOGridNodeTemplatesUpdate>();
  @Output() gridStateUpdate = new EventEmitter<IOGridStateUpdate>();

  destroyed$ = new Subject();
  gridReady$ = new Subject();
  regroupNodes$ = new BehaviorSubject<IOGridRegroupEvent>({columns: []});
  filterChange$ = new BehaviorSubject<IOGridFilterEvent>({filters: {}});

  sourceNodeOps = new Set<NodeOps<any, any>>();

  private gridAPI: GridApi;
  gridSideBar = GridDefaults.defaultGridSidebar;
  gridOptions: GridOptions;

  static groupNodeScheme = 'group_node';

  setGridOptions() {
    this.gridOptions = {
      context: {
        leafComponents: this.options.leafComponents || {},
        groupComponents: this.options.groupComponents || {},
        nodeSubjects: this.options.nodeSubjects || {},
        nodeTemplatesUpdate: this.nodeTemplatesUpdate,
        regroupNodes$: this.regroupNodes$,
        filterChange$: this.filterChange$,
      } as IOGridContext,
      getRowNodeId: (data) => data.url,
      enableCellChangeFlash: true,
      animateRows: false,
      loadingOverlayComponent: 'loaderComponent',
      loadingOverlayComponentParams: { size: 34 },
      suppressContextMenu: true,
      defaultColDef: GridDefaults.defaultColDef,
      headerHeight: this.options.hideHeader ? 0 : 40,

      /** Filtering */
      onFilterChanged: (change: FilterChangedEvent) => {
        this.filterChange$.next({
          filters: transform(change.api.getFilterModel(), (r, v, k) => {
            r[NodeUtil.extractColumnName(k)] = v;
          }),
        });
      },

      /** Grouping */
      groupUseEntireRow: true,
      rememberGroupStateWhenNewData: true,
      rowGroupPanelShow: this.options.rowGroupPanelShow ? this.options.rowGroupPanelShow : 'always',
      groupDefaultExpanded: 0,
      defaultGroupSortComparator: GridSorting.defaultGroupSortComparator,
      onColumnRowGroupChanged: (params: ColumnRowGroupChangedEvent) => {
        this.regroupNodes$.next({
          columns: params.columns.map(column => NodeUtil.extractColumnName(column.getColDef().field)),
        });
        for (const key of Object.keys(this.gridState.rowGroupStates)) {
          this.gridState.rowGroupStates[key] = null;
        }
        this.gridAPI.forEachNodeAfterFilterAndSort(node => {
          if (!node.group) { return; }
          const groupURL = this.groupNodeURL(node);
          if (this.gridState.rowGroupStates[groupURL] === null) {
            this.gridState.rowGroupStates[groupURL] = true;
          }
        });    
        this.gridStateUpdate.next(this.gridState);
      },
      onRowGroupOpened: (params: RowGroupOpenedEvent) => {
        const groupURL = this.groupNodeURL(params.node);
        if (!!this.gridState.rowGroupStates[groupURL] === !!params.node.expanded) { return; }
        this.gridState.rowGroupStates[groupURL] = params.node.expanded || null;
        this.gridStateUpdate.next(this.gridState);
      },

      /** Sorting */
      postSort: (rowNodes: RowNode[]) => {
        const getParserChild = (node) => {
          if (!node.group) { return undefined; }
          if (node.field !== 'parserName') { return undefined; }
          const [child] = node.allLeafChildren;
          if (!child) { return undefined; }
          if (!child.data.entityLevel) { return undefined; }
          return child.data;
        };

        rowNodes.sort((nodeA, nodeB) => {
          const parserA = getParserChild(nodeA);
          if (!parserA) { return 0; }
          const parserB = getParserChild(nodeB);
          if (!parserB) { return 0; }
          // Put entities without naming convention at the bottom of the group
          if (!parserA.parserName) { return 1; }
          if (!parserB.parserName) { return -1; }
          // Sort naming conventions by parser name
          return parserA.parserName < parserB.parserName ? -1 : 1;
        });
      },

      /** Full-width rows */
      isFullWidthCell: () => true,
      getRowHeight: GridDefaults.makeDefaultRowHeightFunction(IoGridComponent.computeComponentHeight),
      fullWidthCellRenderer: 'nodeSwitchComponent',
      frameworkComponents: {
        nodeSwitchComponent: NodeSwitchComponent,
        loaderComponent: LoaderComponent,
      },
    };
  }

  columnDefs = [
    // {
    //   headerName: 'Entity Level',
    //   field: NodeUtil.makeColumnFieldName('property#entity'),
    //   filterValueGetter: ({data}) => {
    //     const entity = data.columns['property#entity'];
    //     const channel = data.columns['property#channel'];
    //     if (!entity || !channel) { return null; }
    //     return ChannelOps.getEntityDisplayName({ entity, channel });
    //   },
    //   rowGroup: false,
    //   filter: false,
    // },
    // {
    //   headerName: 'Node Type',
    //   field: 'nodeType',
    //   filter: false,
    // }
  ];

  rowData = [];

  constructor(
    private sessionService: SessionService,
  ) { }

  static computeComponentHeight(rowNode) {
    if (rowNode.data.isPlaceholder) { return 1; } // Height of 0 can crash ag-grid
    const viewComponent = rowNode.data && rowNode.data.currentViewComponent;
    if (viewComponent) {
      return viewComponent.viewHeight();
    }
  }

  ngOnInit() {
    this.setGridOptions();

    this.sessionService.currentCompany$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.waitOnGridReady(() => this.gridAPI.showLoadingOverlay()));

    this.sources.forEach(source => {
      combineLatest([
        source,
        this.gridReady$,
      ])
        .pipe(takeUntil(this.destroyed$))
        .subscribe(([update]) => this.onSourceInput(update));
    });

    this.regroupNodes$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(({ columns }) => {
        Array.from(this.sourceNodeOps).forEach(nodeOps => nodeOps.onRegroupNodes(columns, this));
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['groupByColumns']) {
      this.gridAPI && this.gridAPI.showLoadingOverlay();
      setTimeout(() => {
        this.waitOnGridReady(() => {
          this.columnDefs = this.columnDefs.map(columnDef => {
            const groupIndex = this.getRowGroupIndex(NodeUtil.extractColumnName(columnDef.field));
            return {
              ...columnDef,
              rowGroupIndex: groupIndex,
              filter: groupIndex !== undefined,
            };
          });
          this.gridAPI.setColumnDefs(this.columnDefs);
          this.regroupNodes$.next({ columns: this.groupByColumns });
        });
      });
    }
  }

  getRowGroupIndex(columnName: string) {
    const index = this.groupByColumns.indexOf(columnName);
    return index === -1 ? undefined : index;
  }

  waitOnGridReady(cb: () => void) {
    this.gridAPI ? cb() : this.waitOn(this.gridReady$, cb);
  }

  waitOn(observable: Observable<any>, cb: () => void) {
    observable.pipe(take(1), takeUntil(this.destroyed$)).subscribe(cb);
  }

  onGridReady(params: AgGridAngular) {
    this.gridAPI = params.api;
    this.gridAPI.sizeColumnsToFit();
    this.gridAPI.showLoadingOverlay();
    this.gridReady$.next();
  }  

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  async onSourceInput(sourceUpdate: NodeSourceUpdateEvent<any>) {
    if (!sourceUpdate) {
      this.clearNodes();
      return;
    }
    this.gridAPI.showLoadingOverlay();
    const { nodes } = await sourceUpdate.nodeOps.onMergeInput(sourceUpdate.input, this, sourceUpdate.options);
    this.sourceNodeOps.add(sourceUpdate.nodeOps);
  }

  private groupNodeURL(node: RowNode): string {
    const reserved = /:/g;
    const components = [];
    while (node && typeof node.field === 'string') {
      components.push(urlUtil.escapeComponent(node.field, reserved) + ':' + urlUtil.escapeComponent(String(node.key), reserved));
      node = node.parent;
    };
    components.reverse();
    return urlUtil.mongoEscape(urlUtil.composeURL(IoGridComponent.groupNodeScheme, components));
  }

  //#region NodeTreeView Interface

  get existingNodes() {
    // TODO: this needs to be implemented
    return {};
  }

  forEachNode(callback: (node: NodeData<any, any>, index: number) => void) {
    this.gridAPI.forEachNode((node, index) => callback(node.data, index));
  }

  addColumnsToTree(addColumnConfigs: NodeTreeColumnConfig[]) {
    const columnDefFromConfig = (config: NodeTreeColumnConfig) => {
      const groupIndex = this.getRowGroupIndex(config.name);
      return {
        field: NodeUtil.makeColumnFieldName(config.name),
        headerName: config.header,
        rowGroupIndex: groupIndex,
        filter: groupIndex !== undefined,
        filterParams: config.filterValues ? {
          valueFormatter: ({ value }) => {
            if (!value) { return '📊 Breakdown' }
            return value;
          },
        } : undefined,
        enableRowGroup: config.allowGrouping,
      };
    };
    const existingColumnDefFields = new Set(this.columnDefs.map(c => c.field));
    const newColumnConfigs = addColumnConfigs
      .map(columnDefFromConfig)
      .filter(columnDef => !existingColumnDefFields.has(columnDef.field));
    this.columnDefs = this.columnDefs.concat(newColumnConfigs);
    this.columnsChange.emit({
      columnNames: this.columnDefs.map(def => NodeUtil.extractColumnName(def.field)),
    })
    this.gridAPI.setColumnDefs(this.columnDefs);
  }

  mergeNodes(nodes: NodeData<any, any>[], options: NodeTreeMergeOptions) {
    GridOps.updateNodesWithTransaction({
      gridAPI: this.gridAPI,
      nodeData: nodes,
      siblingProtocol: options.siblingProtocol,
      clearSiblings: !!options.clearSiblings,
      idProperty: 'url',
    });
    this.gridAPI.forEachNodeAfterFilterAndSort(node => {
      if (!node.group) { return; }
      const groupURL = this.groupNodeURL(node);
      if (this.gridState.rowGroupStates[groupURL]) {
        node.setExpanded(true);
      }
    });
  }

  clearNodes() {
    this.waitOnGridReady(() => this.gridAPI.setRowData([]));
  }

  getGroupColumns(): string[] {
    return this.groupByColumns;
  }

  //#endregion

}
