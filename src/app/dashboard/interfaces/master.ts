import {
  InternalMetadata,
  TemplateType,
  InternalTemplate,
  BlockMetadata,
  BlockStructure,
  BlockTemplate
} from 'src/app/dashboard/interfaces/template';
import {
  ColumnIdentifier,
  ColumnType,
  ColumnOptions,
  ColumnLiteral,
  TemplateColumn
} from 'src/app/dashboard/interfaces/column';
import {
  TemplateBreakdown,
  BreakdownIdentifier,
} from 'src/app/dashboard/interfaces/breakdown';
import {
  VariableRowFilter,
  RowFilter,
} from 'src/app/dashboard/interfaces/filter';

export type ColumnCategoryIdentifier = string;

export interface MetadataColumnCategory extends InternalMetadata {
  identifier: ColumnCategoryIdentifier;
  templateType: TemplateType.ColumnCategory;
}

export interface ColumnCategory extends InternalTemplate {
  metadata: MetadataColumnCategory;
  displayName: string;
  columnIdentifiers: ColumnIdentifier[];
}

export type DynamicColumnCategoryIdentifier = string;

export interface MetadataDynamicColumnCategory extends InternalMetadata {
  identifier: DynamicColumnCategoryIdentifier;
  templateType: TemplateType.DynamicColumnCategory;
}

export interface GenerateColumnReference {
  template?: string;
  tag?: string;
}

interface GenerateColumnBase {
  tag: string;
  inscribeDisplayName: string;
  columnType: ColumnType;
  options?: ColumnOptions;
}

export interface GenerateColumnFilteredSum extends GenerateColumnBase {
  columnType: ColumnType.Sum;
  sumColumn: ColumnLiteral;
}

export interface GenerateColumnFilteredQuotient extends GenerateColumnBase {
  columnType: ColumnType.Quotient;
  numeratorReference: GenerateColumnReference;
  denominatorReference: GenerateColumnReference;
}

export type GenerateColumn = GenerateColumnFilteredSum | GenerateColumnFilteredQuotient;

interface GenerateColumnCategoryForEach {
  distinctValuesColumn: ColumnLiteral;
  inscribeDisplayName: string;
  generateTemplateColumns: GenerateColumn[];
}

export interface DynamicColumnCategory extends InternalTemplate {
  metadata: MetadataDynamicColumnCategory;
  columnCategoryForEach?: GenerateColumnCategoryForEach;
}

export type MasterIdentifier = string;

export interface MetadataMaster extends BlockMetadata {
  templateType: TemplateType.Master;
  identifier: MasterIdentifier;
  version: number;
  parentPath: string;
  parentVersion: number;
}

export interface OptionsMaster {
  variableRowFilters?: VariableRowFilter[];
  rowFilters?: RowFilter[];
}

export interface StructureMaster extends BlockStructure {
  defaultDisplayName: string;
  templateColumns: TemplateColumn[];
  templateBreakdowns: TemplateBreakdown[];
  columnCategories: ColumnCategory[];
  dynamicColumnCategories: DynamicColumnCategory[];
  options: OptionsMaster;
}

export interface TemplateMaster extends BlockTemplate {
  metadata: MetadataMaster;
  structure: StructureMaster;
}

export function isTemplateMaster(obj: any): obj is TemplateMaster {
  return obj && obj.metadata && obj.metadata.templateType === TemplateType.Master;
}

export interface EnhancedTemplateMaster extends TemplateMaster {
  metadata: MetadataMaster & { enhanced: boolean };
  enhancements: {
    templateColumnMap: Map<ColumnIdentifier, TemplateColumn>;
    templateBreakdownMap: Map<BreakdownIdentifier, TemplateBreakdown>;
    columnCategoryMap: Map<ColumnCategoryIdentifier, ColumnCategory>;
    columnToColumnCategoryMap: Map<ColumnIdentifier, ColumnCategory>;
  };
}

export function isEnhancedTemplateMaster(obj: any): obj is EnhancedTemplateMaster {
  return isTemplateMaster(obj)
    && obj.metadata.enhanced;
}
