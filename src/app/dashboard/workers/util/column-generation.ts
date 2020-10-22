import {
  TemplateColumn,
  TemplateSumColumn,
  ColumnType,
  TemplateQuotientColumn,
  ColumnLiteral,
  ColumnOptions,
  TemplateColumnOrReference,
  TemplateColumnReference
} from 'src/app/dashboard/interfaces/column';
import {
  GenerateColumnFilteredSum,
  GenerateColumnFilteredQuotient,
  GenerateColumn,
} from 'src/app/dashboard/interfaces/master';
import { InscriptionOps } from 'src/app/dashboard/workers/util/inscription';
import { ComparisonOperator } from 'src/app/dashboard/interfaces/filter';
import { TemplateType } from 'src/app/dashboard/interfaces/template';
import { DynamicIdentifierOps } from 'src/app/dashboard/workers/util/dynamic-identifier';

export class ColumnGenerationOps {

  static dynamicColumnCategoryIdentifier(
    generatorIdentifier: string,
    value: string,
  ): string {
    return DynamicIdentifierOps.generateIdentifier({
      namespace: 'dynamic_column_category',
      sourceIdentifier: generatorIdentifier,
      instanceIdentifier: value,
    });
  }

  static dynamicColumnIdentifier(
    generatorIdentifier: string,
    columnInfo: GenerateColumn,
    value: string,
  ): string {
    return DynamicIdentifierOps.generateIdentifier({
      namespace: 'dynamic_column',
      sourceIdentifier: generatorIdentifier,
      sourceTag: columnInfo.tag,
      instanceIdentifier: value,
    });
  }

  static generateTemplateColumnWithValueFilter(
    generatorIdentifier: string,
    columnInfo: GenerateColumn,
    filterColumn: ColumnLiteral,
    value: string,
    templateColumns: TemplateColumn[],
    tagTemplateColumns: Record<string, TemplateColumn>
  ) {
    let columnTemplate: TemplateColumn;
    switch (columnInfo.columnType) {
      case ColumnType.Sum:
        columnTemplate = ColumnGenerationOps.generateTemplateSumColumnWithValueFilter(
          generatorIdentifier,
          columnInfo,
          filterColumn,
          value,
        );
        break;
      case ColumnType.Quotient:
        columnTemplate = ColumnGenerationOps.generateTemplateQuotientColumnWithValueFilter(
          generatorIdentifier,
          columnInfo,
          filterColumn,
          value,
          templateColumns,
          tagTemplateColumns
        );
        break;
    }
    if (!columnTemplate) {
      throw new Error('Received invalid column information when generating dynamic column.');
    }
    return ColumnGenerationOps.applyOptionsToTemplateColumn(
      columnTemplate,
      columnInfo.options,
    );
  }

  private static generateTemplateSumColumnWithValueFilter(
    generatorIdentifier: string,
    columnInfo: GenerateColumnFilteredSum,
    filterColumn: ColumnLiteral,
    value: string,
  ): TemplateSumColumn {
    return {
      metadata: {
        templateType: TemplateType.Column,
        columnType: ColumnType.Sum,
        identifier: ColumnGenerationOps.dynamicColumnIdentifier(
          generatorIdentifier,
          columnInfo,
          value
        ),
      },
      displayName: InscriptionOps.inscribeText(
        columnInfo.inscribeDisplayName,
        InscriptionOps.Placeholders.Value,
        value
      ),
      sumColumn: columnInfo.sumColumn,
      options: {
        rowFilters: [
          {
            metadata: {
              identifier: DynamicIdentifierOps.generateIdentifier({
                namespace: 'row_filter',
                sourceIdentifier: generatorIdentifier,
                sourceTag: columnInfo.tag,
                instanceIdentifier: filterColumn,
              }),
              templateType: TemplateType.RowFilter,
            },
            column: filterColumn,
            operator: ComparisonOperator.Equal,
            value,
          }
        ]
      },
    };
  }

  private static generateTemplateQuotientColumnWithValueFilter(
    generatorIdentifier: string,
    columnInfo: GenerateColumnFilteredQuotient,
    filterColumn: ColumnLiteral,
    value: string,
    templateColumns: TemplateColumn[],
    tagTemplateColumns: Record<string, TemplateColumn>
  ): TemplateQuotientColumn {

    const denominatorColumn: TemplateColumnOrReference = ColumnGenerationOps.generateReferenceTemplateColumn(
      columnInfo.denominatorReference.tag
      ? tagTemplateColumns[columnInfo.denominatorReference.tag].metadata.identifier
      : columnInfo.denominatorReference.template
    );

    const numeratorColumn: TemplateColumnOrReference = ColumnGenerationOps.generateReferenceTemplateColumn(
      columnInfo.numeratorReference.tag
      ? tagTemplateColumns[columnInfo.numeratorReference.tag].metadata.identifier
      : columnInfo.numeratorReference.template
    );

    const quotientColumn: TemplateQuotientColumn = {
      metadata: {
        templateType: TemplateType.Column,
        columnType: ColumnType.Quotient,
        identifier: ColumnGenerationOps.dynamicColumnIdentifier(
          generatorIdentifier,
          columnInfo,
          value
        ),
      },
      displayName: InscriptionOps.inscribeText(
        columnInfo.inscribeDisplayName,
        InscriptionOps.Placeholders.Value,
        value
      ),
      denominatorTemplateColumn: denominatorColumn,
      numeratorTemplateColumn: numeratorColumn,
      options: {},
    };
    return quotientColumn;
  }

  private static generateReferenceTemplateColumn(reference: string): TemplateColumnReference {
    return {
      metadata: {
        templateType: TemplateType.Column,
        columnType: ColumnType.Reference,
        reference,
      }
    };
  }

  private static applyOptionsToTemplateColumn(
    templateColumn: TemplateColumn,
    options?: ColumnOptions,
  ): TemplateColumn {
    if (!options) { return templateColumn; }
    if (options.format) {
      templateColumn.options.format = options.format;
    }

    if (options.rowFilters) {
      const existingRowFilterIdentifierSet = new Set(
        (templateColumn.options.rowFilters || []).map(rowFilter => rowFilter.metadata.identifier)
      );
      const newRowFilters = options.rowFilters.filter(rowFilter => !existingRowFilterIdentifierSet.has(rowFilter.metadata.identifier));
      templateColumn.options.rowFilters = (templateColumn.options.rowFilters || []).concat(newRowFilters);
    }

    if (options.variableRowFilters) {
      const existingVariableRowFilterIdentifierSet = new Set(
        (templateColumn.options.variableRowFilters || []).map(variableRowFilter => variableRowFilter.metadata.identifier)
      );
      const newVariableRowFilters = options.variableRowFilters.filter(variableRowFilter => {
        return !existingVariableRowFilterIdentifierSet.has(variableRowFilter.metadata.identifier);
      });
      templateColumn.options.variableRowFilters = (templateColumn.options.variableRowFilters || []).concat(newVariableRowFilters);
    }

    return templateColumn;
  }

}
