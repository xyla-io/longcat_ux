import { cloneDeep } from 'lodash-es';
import {
  DisplayColumn,
  ColumnIdentifier,
  ColumnType,
  TemplateColumnOrReference,
  TemplateColumn,
  TemplateSumColumn,
  TemplateCountColumn,
  TemplateQuotientColumn,
  TemplateColumnReference,
} from 'src/app/dashboard/interfaces/column';
import { RowFilterOps } from 'src/app/dashboard/workers/util/row-filter';
import { InscriptionOps } from './inscription';

export class ColumnOps {

  static getDisplayColumnName({ displayColumn, templateColumn }: {
    templateColumn: TemplateColumn;
    displayColumn?: DisplayColumn;
  }): string {
    if (displayColumn) {
      const { userDisplayName } = displayColumn.parameters;
      if (userDisplayName) { return userDisplayName; }
    }
    return InscriptionOps.inscribeAllReplacements({
      baseDisplayName: templateColumn.displayName,
      inscriptionRecords: RowFilterOps.getVariableRowFilters(templateColumn),
      replacementRecords: displayColumn ? displayColumn.parameters.rowFilters : [],
    });
  }

  static getTemplateColumns(
    displayColumns: DisplayColumn[],
    templateColumnMap: Map<ColumnIdentifier, TemplateColumn>
  ): TemplateColumn[] {
    return displayColumns
      .map(displayColumn => templateColumnMap.get(displayColumn.identifier));
  }

  static resolveReferences(template: TemplateColumn, templates: TemplateColumn[]): TemplateColumn {
    function resolve(innerTemplate): TemplateColumn {
      if (ColumnOps.isReferenceColumn(innerTemplate)) {
        const resolvedTemplate = templates.find(t => t.metadata.identifier === innerTemplate.metadata.reference);
        return resolvedTemplate;
      }
      return innerTemplate;
    }

    const templateClone = cloneDeep(template);

    if (ColumnOps.isQuotientColumn(templateClone)) {
      const resolvedTemplate = Object.assign({}, templateClone,
        {
          numeratorTemplateColumn: resolve(templateClone.numeratorTemplateColumn),
          denominatorTemplateColumn: resolve(templateClone.denominatorTemplateColumn),
        }
      );
      resolvedTemplate.options.variableRowFilters = (resolvedTemplate.options.variableRowFilters || []).concat(
        resolvedTemplate.numeratorTemplateColumn.options.variableRowFilters,
        resolvedTemplate.denominatorTemplateColumn.options.variableRowFilters,
      ).filter(x => x);
      return resolvedTemplate;
    }
    return templateClone;
  }

  static isConcreteColumn(template: TemplateColumnOrReference): template is TemplateColumn {
    return ColumnOps.isSumColumn(template) ||
      ColumnOps.isCountColumn(template) ||
      ColumnOps.isQuotientColumn(template);
  }

  static isSumColumn(template: TemplateColumnOrReference): template is TemplateSumColumn {
    return template.metadata.columnType === ColumnType.Sum;
  }
  static isCountColumn(template: TemplateColumnOrReference): template is TemplateCountColumn {
    return template.metadata.columnType === ColumnType.Count;
  }
  static isQuotientColumn(template: TemplateColumnOrReference): template is TemplateQuotientColumn {
    return template.metadata.columnType === ColumnType.Quotient;
  }
  static isReferenceColumn(template: TemplateColumnOrReference): template is TemplateColumnReference {
    return template.metadata.columnType === ColumnType.Reference;
  }

}
