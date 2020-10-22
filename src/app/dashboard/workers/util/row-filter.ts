import { DataSet } from 'development_packages/xylo/index';
import {
  RowFilter,
  VariableRowFilter,
  ComparisonOperator,
  hasConstantCrate,
  SelectionCrate,
  RowFilterSet,
  hasChoicesCrate,
  hasValueSelectionCrate,
} from 'src/app/dashboard/interfaces/filter';
import { TemplateColumn, ColumnLiteral } from 'src/app/dashboard/interfaces/column';

export class RowFilterOps {

  static filterRows(dataSet: DataSet, rowFilters: RowFilter[]): DataSet {
    return new DataSet(rowFilters.reduce((df, filter) => {
      switch (filter.operator) {
        case ComparisonOperator.Equal:
          return df.filter(row => String(row.get(filter.column)) === String(filter.value));
        case ComparisonOperator.LessThanOrEqual:
          return df.filter(row => {
            const value = row.get(filter.column);
            if (value === '' || value === undefined || value === null) { return false; }
            return Number(value) <= Number(filter.value);
          });
        default:
          return df;
      }
    }, dataSet.dataFrame));
  }


  static getVariableRowFilters(templateColumn: TemplateColumn): VariableRowFilter[]  {
    return templateColumn.options.variableRowFilters || [];
  }

  private static getDefault(variableRowFilter: VariableRowFilter, property: 'operator'|'column'): string {
    if (variableRowFilter.default) {
      return variableRowFilter.default[property];
    }
    if (variableRowFilter[property].constant) {
      return variableRowFilter[property].constant[property];
    }
    return variableRowFilter[property].choices[0][property];
  }

  static replaceNullsWithDefault(rowFilter: RowFilter, variableRowFilter: VariableRowFilter) {
    if (!rowFilter.column) {
      rowFilter.column = RowFilterOps.getDefaultColumn(variableRowFilter);
    }
    if (!rowFilter.operator) {
      rowFilter.operator = RowFilterOps.getDefaultOperator(variableRowFilter);
    }
    if (!rowFilter.value) {
      rowFilter.value = RowFilterOps.getDefaultValue(variableRowFilter, rowFilter.column);
    }
  }

  static getDefaultColumn(variableRowFilter: VariableRowFilter): string {
    return RowFilterOps.getDefault(variableRowFilter, 'column');
  }

  static getDefaultOperator(variableRowFilter: VariableRowFilter): ComparisonOperator {
    return RowFilterOps.getDefault(variableRowFilter, 'operator') as ComparisonOperator;
  }

  static getDefaultValue(variableRowFilter: VariableRowFilter, columnLiteral: ColumnLiteral): string {
    if (variableRowFilter.default) {
      return variableRowFilter.default.value;
    }
    if (hasConstantCrate(variableRowFilter.value)) {
      return variableRowFilter.value.constant;
    }

    const throwImplementationError = () => {
      throw new Error('Code path for default value not available for ' + JSON.stringify(variableRowFilter));
    };

    function getFirstChoice(
      choices: SelectionCrate[],
      columnChoices: Record<ColumnLiteral, SelectionCrate>,
      column: ColumnLiteral
    ) {
      if (choices) {
        return choices[0];
      } else if (columnChoices) {
        return columnChoices[column];
      }
      throwImplementationError();
    }

    function getFirstValueForChoice(choice: SelectionCrate): string {
      if (choice.select) {
        if (choice.select.values) {
          return choice.select.values[0];
        }
        if (typeof choice.select.min === 'number') {
          return choice.select.min;
        }
      }
      throwImplementationError();
    }

    return getFirstValueForChoice(getFirstChoice(
      (variableRowFilter.value as any).choices,
      (variableRowFilter.value as any).columnChoices,
      columnLiteral
    ));
  }

  static findFilter(rowFilterSet: RowFilterSet, filterIdentifier: string): {
    rowFilter: RowFilter,
    variableRowFilter: VariableRowFilter,
  } {
      const targetFilter = { rowFilter: null, variableRowFilter: null };
      targetFilter.variableRowFilter = rowFilterSet.variableRowFilters.get(filterIdentifier);
      targetFilter.rowFilter = rowFilterSet.rowFilters.get(filterIdentifier);
      return targetFilter;
  }

  static shouldShowProductNameFilter(rowFilterSet: RowFilterSet): boolean {
    const {
      variableRowFilter
    } = RowFilterOps.findFilter(rowFilterSet, 'row_filter:product_name');
    if (!variableRowFilter) { return false; }
    if (!hasChoicesCrate(variableRowFilter.value)) { return false; }
    if (!hasValueSelectionCrate(variableRowFilter.value.choices)) { return false; }
    const { values } = variableRowFilter.value.choices.select;
    if (values.filter(value => value !== 'Other').length < 2) { return false; }
    return true;
  }
}

