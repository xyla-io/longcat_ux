import { GraphTypeEnum } from "development_packages/xylo/src/browser";
import { PerformanceColumnOps } from "src/app/util/ops/performance-column";
import { KPIEnum, MetricOps } from "./metric";
export class ChartOps {

  static makeGrapher(metricColumnName: string, yAxisIndex: number=1) {

    const displayName = MetricOps.makeDisplayName(metricColumnName)
    const kpiOptionConfig = MetricOps.kpiOptions[PerformanceColumnOps.removeFlags(metricColumnName)];
    const format = kpiOptionConfig ? kpiOptionConfig.format : undefined;
    const defaultGraphType = kpiOptionConfig ? kpiOptionConfig.defaultGraphType : GraphTypeEnum.Line;

    const grapherConfig = Object.assign({
      identifier: metricColumnName,
      renderOptions: {
        graphType: defaultGraphType,
        yAxisOptions: {
          label: displayName,
          format: format,
        },
        distinctValueIndex: -2,
        traceIndex: -1,  
        yAxis: yAxisIndex,
      },
    }, kpiOptionConfig && kpiOptionConfig.transforms ? {
      transforms: kpiOptionConfig.transforms,
    } : {
      aggregate: {
        sum: metricColumnName,
      },
    });
    
    return grapherConfig;
  }
}