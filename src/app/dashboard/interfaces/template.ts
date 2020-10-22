import { UnionQueryParameters } from 'src/app/dashboard/interfaces/query';
import { DisplayColumn, TemplateColumn } from 'src/app/dashboard/interfaces/column';
import { StructureMaster } from 'src/app/dashboard/interfaces/master';

export type TemplateIdentifier = string;

export enum TemplateType {
  // Top-level template
  Query = 'query',

  // Master Template
  // (Points to a Query)
  Master = 'master',

  // Contains a set of Block templates and layout information
  DashboardContent = 'dashboard_content',
  GridContent = 'grid_content',

  // Block Templates
  // (Points to Master)
  BigNumber = 'big_number',
  BreakdownTable = 'breakdown_table',
  ChartNode = 'chart_node',

  // Group Templates
  // (Contains a set of Block templates that share the same parent template)
  Group = 'group',

  // Deck Templates
  // (Contains a list of Block templates that share the same template type
  Deck = 'deck',

  // Internal Templates
  // (Used to compose Block and Master Templates)
  Breakdown = 'breakdown',
  Column = 'column',
  ColumnCategory = 'column_category',
  DynamicColumnCategory = 'dynamic_column_category',
  RowFilter = 'row_filter',
  VariableRowFilter = 'variable_row_filter',

  // Parser Templates
  TagParser = 'tag_parser',

  // Grid Templates
  // (May merge with Block Templates)
  PerformanceGrid = 'performance_grid',
}

/**
 * Abstract template interfaces
 */
export interface AbstractMetadata {
  identifier: TemplateIdentifier;
  templateType: TemplateType;
}

export interface AbstractTemplate {
  metadata: AbstractMetadata;
  [x: string]: any;
}

export interface RecordOfTemplates<T extends AbstractTemplate> {
  [identifier: string]: T;
}

/**
 * Internal template interfaces
 */
export interface InternalMetadata extends AbstractMetadata {
  [x: string]: any;
}

export interface InternalTemplate extends AbstractTemplate {
  metadata: InternalMetadata;
}

/**
 * Block template interfaces
 */
export interface BlockMetadata extends InternalMetadata {
  parentPath: string;
  parentVersion: number;
  more: Record<string, any>;
}

export interface BlockStructure {
  [x: string]: any;
  options?: any;
}

export interface BlockTemplate extends AbstractTemplate {
  path: string;
  metadata: BlockMetadata;
  queryParameters?: UnionQueryParameters;
  structure: BlockStructure;
}

export function isBlockTemplate(obj: any): obj is BlockTemplate {
  return obj && obj.metadata
    && obj.metadata.templateType
    && obj.metadata.parentPath
    && typeof obj.metadata.parentVersion === 'number';
}

/**
 * Template reference
 */
export interface TemplateReference {
  reference: string; // template path
}

/**
 * Group template interfaces
 *
 * A TemplateGroup is a group of BlockTemplates that share the same
 * parent template (i.e., the parentPath and parentVersion of each template
 * in the group is identical)
 */
export interface MetadataGroup extends BlockMetadata {
  templateType: TemplateType.Group;
  more: {
    groupKey: string;
  };
}

export interface TemplateGroup<T> extends BlockTemplate {
  metadata: MetadataGroup;
  structure: {
    displayName: string,
    templates: T[];
  };
}

export function isTemplateGroup(obj: any): obj is TemplateGroup<any> {
  return obj && obj.metadata
    && obj.metadata.templateType === TemplateType.Group
    && obj.structure
    && obj.structure.templates;
}

export interface MetadataDeck extends BlockMetadata {
  templateType: TemplateType.Deck;
  more: {
    deckKey: string;
  };
}

/**
 * Deck template interfaces
 *
 * A TemplateDeck is a list of BlockTemplates that are organized in a named
 * collection to facilitate UX-level groupings that may be necessary for
 * layout purposes. Each BlockTemplate in a deck manages its own
 * queryParameters and points to its own parentPath.
 */
export interface TemplateDeck<T> extends BlockTemplate {
  metadata: MetadataDeck;
  structure: {
    displayName?: string;
    templates: T[];
  };
}

export function isTemplateDeck(obj: any): obj is TemplateDeck<any> {
  return obj && obj.metadata
    && obj.metadata.templateType === TemplateType.Deck
    && obj.structure
    && obj.structure.templates;
}

export type TemplateCollection<T> = TemplateGroup<T>|TemplateDeck<T>;
export function isTemplateCollection(obj: any): obj is TemplateCollection<any> {
  return isTemplateDeck(obj) || isTemplateGroup(obj);
}
