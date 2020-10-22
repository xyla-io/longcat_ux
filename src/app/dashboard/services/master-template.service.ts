import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { Subject, Observable } from 'rxjs';
import { TemplateBreakdown, BreakdownIdentifier } from 'src/app/dashboard/interfaces/breakdown';
import {
  TemplateType,
  BlockTemplate,
} from 'src/app/dashboard/interfaces/template';
import {
  TemplateColumn,
  ColumnIdentifier,
} from 'src/app/dashboard/interfaces/column';
import { ColumnOps } from 'src/app/dashboard/workers/util/column';
import { InscriptionOps } from 'src/app/dashboard/workers/util/inscription';
import { TemplateService } from 'src/app/dashboard/services/template.service';
import { XyloService } from 'src/app/dashboard/services/xylo.service';
import {
  ColumnCategory,
  EnhancedTemplateMaster,
  isEnhancedTemplateMaster,
  StructureMaster,
  TemplateMaster,
  ColumnCategoryIdentifier,
} from 'src/app/dashboard/interfaces/master';
import { ColumnGenerationOps } from 'src/app/dashboard/workers/util/column-generation';
import {
  MergeStrategy,
  hasValueSelectionCrate,
  hasChoicesCrate,
} from 'src/app/dashboard/interfaces/filter';


@Injectable({
  providedIn: 'root'
})
export class MasterTemplateService {

  private cachedTemplates: Map<string, EnhancedTemplateMaster> = new Map();
  private _masterTemplateUpdate$: Subject<EnhancedTemplateMaster> = new Subject();

  get masterTemplateUpdate$(): Observable<EnhancedTemplateMaster> { return this._masterTemplateUpdate$; }

  constructor(
    private xyloService: XyloService,
    private templateService: TemplateService,
  ) {}

  private static enhanceMasterTemplate(masterTemplate: TemplateMaster|EnhancedTemplateMaster): EnhancedTemplateMaster {
    if (isEnhancedTemplateMaster(masterTemplate))  { return; }
    const templateColumnMap = MasterTemplateService.mapOfResolvedTemplateColumns(masterTemplate.structure.templateColumns);
    const templateBreakdownMap = MasterTemplateService.mapOfTemplateBreakdowns(masterTemplate.structure.templateBreakdowns);
    const columnCategoryMap = MasterTemplateService.mapOfColumnCategories(masterTemplate.structure.columnCategories);
    const columnToColumnCategoryMap = MasterTemplateService.mapOfColumnsToColumnCategories(masterTemplate.structure.columnCategories);
    return cloneDeep(Object.assign({}, masterTemplate, {
      enhancements: {
        templateColumnMap,
        templateBreakdownMap,
        columnCategoryMap,
        columnToColumnCategoryMap,
      },
      metadata: Object.assign({}, masterTemplate.metadata, {
        enhanced: true,
      }),
    }));
  }

  private static mapOfResolvedTemplateColumns(
    templateColumns: TemplateColumn[],
  ): Map<ColumnIdentifier, TemplateColumn> {
    return templateColumns.reduce((map, column) => {
      map.set(
        column.metadata.identifier,
        ColumnOps.resolveReferences(column, templateColumns)
      );
      return map;
    }, new Map<string, TemplateColumn>());
  }

  private static mapOfTemplateBreakdowns(
    templateBreakdowns: TemplateBreakdown[],
  ): Map<BreakdownIdentifier, TemplateBreakdown> {
    return TemplateService.mapOfTemplates(
      templateBreakdowns,
    ) as Map<BreakdownIdentifier, TemplateBreakdown>;
  }

  private static mapOfColumnCategories(
    columnCategories: ColumnCategory[],
  ): Map<ColumnCategoryIdentifier, ColumnCategory> {
    return TemplateService.mapOfTemplates(
      columnCategories
    ) as Map<ColumnCategoryIdentifier, ColumnCategory>;
  }

  private static mapOfColumnsToColumnCategories(
    columnCategories: ColumnCategory[]
  ): Map<ColumnIdentifier, ColumnCategory> {
    return columnCategories.reduce((map, columnCategory) => {
      columnCategory.columnIdentifiers.forEach(columnIdentifier => {
        map.set(columnIdentifier, columnCategory);
      });
      return map;
    }, new Map<ColumnIdentifier, ColumnCategory>());
  }

  private static applyExtensionsToMaster(
    extensions: StructureMaster,
    master: EnhancedTemplateMaster
  ): TemplateMaster {
    const masterClone = cloneDeep(master);
    const { structure, enhancements } = masterClone;
    const {
      columnCategories,
      templateColumns,
      templateBreakdowns
    } = extensions;
    if (columnCategories.length) {
      structure.columnCategories.push(...columnCategories);
    }
    if (templateColumns.length) {
      structure.templateColumns.push(...templateColumns);
    }
    if (templateBreakdowns.length) {
      structure.templateBreakdowns.push(...templateBreakdowns);
    }
    if (extensions.options.variableRowFilters) {
      masterClone.structure.options.variableRowFilters = TemplateService.mergeTemplateArrays(
        masterClone.structure.options.variableRowFilters || [],
        extensions.options.variableRowFilters
      );
    }
    if (isEnhancedTemplateMaster(masterClone)) {
      delete masterClone.enhancements;
      masterClone.metadata.enhanced = false;
    }
    return masterClone;
  }

  async updateDynamicMasterExtensions(
    embedPath: string,
    masterTemplate: EnhancedTemplateMaster
  ): Promise<Partial<StructureMaster>> {
    const dynamicColumnCategories = cloneDeep(masterTemplate.structure.dynamicColumnCategories || []);
    const variableRowFilters = cloneDeep(masterTemplate.structure.options.variableRowFilters || []);

    const newColumnCategories: ColumnCategory[] = [];
    const newColumns: TemplateColumn[] = [];

    await Promise.all([].concat(
      variableRowFilters.map(async variableRowFilter => {
        const valueCargo = variableRowFilter.value;
        if (!hasChoicesCrate(valueCargo)) { return; }
        if (!hasValueSelectionCrate(valueCargo.choices)) { return; }
        const { values, dynamicValues } = valueCargo.choices.select;
        const { mergeStrategy } = dynamicValues;
        if (!dynamicValues) { return; }
        const existingValuesSet = new Set<string>(
          mergeStrategy === MergeStrategy.Merge ? values : []
        );
        const distinctValues = (await this.xyloService.getDistinctValues({
          dataSetKey: embedPath,
          distinctValuesColumn: dynamicValues.distinctValuesColumn,
        })).filter(x => x !== '').map(x => String(x));
        distinctValues.forEach(value => existingValuesSet.add(value));
        valueCargo.choices.select.values = Array.from(existingValuesSet);
      }),
      dynamicColumnCategories.map(async dynamicCategory => {
        const { columnCategoryForEach, metadata: dynamicCategoryMetadata } = dynamicCategory;
        if (columnCategoryForEach) {
          const { distinctValuesColumn } = columnCategoryForEach;
          const distinctValues = (await this.xyloService.getDistinctValues({
            dataSetKey: embedPath,
            distinctValuesColumn,
          })).filter(x => x !== '').map(x => String(x));

          const tagTemplateColumns = {};

          distinctValues.forEach(value => {
            const generatedTemplateColumns = columnCategoryForEach.generateTemplateColumns.map(info => {
              const generatedTemplateColumn = ColumnGenerationOps.generateTemplateColumnWithValueFilter(
                dynamicCategoryMetadata.identifier,
                info,
                distinctValuesColumn,
                value,
                masterTemplate.structure.templateColumns,
                tagTemplateColumns
              );
              tagTemplateColumns[info.tag] = generatedTemplateColumn;
              return generatedTemplateColumn;
            });
            const generatedColumnCategory: ColumnCategory = {
              metadata: {
                identifier: ColumnGenerationOps.dynamicColumnCategoryIdentifier(
                  dynamicCategoryMetadata.identifier,
                  value
                ),
                templateType: TemplateType.ColumnCategory,
              },
              displayName: InscriptionOps.inscribeText(
                columnCategoryForEach.inscribeDisplayName,
                InscriptionOps.Placeholders.Value,
                value
              ),
              columnIdentifiers: generatedTemplateColumns.map(column => {
                return column.metadata.identifier;
              }),
            };

            const existingColumnIdentifiers = new Set(
              masterTemplate.structure.templateColumns
                .map(existingColumn => existingColumn.metadata.identifier)
            );

            const existingColumnCategoryIdentifiers = new Set(
              masterTemplate.structure.columnCategories
                .map(existingColumnCategory => existingColumnCategory.metadata.identifier)
            );

            const allColumnsAreNew = generatedTemplateColumns.every(generatedColumn => {
              return !existingColumnIdentifiers.has(generatedColumn.metadata.identifier);
            });
            const columnCategoryDoesNotExist = !existingColumnCategoryIdentifiers.has(
              generatedColumnCategory.metadata.identifier
            );
            if (allColumnsAreNew && columnCategoryDoesNotExist) {
              newColumns.push(...generatedTemplateColumns);
              newColumnCategories.push(generatedColumnCategory);
            }
          });
        }
      })
    ));
    const extensions: StructureMaster = {
      defaultDisplayName: null,
      columnCategories: newColumnCategories,
      templateColumns: newColumns,
      dynamicColumnCategories: [],
      templateBreakdowns: [],
      options: {
        variableRowFilters,
      },
    };
    const extendedMaster = MasterTemplateService.applyExtensionsToMaster(extensions, masterTemplate);
    return await this.updateMasterTemplate(extendedMaster);
  }

  async getMasterTemplate(template: BlockTemplate): Promise<EnhancedTemplateMaster> {
    return this.getMasterTemplateByPath(template.metadata.parentPath);
  }

  async getMasterTemplateByPath(path: string): Promise<EnhancedTemplateMaster> {
    if (this.cachedTemplates.has(path)) { return this.cachedTemplates.get(path); }
    const masterTemplate = await this.templateService.populateTemplateReferences([ path ])
      .then(record => record[path] as TemplateMaster);
    const enhancedMasterTemplate = MasterTemplateService.enhanceMasterTemplate(masterTemplate);
    this.cachedTemplates.set(path, enhancedMasterTemplate);
    this._masterTemplateUpdate$.next(enhancedMasterTemplate);
    return enhancedMasterTemplate;
  }

  async updateMasterTemplate(masterTemplate: TemplateMaster): Promise<EnhancedTemplateMaster> {
    const masterClone = cloneDeep(masterTemplate);
    if (isEnhancedTemplateMaster(masterClone)) {
      delete masterClone.enhancements;
      masterClone.metadata.enhanced = false;
    }
    return this.templateService.updateTemplates({
      delete: [],
      create: {},
      replace: { [masterTemplate.path]: masterClone },
    }).then(templates => {
      const updatedMaster = templates.replaced[masterTemplate.path];
      const enhancedUpdatedMaster = MasterTemplateService.enhanceMasterTemplate(updatedMaster);
      this.cachedTemplates.set(updatedMaster.path, enhancedUpdatedMaster);
      this._masterTemplateUpdate$.next(enhancedUpdatedMaster);
      return enhancedUpdatedMaster;
    });
  }
}
