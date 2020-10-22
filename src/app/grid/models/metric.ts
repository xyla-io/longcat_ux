import { TracesFormatEnum } from "development_packages/xylo/src/browser";
import { GraphTypeEnum } from "development_packages/xylo/src/browser/graph/grapher";
import { ChannelEnum } from "src/app/iomap/models/channel";
import { OptionConfig, Options } from "src/app/iomap/util/options";
import { ColumnFlagEnum, PerformanceColumnOps } from "../../util/ops/performance-column";

export enum KPIEnum {
  Spend = 'spend',
  Clicks = 'clicks',
  CPI = 'cpi',
  CPC = 'cpc',
  Impressions = 'impressions',
  RevenueTotal = 'revenue_total',
  RevenueD0 = 'revenue_d0',
  RevenueD3 = 'revenue_d3',
  RevenueD7 = 'revenue_d7',
  ROASTotal = 'roas_total',
  ROASD0 = 'roas_d0',
  ROASD3 = 'roas_d3',
  ROASD7 = 'roas_d7',
}

export interface KPIOptionConfig extends OptionConfig<any> {
  displayName: string;
  format?: TracesFormatEnum;
  defaultGraphType?: GraphTypeEnum;
  channel?: ChannelEnum[]; // Add entries to channel array to only allow a KPI on those channels
  transforms?: (string|[string, any[]])[];
}

export class MetricOps {
  static kpiOptions: Record<KPIEnum, KPIOptionConfig> = Object.freeze({
    [KPIEnum.CPI]: {
      displayName: 'CPI',
      format: TracesFormatEnum.Dollar,
      defaultGraphType: GraphTypeEnum.Line,
      transforms: [
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#spend']],
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#event@AppsFlyer.install']],
        ['iocontext.xyla.transformers.vector.quotient', []],
      ],
    },
    [KPIEnum.CPC]: {
      displayName: 'CPC',
      format: TracesFormatEnum.Dollar,
      defaultGraphType: GraphTypeEnum.Line,
      transforms: [
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#spend']],
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#clicks']],
        ['iocontext.xyla.transformers.vector.quotient', []],
      ],
    },
    [KPIEnum.ROASTotal]: {
      displayName: 'ROAS - Total',
      format: TracesFormatEnum.Percent,
      defaultGraphType: GraphTypeEnum.Scatter,
      transforms: [
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#revenue_total']],
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#spend']],
        ['iocontext.xyla.transformers.vector.quotient', []],
      ],
    },
    [KPIEnum.ROASD0]: {
      displayName: 'ROAS - Day 0',
      format: TracesFormatEnum.Percent,
      defaultGraphType: GraphTypeEnum.Scatter,
      transforms: [
        ['iocontext.xyla.transformers.row.mapCells', [{'metric#spend': parseFloat, 'metric#revenue_d0': parseFloat}]],
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#revenue_d0']],
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#spend']],
        ['iocontext.xyla.transformers.vector.quotient', []],
      ],
    },
    [KPIEnum.ROASD3]: {
      displayName: 'ROAS - Day 3',
      format: TracesFormatEnum.Percent,
      defaultGraphType: GraphTypeEnum.Scatter,
      transforms: [
        ['iocontext.xyla.transformers.row.mapCells', [{'metric#spend': parseFloat, 'metric#revenue_d3': parseFloat}]],
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#revenue_d3']],
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#spend']],
        ['iocontext.xyla.transformers.vector.quotient', []],
      ],
    },
    [KPIEnum.ROASD7]: {
      displayName: 'ROAS - Day 7',
      format: TracesFormatEnum.Percent,
      defaultGraphType: GraphTypeEnum.Scatter,
      transforms: [
        ['iocontext.xyla.transformers.row.mapCells', [{'metric#spend': parseFloat, 'metric#revenue_d7': parseFloat}]],
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#revenue_d7']],
        ['iocontext.xyla.transformers.aggregate.sum', ['metric#spend']],
        ['iocontext.xyla.transformers.vector.quotient', []],
      ],
    },
    [KPIEnum.Spend]: {
      displayName: 'Spend',
      format: TracesFormatEnum.Dollar,
      defaultGraphType: GraphTypeEnum.Bar,
    },
    [KPIEnum.Clicks]: {
      displayName: 'Clicks',
      defaultGraphType: GraphTypeEnum.Line,
    },
    [KPIEnum.Impressions]: {
      displayName: 'Impressions',
      defaultGraphType: GraphTypeEnum.Line,
    },
    [KPIEnum.RevenueTotal]: {
      displayName: 'Revenue - Total',
      defaultGraphType: GraphTypeEnum.Line,
      format: TracesFormatEnum.Dollar,
    },
    [KPIEnum.RevenueD0]: {
      displayName: 'Revenue - Day 0',
      defaultGraphType: GraphTypeEnum.Line,
      format: TracesFormatEnum.Dollar,
    },
    [KPIEnum.RevenueD3]: {
      displayName: 'Revenue - Day 3',
      defaultGraphType: GraphTypeEnum.Line,
      format: TracesFormatEnum.Dollar,
    },
    [KPIEnum.RevenueD7]: {
      displayName: 'Revenue - Day 7',
      defaultGraphType: GraphTypeEnum.Line,
      format: TracesFormatEnum.Dollar,
    },
  });

  static getOptionConfig(fullColumnName) {
    return MetricOps.kpiOptions[PerformanceColumnOps.removeFlags(fullColumnName)];
  }

  static makeCustomOptionsWithDefaults(columns: string[]) {
    let metricColumns = Object.values(KPIEnum).map(m => PerformanceColumnOps.addFlag(m, ColumnFlagEnum.Metric));
    metricColumns = metricColumns.concat(PerformanceColumnOps.filterColumnNames(columns, ColumnFlagEnum.Metric).filter(c => !metricColumns.includes(c)));
    return Options.from(metricColumns, { makeDisplayName: MetricOps.makeDisplayName });
  }

  static groupDisplayMap = {
    event: '️⚡',
  };

  static makeDisplayName(columnName: string) {
    const rawName = PerformanceColumnOps.removeFlag(columnName, ColumnFlagEnum.Metric);
    const optionConfig = MetricOps.kpiOptions[rawName] as KPIOptionConfig;
    if (optionConfig) { return optionConfig.displayName; }
    const groupInfo = PerformanceColumnOps.getColumnGroup(rawName);
    if (groupInfo) {
      return `${MetricOps.groupDisplayMap[groupInfo.columnGroup] || groupInfo.columnGroup} ${groupInfo.columnName}`;
    }
    return rawName;
  }


}