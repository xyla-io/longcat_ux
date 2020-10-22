import {
  DisplayColumn,
  ColumnIdentifier,
  TemplateColumn,
  ColumnLiteral,
} from 'src/app/dashboard/interfaces/column';
import { BreakdownIdentifier, TemplateBreakdown } from 'src/app/dashboard/interfaces/breakdown';
import { RowFilter } from 'src/app/dashboard/interfaces/filter';
import { WorkRequest } from 'src/app/dashboard/workers/util/work-request';

export interface XyloWork extends WorkRequest {
  dataSetKey: string;
  rowFilters?: RowFilter[];
  [x: string]: any;
}

export function isXyloWork(obj: any): obj is XyloWork {
  return obj && obj.dataSetKey;
}

export interface FetchWork extends XyloWork {
  url: string;
}

export function isFetchWork(obj: any): obj is FetchWork {
  return obj && isXyloWork(obj) && obj.url;
}

export interface ColumnWork extends XyloWork {
  templateColumn: TemplateColumn;
}

export function isColumnWork(obj: any): obj is ColumnWork {
  return obj
    && isXyloWork(obj)
    && obj.templateColumn;
}

export interface DistinctValuesWork extends XyloWork {
  distinctValuesColumn: ColumnLiteral;
}

export function isDistinctValuesWork(obj: any): obj is DistinctValuesWork {
  return obj
    && isXyloWork(obj)
    && obj.distinctValuesColumn;
}

export interface TableWork extends XyloWork {
  displayColumns: DisplayColumn[];
  templateColumnMap: Map<ColumnIdentifier, TemplateColumn>;
  displayBreakdownIdentifiers: BreakdownIdentifier[];
  templateBreakdownMap: Map<BreakdownIdentifier, TemplateBreakdown>;
}

export function isTableWork(obj: any): obj is TableWork {
  return obj
    && isXyloWork(obj)
    && obj.displayColumns
    && obj.templateColumnMap
    && obj.displayBreakdownIdentifiers
    && obj.templateBreakdownMap;
}

