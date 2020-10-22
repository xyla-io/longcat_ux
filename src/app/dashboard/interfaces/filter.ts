import { ColumnLiteral } from './column';
import { AbstractMetadata, TemplateType } from 'src/app/dashboard/interfaces/template';

export enum ComparisonOperator {
  Equal = 'equal',
  LessThanOrEqual = 'less_than_or_equal',
}

export interface RowFilterSet {
  variableRowFilters: Map<string, VariableRowFilter>;
  rowFilters: Map<string, RowFilter>;
}

export enum MergeStrategy {
  Merge = 'merge',
}

export type FilterValue = string;

export interface SelectionCrate {
  select: any;
}

export function hasSelectionCrate(obj: any): obj is SelectionCrate {
  return obj && obj.select;
}

export interface RangeSelectionCrate extends SelectionCrate {
  select: {
    min: number;
    max: number;
  };
}

export function hasRangeSelectionCrate(obj: any): obj is RangeSelectionCrate {
  return obj
    && obj.select
    && typeof obj.select.min === 'number'
    && typeof obj.select.max === 'number';
}

export interface ValueSelectionCrate extends SelectionCrate {
  select: {
    values: FilterValue[];
    dynamicValues?: {
      distinctValuesColumn: string;
      mergeStrategy: MergeStrategy;
    };
  };
}

export function hasValueSelectionCrate(obj: any): obj is ValueSelectionCrate {
  return obj
    && obj.select
    && obj.select.values;
}

export interface OperatorChoice {
  operator: ComparisonOperator;
  displayName: string;
}

export interface ColumnChoice {
  column: ColumnLiteral;
  displayName: string;
}

type Crate = any;

export interface ConstantCrate<T> extends Crate {
  constant: T;
}

export function hasConstantCrate(obj: any): obj is ConstantCrate<any> {
  return obj && obj.constant !== undefined;
}

export interface ListChoicesCrate<T> extends Crate {
  choices: T[];
}

export function hasListChoicesCrate(obj: any): obj is ListChoicesCrate<any> {
  return obj && obj.choices && Array.isArray(obj.choices);
}

export interface ColumnChoicesCrate<T> extends Crate {
  columnChoices: Record<ColumnLiteral, T>;
}

export function hasColumnChoicesCrate(obj: any): obj is ColumnChoicesCrate<any> {
  return obj && obj.columnChoices;
}

export interface ChoicesCrate<T> extends Crate {
  choices: T;
}

export function hasChoicesCrate(obj: any): obj is ChoicesCrate<any> {
  return obj && obj.choices;
}

type OperatorCargo = ConstantCrate<OperatorChoice> | ListChoicesCrate<OperatorChoice>;
type ColumnCargo = ConstantCrate<ColumnChoice> | ListChoicesCrate<ColumnChoice>;
type ValueCargo<T> =
  ConstantCrate<FilterValue>
  | ChoicesCrate<T>
  | ColumnChoicesCrate<T>;


export interface VariableRowFilterMetadata extends AbstractMetadata {
  templateType: TemplateType.VariableRowFilter;
  identifier: string;
}

export interface VariableRowFilter {
  metadata: VariableRowFilterMetadata;
  inscribeDisplayName?: string;
  optional?: boolean;
  optionalName?: boolean;
  inscribeDisplayNameOptional?: string;
  default?: RowFilter;
  column: ColumnCargo;
  operator: OperatorCargo;
  value: ValueCargo<FilterValue>;
}

export interface RowFilterMetadata extends AbstractMetadata {
  templateType: TemplateType.RowFilter;
  identifier: string;
}

export interface RowFilter {
  metadata: RowFilterMetadata;
  column: ColumnLiteral;
  value: FilterValue;
  operator: ComparisonOperator;

  /* TODO below is a tentative placeholder for allowing multiple comparisons to
     be constructed and OR'ed (||) together. Has not yet been implemented. */

  // orWith?: RowFilter;
}

export interface VariableRowFilterWithSelection extends VariableRowFilter {
  activeSelection: RowFilter;
}

