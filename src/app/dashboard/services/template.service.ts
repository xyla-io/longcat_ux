import { Injectable } from '@angular/core';
import {
  AbstractTemplate,
  TemplateIdentifier,
  BlockTemplate,
  TemplateType,
  isBlockTemplate,
  TemplateReference,
  TemplateCollection,
  isTemplateCollection,
} from 'src/app/dashboard/interfaces/template';
import { cloneDeep } from 'lodash-es';
import { APIService, APIResponse } from 'src/app/services/api/api.service';
import { CompanyReportsService } from 'src/app/services/api/company-reports.service';
import { AccessService } from 'src/app/services/access/access.service';
import { SetUtil } from 'src/app/util/set.util';
import { computeHashForObject } from 'src/app/util/hash.util';
import { EventTemplateUpdate } from 'src/app/editing/services/editing.service';
import { RowFilterSet, RowFilter } from '../interfaces/filter';

export interface PopulateTemplatesResponse extends APIResponse {
  templates: Record<string, BlockTemplate>;
}

export interface TemplateUpdates {
  delete: string[];
  create: Record<string, AbstractTemplate>;
  replace: Record<string, AbstractTemplate>;
}

export interface UpdatedTemplates {
  deleted: string[];
  created: {};
  replaced: {};
}

export interface UpdateTemplatesResponse extends APIResponse {
  templates: UpdatedTemplates;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  private templatesURL = `${APIService.baseURL}/templates`;
  private populateTemplatesURL = `${this.templatesURL}/populate`;
  private updateTemplatesURL = `${this.templatesURL}/update`;

  constructor(
    private api: APIService,
    private reportsService: CompanyReportsService,
    private accessService: AccessService,
  ) { }

  static mapOfTemplates(
    templates: AbstractTemplate[],
  ): Map<TemplateIdentifier, AbstractTemplate> {
    return templates.reduce((map, template) => {
      const { identifier } = template.metadata;
      map.set(identifier, template);
      return map;
    }, new Map<TemplateIdentifier, AbstractTemplate>());
  }

  static recordOfTemplatePathsToTemplates(
    templates: AbstractTemplate[],
    options: {
      includeIdentifiers?: TemplateIdentifier[]
      includePaths?: string[]
    } = {},
  ): Record<string, AbstractTemplate> {
    const shouldFilterIdentifiers = options.includeIdentifiers && options.includeIdentifiers.length;
    const shouldFilterPaths = options.includePaths && options.includePaths.length;
    return templates.reduce((record, template) => {
      const { identifier } = template.metadata;
      const path = template.path;
      if (shouldFilterIdentifiers && options.includeIdentifiers.includes(identifier)) {
        record[path] = template;
      }
      if (shouldFilterPaths && options.includePaths.includes(path)) {
        record[path] = template;
      }
      return record;
    }, {});
  }

  static isSameTemplate(a: AbstractTemplate, b: AbstractTemplate): boolean {
    if (!a || !b) { return false; }
    if ((a.path || b.path) && a.path !== b.path) { return false; }
    const { identifier: identifierA, templateType: templateTypeA, } = a.metadata;
    const { identifier: identifierB, templateType: templateTypeB, } = b.metadata;
    if (templateTypeA !== templateTypeB) { return false; }
    if (identifierA !== identifierB) { return false; }
    return true;
  }

  static updateRowFilter(template: BlockTemplate, rowFilter: RowFilter): BlockTemplate {
    const templateClone = cloneDeep(template);
    templateClone.structure.options = templateClone.structure.options || {};
    templateClone.structure.options.rowFilters = templateClone.structure.options.rowFilters || [];
    const { rowFilters } = templateClone.structure.options;
    const existingIndex = rowFilters.findIndex(existingRowFilter => TemplateService.isSameTemplate(rowFilter, existingRowFilter));
    if (~existingIndex) {
      if (rowFilter.column === null) {
        rowFilters.splice(existingIndex, 1);
      } else {
        rowFilters.splice(existingIndex, 1, rowFilter);
      }
    } else if (rowFilter.column !== null) {
      rowFilters.push(rowFilter);
    }
    return templateClone;
  }

  static mergeTemplateArrays<T extends AbstractTemplate>(existingTemplates: AbstractTemplate[], newTemplates: AbstractTemplate[]): T[] {
    const mergedTemplates = (existingTemplates || []).map(template => {
      const replacementIndex = newTemplates.findIndex(t => TemplateService.isSameTemplate(template, t));
      if (~replacementIndex) {
        return newTemplates.splice(replacementIndex, 1)[0];
      }
      return template;
    });
    return mergedTemplates.concat(newTemplates || []) as T[];
  }

  private static populateCollectionReferences(
    collection: TemplateCollection<TemplateReference|BlockTemplate>,
    templateDictionary: Record<string, BlockTemplate>
  ): TemplateCollection<BlockTemplate> {
    const clonedCollection = cloneDeep(collection);
    clonedCollection.structure.templates = clonedCollection.structure.templates.map(templateReference => {
      let blockTemplate: BlockTemplate;
      if (isBlockTemplate(templateReference)) {
        blockTemplate = templateReference;
      } else {
        blockTemplate = templateDictionary[templateReference.reference];
      }
      if (isTemplateCollection(blockTemplate)) {
        blockTemplate = (TemplateService.populateCollectionReferences(blockTemplate, templateDictionary) as BlockTemplate);
      }
      return blockTemplate;
    });
    return clonedCollection as TemplateCollection<BlockTemplate>;
  }

  static buildTemplateUpdates(eventTemplateUpdate: EventTemplateUpdate<BlockTemplate>): TemplateUpdates {
    const { inputTemplate, outputTemplate } = eventTemplateUpdate;

    let deletePaths = [];
    let createTemplates = {};
    let replaceTemplates = {};
    if (isTemplateCollection(inputTemplate) && isTemplateCollection(outputTemplate)) {
      const inputPaths = new Set(inputTemplate.structure.templates.map(template => template.path));
      const outputPaths = new Set(outputTemplate.structure.templates.map(template => template.path));
      deletePaths = Array.from(SetUtil.difference(inputPaths, outputPaths));
      const createPaths = Array.from(SetUtil.difference(outputPaths, inputPaths));
      const replacePaths = Array.from(SetUtil.intersection(inputPaths, outputPaths));
      createTemplates = TemplateService.recordOfTemplatePathsToTemplates(
        outputTemplate.structure.templates,
        { includePaths: createPaths }
      );
      replaceTemplates = TemplateService.recordOfTemplatePathsToTemplates(
        outputTemplate.structure.templates,
        { includePaths: replacePaths }
      );
      const clonedOutputTemplate = cloneDeep(outputTemplate);
      clonedOutputTemplate.structure.templates = outputTemplate.structure.templates.map(t => ({
        reference: t.path,
      }));
      replaceTemplates[outputTemplate.path] = clonedOutputTemplate;
    } else {
      replaceTemplates[outputTemplate.path] = outputTemplate;
    }

    return {
      delete: deletePaths,
      create: createTemplates,
      replace: replaceTemplates,
    };
  }

  buildTemplatePath({
    templateType, identifier, version, unprotected = false
  }: {
    templateType: TemplateType,
    identifier: string,
    version?: number,
    unprotected?: boolean
  }): string {
    const reportPath  = this.reportsService.currentReportPath;
    return AccessService.pathFromComponents(
      AccessService.componentsFromPath(reportPath).concat([
        unprotected ? 'unprotected' : 'protected',
        'template',
        templateType,
        identifier,
        typeof version === 'number' ? version.toString() : null
      ].filter(component => component !== null))
    );
  }

  populateTemplateReferences(templatePaths: string[]): Promise<Record<string, BlockTemplate>> {
    return this.api.client
      .post(this.populateTemplatesURL, {
        paths: templatePaths,
        recursive: true,
      })
      .toPromise()
      .then((response: PopulateTemplatesResponse) => response.templates)
      .then(templates => {
        return templatePaths.reduce((record, path) => {
          let blockTemplate = templates[path];
          if (isTemplateCollection(blockTemplate)) {
            blockTemplate = TemplateService.populateCollectionReferences(blockTemplate, templates) as BlockTemplate;
          }
          record[path] = blockTemplate;
          return record;
        }, {});
      })
      .then(record => {
        return record;
      });
  }

  updateTemplates(templateUpdates: TemplateUpdates): Promise<UpdatedTemplates> {
    return this.api.client
      .post(this.updateTemplatesURL, templateUpdates)
      .toPromise()
      .then(response => (response as UpdateTemplatesResponse).templates);
  }

  getRowFilterSet(template: BlockTemplate): RowFilterSet {
    const rowFilterSet = { rowFilters: new Map(), variableRowFilters: new Map() };
    const { options } = template.structure;
    if (!options) { return rowFilterSet; }
    if (Array.isArray(options.rowFilters)) {
      rowFilterSet.rowFilters = TemplateService.mapOfTemplates(options.rowFilters);
    }
    if (Array.isArray(options.variableRowFilters)) {
      rowFilterSet.variableRowFilters = TemplateService.mapOfTemplates(options.variableRowFilters);
    }
    return rowFilterSet;
  }

}
