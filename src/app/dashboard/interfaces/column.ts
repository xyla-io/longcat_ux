import { TemplateType, InternalTemplate, InternalMetadata } from './template';
import { RowFilter, VariableRowFilter } from './filter';

export type ColumnIdentifier = string;
export type ColumnLiteral = string;

export type TemplateColumn =
  TemplateSumColumn |
  TemplateCountColumn |
  TemplateQuotientColumn;

export type TemplateColumnOrReference =
  TemplateColumn |
  TemplateColumnReference;

export enum ColumnType {
  Reference = 'reference',
  Sum = 'sum',
  Count = 'count',
  Quotient = 'quotient',
}

export enum DisplayFormat {
  None = 'none',
  Currency = 'currency',
  Percentage = 'percent',
}

export interface ColumnOptions {
  format?: DisplayFormat;
  rowFilters?: RowFilter[];
  variableRowFilters?: VariableRowFilter[];
}

export interface ColumnMetadata extends InternalMetadata {
  identifier: ColumnIdentifier;
  templateType: TemplateType.Column;
  columnType: ColumnType;
}

export interface AbstractTemplateColumn extends InternalTemplate {
  displayName: string;
  metadata: ColumnMetadata;
  options: ColumnOptions;
}

export interface ReferenceColumnMetadata {
  templateType: TemplateType.Column;
  columnType: ColumnType.Reference;
  reference: ColumnIdentifier;
}

export interface TemplateColumnReference {
  metadata: ReferenceColumnMetadata;
}

export interface TemplateSumColumn extends AbstractTemplateColumn {
  metadata: ColumnMetadata & { columnType: ColumnType.Sum; };
  sumColumn: ColumnLiteral;
}

export interface TemplateCountColumn extends AbstractTemplateColumn {
  metadata: ColumnMetadata & { columnType: ColumnType.Count; };
  countColumn: ColumnLiteral;
  countValue: string;
}

export interface TemplateQuotientColumn extends AbstractTemplateColumn {
  metadata: ColumnMetadata & { columnType: ColumnType.Quotient; };
  numeratorTemplateColumn: TemplateColumnOrReference;
  denominatorTemplateColumn: TemplateColumnOrReference;
}

export interface DisplayColumn {
  uid: string;
  identifier: ColumnIdentifier;
  parameters: DisplayColumnParameters;
}

export interface DisplayColumnParameters {
  inscriptionDisplayName?: string;
  userDisplayName?: string;
  format?: DisplayFormat;
  rowFilters?: RowFilter[];
}
