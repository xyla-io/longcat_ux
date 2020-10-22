import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { PerformanceService } from 'src/app/services/api/performance.service';
import { map } from 'rxjs/operators';
import { NodeSourceUpdateEvent, NodeTypeEnum } from 'src/app/grid/interfaces/node-ops';
import { EntityService } from 'src/app/services/api/entity.service';
import { ChartNodeOps } from 'src/app/grid/node-ops/chart.node';
import { IOGridColumnsChangeEvent, IoGridComponent, IOGridNodeTemplatesUpdate, IOGridOptions, IOGridState, IOGridStateUpdate } from 'src/app/grid/components/io-grid/io-grid.component';
import { NodeChartComponent, NodeChartSubjects } from 'src/app/performance/components/node-chart/node-chart.component';
import { Daterange } from 'src/app/dashboard/interfaces/query';
import { AbstractTemplate, RecordOfTemplates, TemplateType } from 'src/app/dashboard/interfaces/template';

export interface PerformanceGridTemplate {
  metadata: {
    identifier: string;
    templateType: TemplateType.PerformanceGrid,
  },
  structure: {
    categories: string[];
    metrics: string[];
    daterange: Daterange;
    gridState: IOGridState;
    nodes: RecordOfTemplates<AbstractTemplate>;  
  },
};

export interface PerformanceGridTemplateUpdate {
  nodes?: RecordOfTemplates<AbstractTemplate|null>;
}

@Component({
  selector: 'app-performance-grid',
  templateUrl: './performance-grid.component.html',
  styleUrls: ['./performance-grid.component.scss']
})
export class PerformanceGridComponent implements OnInit {

  @Input() gridTemplate: PerformanceGridTemplate;
  @Output('gridTemplate') templateUpdate = new EventEmitter<PerformanceGridTemplate>();

  @ViewChild(IoGridComponent, { static: false }) ioGrid: IoGridComponent

  sources: Observable<NodeSourceUpdateEvent<any>>[] = [];

  nodeChartSubjects: NodeChartSubjects = {
    metricColumns$: new BehaviorSubject<string[]>([]),
    daterange$: new BehaviorSubject<Daterange|null>(null),
    columns$: new BehaviorSubject<string[]>([]),
  };

  gridOptions: IOGridOptions = {
    hideHeader: true,
    rowGroupPanelShow: 'never',
    leafComponents: {
      [NodeTypeEnum.Chart]: NodeChartComponent,
    },
    groupComponents: {
    },
    nodeSubjects: {
      ...this.nodeChartSubjects
    },
  }
  columns: string[];

  constructor(
    private performanceService: PerformanceService,
    private entityService: EntityService,
  ) { }

  ngOnInit() {
    // const channelsSubject$ = new Subject();
    // this.sources.push(channelsSubject$.pipe(map((channels: ChannelEnum[]) => ({
    //   input: channels,
    //   nodeOps: ChannelNodeOps,
    //   options: {},
    // }))));
    // this.sources.push(this.entityService.entities$.pipe(map(({result}) => ({
    //   input: result,
    //   nodeOps: EntityNodeOps,
    //   options: {},
    // }))));

    this.nodeChartSubjects.metricColumns$.next(this.gridTemplate.structure.metrics);
    this.nodeChartSubjects.daterange$.next(this.gridTemplate.structure.daterange);

    this.sources.push(this.performanceService.performance$.pipe(map(({result}) => ({
      input: result,
      nodeOps: ChartNodeOps,
      options: {},
    }))));
    setTimeout(() => {
      // channelsSubject$.next(Object.values(ChannelEnum));
      // this.entityService.refreshEntities();
      this.performanceService.refreshPerformance();
    });
  }

  onCategoryChange(event: string[]) {
    this.gridTemplate.structure.categories = event;
    this.templateUpdate.emit(this.gridTemplate);
  }

  onColumnsChange(event: IOGridColumnsChangeEvent) {
    this.columns = event.columnNames;
    this.nodeChartSubjects.columns$.next(event.columnNames);
  }

  onKPIChange(event: string[]) {
    this.gridTemplate.structure.metrics = event;
    this.nodeChartSubjects.metricColumns$.next(this.gridTemplate.structure.metrics);
    this.templateUpdate.emit(this.gridTemplate);
  }

  onDaterangeChange(daterange: Daterange) {
    this.gridTemplate.structure.daterange = daterange;
    this.nodeChartSubjects.daterange$.next(this.gridTemplate.structure.daterange);
    this.templateUpdate.emit(this.gridTemplate);
  }

  onNodeTemplatesUpdate(update: IOGridNodeTemplatesUpdate) {
    if (!Object.keys(update).length) { return; }
    Object.assign(this.gridTemplate.structure.nodes, update);
    for (const [k, v] of Object.entries(this.gridTemplate.structure.nodes)) {
      if (!v) { delete this.gridTemplate.structure.nodes[k]; }
    }
    this.templateUpdate.emit(this.gridTemplate);
  }

  onGridStateUpdate(update: IOGridStateUpdate) {
    console.log('grid state update', update);
    if (!Object.keys(update).length) { return; }
    Object.assign(this.gridTemplate.structure.gridState.rowGroupStates, update.rowGroupStates);
    for (const [k, v] of Object.entries(this.gridTemplate.structure.gridState.rowGroupStates)) {
      if (!v) { delete this.gridTemplate.structure.gridState.rowGroupStates[k]; }
    }
    this.templateUpdate.emit(this.gridTemplate);
  }
}
