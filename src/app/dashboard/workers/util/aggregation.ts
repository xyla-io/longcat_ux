import { DataSet } from 'development_packages/xylo/index';
import { RowFilter } from 'src/app/dashboard/interfaces/filter';
import { RowFilterOps } from 'src/app/dashboard/workers/util/row-filter';
import {
  TemplateColumn,
  TemplateSumColumn,
  TemplateCountColumn,
  TemplateQuotientColumn,
  ColumnLiteral,
  DisplayColumn,
  ColumnIdentifier
} from 'src/app/dashboard/interfaces/column';
import { BreakdownIdentifier, TemplateBreakdown } from 'src/app/dashboard/interfaces/breakdown';
import { ColumnOps } from 'src/app/dashboard/workers/util/column';

export interface DataSetGroup {
  groupKey: string;
  groupValue: string;
  dataSet: DataSet;
}

export interface ModelTreeNode {
  breakdownGroupKey: string;
  breakdownGroupValue: string;
  breakdownLevel: number;
  isTerminalNode: boolean;
  data: object;
  children?: ModelTreeNode[];
  expanded?: boolean;
}

export interface ModelTreeGrid {
  nodes: ModelTreeNode[];
  templateColumns: TemplateColumn[];
  columnDisplayNames: string[];
  nameColumn: string;
  uids: string[];
}

export class AggregationOps {
  private static readonly rowNameColumn = 'rowName';

  static groupByColumn(dataSet: DataSet, column: ColumnLiteral): DataSetGroup[] {
    const groupedDataFrameCollection = dataSet.dataFrame.groupBy(column).toCollection();
    return groupedDataFrameCollection.map(group => ({
      groupKey: column,
      groupValue: group.groupKey[column],
      dataSet: new DataSet(group.group),
    }));
  }

  static aggregateColumn(
    dataSet: DataSet,
    template: TemplateColumn,
    rowFilters?: RowFilter[],
  ): number {
    dataSet = RowFilterOps.filterRows(
      dataSet,
      (template.options.rowFilters || []).concat(rowFilters || [])
    );

    if (ColumnOps.isSumColumn(template)) {
      return AggregationOps.aggregateSumColumn(dataSet, template);
    }
    if (ColumnOps.isCountColumn(template)) {
      return AggregationOps.aggregateCountColumn(dataSet, template);
    }
    if (ColumnOps.isQuotientColumn(template)) {
      return AggregationOps.aggregateQuotientColumn(dataSet, template);
    }
    throw new Error(`AggregationOps method is not implemented for column template: ${JSON.stringify(template)}`);

  }

  private static aggregateSumColumn(dataSet: DataSet, template: TemplateSumColumn): number {
    return dataSet.dataFrame.stat.sum(template.sumColumn);
  }

  private static aggregateCountColumn(dataSet: DataSet, template: TemplateCountColumn): number {
    return dataSet.dataFrame.countValue(template.countValue, template.countColumn);
  }

  private static aggregateQuotientColumn(dataSet: DataSet, template: TemplateQuotientColumn): number {
    if (!ColumnOps.isConcreteColumn(template.numeratorTemplateColumn)) {
      throw new Error(`Numerator column is not a ConcreteTemplateColumn: ${JSON.stringify(template)}`);
    }
    if (!ColumnOps.isConcreteColumn(template.denominatorTemplateColumn)) {
      throw new Error(`Denominator column is not a ConcreteTemplateColumn: ${JSON.stringify(template)}`);
    }
    const numerator = AggregationOps.aggregateColumn(dataSet, template.numeratorTemplateColumn);
    const denominator = AggregationOps.aggregateColumn(dataSet, template.denominatorTemplateColumn);
    if (!denominator) { return null; }
    return numerator / denominator;
  }

  static aggregateTable(
    dataSet: DataSet,
    displayColumns: DisplayColumn[],
    displayBreakdownIdentifiers: BreakdownIdentifier[],
    templateColumnMap: Map<ColumnIdentifier, TemplateColumn>,
    templateBreakdownMap: Map<BreakdownIdentifier, TemplateBreakdown>,
    rowFilters: RowFilter[],
  ): ModelTreeGrid {
    const nodes = AggregationOps.breakIntoGroups(
      dataSet,
      displayColumns,
      templateColumnMap,
      displayBreakdownIdentifiers,
      templateBreakdownMap,
      rowFilters,
    );
    const templateColumns = ColumnOps.getTemplateColumns(
      displayColumns,
      templateColumnMap
    );
    const tree = {
      nodes,
      templateColumns,
      nameColumn: AggregationOps.rowNameColumn,
      columnDisplayNames: [AggregationOps.rowNameColumn, ...templateColumns.map((templateColumn, i) => {
        return ColumnOps.getDisplayColumnName({
          displayColumn: displayColumns[i],
          templateColumn: templateColumn,
        });
      })],
      uids: displayColumns.map(column => column.uid),
    };
    return tree;
  }

  static getDistinctValues(
    dataSet: DataSet,
    column: ColumnLiteral,
  ): (string|number)[] {
    return dataSet.dataFrame.distinct(column).toArray(column);
  }

  private static breakIntoGroups(
    dataSet: DataSet,
    displayColumns: DisplayColumn[],
    templateColumnMap: Map<ColumnIdentifier, TemplateColumn>,
    displayBreakdownIdentifiers: BreakdownIdentifier[],
    templateBreakdownMap: Map<BreakdownIdentifier, TemplateBreakdown>,
    rowFilters: RowFilter[],
    level: number = 0
  ): ModelTreeNode[] {
    if (level >= displayBreakdownIdentifiers.length) { return null; }

    const templateBreakdownIdentifier = displayBreakdownIdentifiers[level];
    const templateBreakdown = templateBreakdownMap.get(templateBreakdownIdentifier);
    console.log(new Array(level + 1).join('—') + 'grouping by column: ', templateBreakdown.groupColumn);
    const dataSetGroups = AggregationOps.groupByColumn(dataSet, templateBreakdown.groupColumn);

    const nodes: ModelTreeNode[] = dataSetGroups.map(dataSetGroup => {
      return {
        breakdownGroupKey: dataSetGroup.groupKey,
        breakdownGroupValue: dataSetGroup.groupValue,
        breakdownLevel: level,
        isTerminalNode: level === displayBreakdownIdentifiers.length - 1,
        data: displayColumns.reduce((aggregationRow, displayColumn) => {
          const columnTemplate = templateColumnMap.get(displayColumn.identifier);
          aggregationRow[displayColumn.uid] =
            AggregationOps.aggregateColumn(
              dataSetGroup.dataSet,
              columnTemplate,
              (displayColumn.parameters.rowFilters || []).concat(rowFilters || [])
            );
          return aggregationRow;
        }, {
          [AggregationOps.rowNameColumn]: dataSetGroup.groupValue,
        }),
        children: this.breakIntoGroups(
          dataSetGroup.dataSet,
          displayColumns,
          templateColumnMap,
          displayBreakdownIdentifiers,
          templateBreakdownMap,
          rowFilters,
          level + 1
        ),
      };
    });
    nodes.sort((a, b) => ((a.data as any).rowName < (b.data as any).rowName) ? -1 : 1);
    return nodes;
  }
}
