import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { ChartNodeData } from '../../../grid/node-ops/chart.node';
import { GridLeaf, Subjective } from '../../../grid/interfaces/grid-leaf.interface';
import { Grapher } from 'development_packages/xylo/src/browser';
import { ChartOps } from '../../../grid/models/chart';
import { ChannelOps } from 'src/app/iomap/models/channel';
import { SetUtil } from 'src/app/util/set.util';
import { Stopwatch } from 'src/app/util/decorators/stopwatch.decorator';
import { takeUntil } from 'rxjs/operators';
import { Daterange, DaterangeUnit, StartEnd } from 'src/app/dashboard/interfaces/query';
import { ThemeConfig } from 'development_packages/xylo/src/common/theme';
import { MetricOps } from '../../../grid/models/metric';
import { CategoryOps } from '../../../grid/models/category';
import { PlatformOps } from 'src/app/iomap/models/platform';
import { Class } from 'src/app/util/decorators/static-implements.decorator';
import { BehaviorSubject } from 'rxjs';
import { OptionConfig, Options } from 'src/app/iomap/util/options';
import { TemplateType } from 'src/app/dashboard/interfaces/template';
import { IOGridContext } from 'src/app/grid/components/io-grid/io-grid.component';
import { transform } from 'lodash-es';
import { NodeUtil } from 'src/app/grid/util/node-util';

export interface NodeChartSubjects {
  metricColumns$?: BehaviorSubject<string[]>,
  daterange$?: BehaviorSubject<Daterange|null>,
  columns$?: BehaviorSubject<string[]>,
}

export interface StructureChartNode {
  metrics: string[];
  daterange: Daterange;
  groups: string[];
  filters: Record<string, any>;
}

export interface TemplateChartNode {
  metadata: {
    identifier: string;
    templateType: TemplateType.ChartNode;
  },
  structure: StructureChartNode;
}

interface StructureChartNodeUpdate extends Partial<StructureChartNode> {
  metrics?: string[];
  daterange?: Daterange;
}

@Component({
  selector: 'app-node-chart',
  templateUrl: './node-chart.component.html',
  styleUrls: ['./node-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeChartComponent extends Subjective<NodeChartSubjects, Class<GridLeaf<ChartNodeData, IOGridContext>>>(GridLeaf) implements OnInit {
  MetricOps = MetricOps;
  CategoryOps = CategoryOps;
  PlatformOps = PlatformOps;
  ChannelOps = ChannelOps;
  Options = Options;

  @ViewChild('graph', {static: false}) graph: ElementRef;

  grapher: Grapher;
  kpiOptions: Record<string, OptionConfig<any>> = {};
  availableColumns: string[];
  nodeTemplate: TemplateChartNode;

  constructor(
    changeDetector: ChangeDetectorRef,
  ) {
    super(changeDetector);
  }

  static viewHeight() {
    return 360;
  }

  theme: ThemeConfig = {
    palette: {
      index: 0,
      colors: Object.entries(ChannelOps.channelOptions).map(([k, v]) => ({
        name: k,
        rgba: v.colorRGBA,
      })).concat([
        {
          name: 'purple',
          rgba: [112, 16, 246, 1],
        },
        {
          name: 'orange',
          rgba: [255, 98, 0, 1]
        },
        {
          name: 'teal',
          rgba: [7, 191, 150, 1],
        },
        {
          name: 'red',
          rgba: [236, 8, 77, 1],
        },
      ]),
    },
    colorMap: {
      colors: Object.entries(ChannelOps.channelOptions).reduce((record, [k, v]) => {
        record[k] = k;
        return record;
      }, {}),
    },
  }

  ngOnInit() {
    super.ngOnInit();

    this.subjects.metricColumns$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(columns => {
        if (!this.data || this.data.template) { return; }
        this.nodeTemplate.structure.metrics = columns;
        if (this.grapher) {
          this.updateGraphChildren();
        }
      });

    this.subjects.daterange$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(daterange => {
        if (!this.data || this.data.template) { return; }
        this.nodeTemplate.structure.daterange = daterange;
        if (this.grapher) {
          this.updateGraph();
        }
      });

    this.subjects.columns$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(columns => {
        this.availableColumns = columns;
        this.kpiOptions = MetricOps.makeCustomOptionsWithDefaults(columns);
      });

    this.context.filterChange$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(filters => {
        console.log(filters);
        if (this.grapher) {
          this.initGraph();
        }
      });

  }

  onReceiveData(data: ChartNodeData) {
    super.onReceiveData(data);
    this.nodeTemplate = data.template ? data.template as TemplateChartNode : this.makeDefaultNodeTemplate();
    this.changeDetector.detectChanges();
    this.initGraph();
  }

  makeDefaultNodeTemplate(): TemplateChartNode {
    return {
      metadata: {
        identifier: this.data.url,
        templateType: TemplateType.ChartNode,
      },
      structure: {
        metrics: this.subjects.metricColumns$.value,
        daterange: this.subjects.daterange$.value,
        groups: this.data.treeSettings.childGroups.slice(0, 1),
        filters: this.getFilterValues(),
      },
    };
  }

  getSelectedTimeColumn(): string {
    return 'time#date';
  }

  getStartAndEndDate(): [string|null, string|null] {
    const daterange = this.nodeTemplate.structure.daterange;
    if (!daterange) { return [null, null]; }
    const shortDate = (isoString) => isoString.split('T', 1).pop();
    switch (daterange.unit) {
      case DaterangeUnit.Day:
        const d = new Date();
        d.setDate(d.getDate() - (daterange.value as number));
        return [shortDate(d.toISOString()), shortDate(new Date().toISOString())];
      case DaterangeUnit.Range:
        const { start, end } = daterange.value as StartEnd;
        return [ shortDate(start), shortDate(end) ];
    }
  }

  getFilterValues() {
    return Object.keys(this.data.columns).reduce((filterRecord, column) => {
      filterRecord[column] = { values: [this.data.columns[column]] };
      return filterRecord;
    }, {});
  }

  makeGraphers(metrics: string[], yAxisStartIndex: number=1) {
    return metrics.map((metric, i) => ChartOps.makeGrapher(metric, i + yAxisStartIndex))
  }

  initGraph() {
    // This assumes that the nodeTemplate.structure.filters only include a single value for each column
    const filterValues = Object.assign(
      transform(this.context.filterChange$.value.filters, (r, v, columnName) => {
        r[columnName] = { values: v.values };
      }),
      this.nodeTemplate.structure.filters
    );

    this.grapher = Grapher.render({
      identifier: 'root',
      theme: this.theme,
      element: this.graph.nativeElement,
      data: this.data.models.almacenPerformance,
      xAxisColumn: this.getSelectedTimeColumn(),
      groupBy: {
        columns: this.nodeTemplate.structure.groups,
      },
      range: {
        [this.getSelectedTimeColumn()]: this.getStartAndEndDate(),
      },
      aggregate: {},
      filterValues,
      renderOptions: {
        distinctValueIndex: -1,
      },
      graphers: this.makeGraphers(this.nodeTemplate.structure.metrics),
    });
    this.changeDetector.detectChanges();
  }

  updateGraph() {
    this.grapher.config.range[this.getSelectedTimeColumn()] = this.getStartAndEndDate();
    this.grapher.applyTransforms();
    this.grapher.removeTraces();
    this.grapher.renderTraces();
    this.changeDetector.detectChanges();
  }

  @Stopwatch()
  updateGraphChildren() {
    const existingIdentifiers = new Set<string>(this.grapher.graphers.map(g => g.config.identifier));
    const newIdentifiers = new Set<string>(this.nodeTemplate.structure.metrics);
    const removeIdentifiers = SetUtil.difference<string>(existingIdentifiers, newIdentifiers);
    const addIdentifiers = SetUtil.difference<string>(newIdentifiers, existingIdentifiers);
    removeIdentifiers.forEach(id => this.grapher.removeChildAt(id));

    const currentYAxisIndices = new Set(this.grapher.graphers.map(g => g.config.renderOptions.yAxis).filter(Number.isInteger));
    let nextYAxisIndex = 0;
    while (currentYAxisIndices.has(++nextYAxisIndex));

    const addGraphers = this.makeGraphers(Array.from<string>(addIdentifiers), nextYAxisIndex);
    addGraphers.forEach(g => this.grapher.addChild(g));
    this.changeDetector.detectChanges();
  }

  emitNodeTemplateUpdate(updates: StructureChartNodeUpdate|null) {
    if (!updates) {
      delete this.data.template;
      this.nodeTemplate = this.makeDefaultNodeTemplate();
      this.context.nodeTemplatesUpdate.emit({ [this.data.url]: null });
      this.initGraph();
      this.changeDetector.detectChanges();
      return;
    }
    Object.assign(this.nodeTemplate.structure, updates);
    this.changeDetector.detectChanges();
    this.data.template = this.nodeTemplate;
    this.context.nodeTemplatesUpdate.emit({
      [this.data.url]: this.nodeTemplate,
    });
  }

  get linerIndentation(): number {
    return this.nodeTemplate ? SetUtil.intersection(new Set(this.context.regroupNodes$.value.columns), new Set(Object.keys(this.nodeTemplate.structure.filters))).size * 40 : 0;
  }

  onClickResetLocalSettings() {
    this.emitNodeTemplateUpdate(null);
    this.changeDetector.detectChanges();
    this.updateGraphChildren();
    this.updateGraph();
  }

  //#region app-performance-node-settings

  onKPIChange(kpis: string[]) {
    this.emitNodeTemplateUpdate({ metrics: kpis });
    this.changeDetector.detectChanges();
    this.updateGraphChildren();
  }

  onDaterangeChange(daterange: Daterange) {
    this.emitNodeTemplateUpdate({ daterange });
    this.changeDetector.detectChanges();
    this.updateGraph();
  }

  //#endregion

}
