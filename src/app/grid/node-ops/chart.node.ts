
import { NodeOps, NodeSourceUpdateOptions, NodeTypeEnum, NodeData, NodeTreeView, NodeTreeColumnConfig } from "../interfaces/node-ops";
import { staticImplements, Class } from "src/app/util/decorators/static-implements.decorator";
import { AlmacenEntityModel, EntityInfoColumns, BaseEntityNodeColumns } from "./entity.node";
import { iGridLeaf } from "../interfaces/grid-leaf.interface";
import { NodeChartComponent, TemplateChartNode } from "../../performance/components/node-chart/node-chart.component";
import { url as urlUtil, collection } from 'development_packages/xylo/src/browser';
import { PerformanceReport } from "src/app/util/reports/performance-report";
import { CategoryOps } from "src/app/grid/models/category";
import { MetricOps } from "../models/metric";
import { AbstractTemplate, RecordOfTemplates, TemplateType } from "src/app/dashboard/interfaces/template";
import { IOGridContext } from "../components/io-grid/io-grid.component";
import { escapeComponent } from "development_packages/xylo/src/common/util/url";

interface AlmacenPerformanceRowModel extends AlmacenEntityModel {
  date: string;
  number: string;
  spend: string;
  conversions: string;
  tags: string;
}

export interface ChartNodeData extends NodeData<
  {
    almacenPerformance: AlmacenPerformanceRowModel[],
  },
  BaseEntityNodeColumns<EntityInfoColumns>
> {
}

@staticImplements<NodeOps<string, ChartNodeData>>()
export class ChartNodeOps {
  static nodeType = NodeTypeEnum.Chart;
  static urlProtocol = 'chart_node'; 
  static defaultViewComponent: Class<iGridLeaf<ChartNodeData, IOGridContext>> = NodeChartComponent;

  private static rows = [];

  static async onMergeInput(url: string, nodeTreeView: NodeTreeView, options: NodeSourceUpdateOptions) {
    console.log('node templates', nodeTreeView.nodeTemplates);
    if (!url) {
      nodeTreeView.clearNodes();
      return { nodes: [] };
    }
    const report = new PerformanceReport();
    await report.addCSVFromURL(url);
    const categoryColumnConfigs: NodeTreeColumnConfig[] = report.categoryColumns.map(category => ({
      name: category,
      header: CategoryOps.makeDisplayName(category),
      allowGrouping: true,
      filterValues: report.distinctValuesForColumn(category),
    }));
    const metricColumnConfigs: NodeTreeColumnConfig[] = report.metricColumns.map(metric => ({
      name: metric,
      header: MetricOps.makeDisplayName(metric),
      allowGrouping: false,
    }));
    nodeTreeView.addColumnsToTree(categoryColumnConfigs.concat(metricColumnConfigs));
    this.rows = report.rows;
    const nodes = this.makeGroupNodes(report.rows, nodeTreeView.getGroupColumns(), nodeTreeView.nodeTemplates);
    nodeTreeView.mergeNodes(nodes, {
      siblingProtocol: this.urlProtocol,
      clearSiblings: !!options.clearSiblings,
    });
    return { nodes };
  }

  static onRegroupNodes(groupColumns: string[], nodeTreeView: NodeTreeView) {
    const nodes = this.makeGroupNodes(this.rows, groupColumns, nodeTreeView.nodeTemplates);
    nodeTreeView.mergeNodes(nodes, {
      siblingProtocol: this.urlProtocol,
      clearSiblings: true,
    });
  }

  private static makeGroupNode(url: string, parentGroups: string[], childGroups: string[], template?: AbstractTemplate, columns?: Record<string, any>): ChartNodeData {
    return {
      url: url,
      nodeType: this.nodeType,
      treeSettings: {
        parentGroups: parentGroups,
        childGroups: childGroups,
      },
      models: {
        almacenPerformance: this.rows,
      },
      columns: columns || {},
      currentViewComponent: this.defaultViewComponent,
      template: template,
    }
  }

  private static makeGroupNodes(rows: AlmacenPerformanceRowModel[], groupColumns: string[], nodeTemplates: RecordOfTemplates<AbstractTemplate>): ChartNodeData[] {
    const combinations = collection.propertyCombinations(groupColumns, rows);
    combinations.unshift([]);
    const nodes = [];
    const remainingTemplates = Object.assign({}, nodeTemplates);
    const reserved = /:/g;

    combinations.forEach(combo => {
      const urlComponents = [];
      for (let i = 0; i < combo.length; i++) {
        urlComponents.push(escapeComponent(groupColumns[i], reserved) + ':' + escapeComponent(combo[i], reserved));
      }
      urlComponents.push(... groupColumns.slice(combo.length, combo.length + 1).map(g => escapeComponent(g, reserved)));
      const url = urlUtil.mongoEscape(urlUtil.composeURL(this.urlProtocol, urlComponents));
      nodes.push(combo.reduce((groupNode, groupValue, groupIndex) => {
        groupNode.columns[groupColumns[groupIndex]] = groupValue;
        return groupNode;
      }, this.makeGroupNode(url, groupColumns.slice(0, combo.length), groupColumns.slice(combo.length), remainingTemplates[url])));
      delete remainingTemplates[url];
    });
    for (const nodeTemplate of Object.values(remainingTemplates).filter(t => t.metadata.templateType === TemplateType.ChartNode) as TemplateChartNode[]) {
      const parentGroups = Object.keys(nodeTemplate.structure.filters);
      const childGroups = nodeTemplate.structure.groups;
      const columns = {};
      for (const [k, v] of Object.entries(nodeTemplate.structure.filters)) {
        columns[k] = v.values[0];
      }
      nodes.push(this.makeGroupNode(nodeTemplate.metadata.identifier, parentGroups, childGroups, nodeTemplate, columns));
    }
    return nodes;
  }
};
