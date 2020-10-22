import { ColumnFlagEnum, PerformanceColumnOps } from "../ops/performance-column";
import { Report } from "./report";

export class PerformanceReport extends Report {
  constructor() {
    super();
  }

  private _columnNamesByFlag: Record<ColumnFlagEnum, string[]|undefined> = PerformanceReport.initialColumnNamesByFlag;

  private static get initialColumnNamesByFlag(): Record<ColumnFlagEnum, string[]|undefined> {
    return {
      [ColumnFlagEnum.JSON]: [],
      [ColumnFlagEnum.Category]: undefined,
      [ColumnFlagEnum.Metric]: undefined,
      [ColumnFlagEnum.Property]: undefined,
      [ColumnFlagEnum.Time]: undefined,
    }
  }

  protected applyRows() {
    this._columnNamesByFlag = PerformanceReport.initialColumnNamesByFlag;
    this.rows = this.rows.concat(this.resultData.map((row: string[]) => {
      return row.reduce((record, val, i) => {
        const columnName = this.columnNames[i];
        if (PerformanceColumnOps.columnIsFlagged(columnName, ColumnFlagEnum.JSON)) {
          const resultColumnPrefix = PerformanceColumnOps.removeFlag(columnName, ColumnFlagEnum.JSON);
          Object.entries(val ? JSON.parse(val) : {}).forEach(([k, v]) => {
            const groupedColumnName = `${resultColumnPrefix}${PerformanceColumnOps.columnGroupDelimiter}${k}`;
            record[groupedColumnName] = PerformanceColumnOps.convertColumnValue(groupedColumnName, v as string);
          })
        } else {
          record[columnName] = PerformanceColumnOps.convertColumnValue(columnName, val);
        }
        return record;
      }, {} as any);
    }));
  }

  private getColumnsByFlag(flag: ColumnFlagEnum): string[] {
    if (!this._columnNamesByFlag[flag]) {
      this._columnNamesByFlag[flag] = Array.from(this.rows.reduce((columnSet, row) => {
        Object.keys(row).forEach(columnName => {
          if (PerformanceColumnOps.columnIsFlagged(columnName, flag)) {
            columnSet.add(columnName);
          }
        })
        return columnSet;
      }, new Set<string>()));
    }
    return this._columnNamesByFlag[flag];
  }

  distinctValuesForColumn(columnName: string): string[] {
    return Array.from(this.rows.reduce((distinctValues: Set<string>, row) => {
      if (row[columnName]) {
        distinctValues.add(row[columnName]);
      }
      return distinctValues;
    }, new Set<string>()));
  }

  get categoryColumns() {
    return this.getColumnsByFlag(ColumnFlagEnum.Category);
  }
  get metricColumns() {
    return this.getColumnsByFlag(ColumnFlagEnum.Metric);
  }
  get propertyColumns() {
    return this.getColumnsByFlag(ColumnFlagEnum.Property);
  }
  get timeColumns() {
    return this.getColumnsByFlag(ColumnFlagEnum.Time);
  }
}