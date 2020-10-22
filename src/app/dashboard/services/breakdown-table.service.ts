import { Injectable } from '@angular/core';
import { Model, DataSet } from 'development_packages/xylo/src/browser';
import {
  DisplayColumn,
} from 'src/app/dashboard/interfaces/column';
import {
  EnhancedTemplateMaster,
} from 'src/app/dashboard/interfaces/master';
import {
  TemplateType,
  BlockTemplate,
  BlockMetadata,
} from 'src/app/dashboard/interfaces/template';

import { UnionQueryParameters } from 'src/app/dashboard/interfaces/query';
import { BreakdownIdentifier } from 'src/app/dashboard/interfaces/breakdown';
import { XyloService } from 'src/app/dashboard/services/xylo.service';
import { ModelTreeGrid } from 'src/app/dashboard/workers/util/aggregation';
import { DashboardContentService } from 'src/app/dashboard/services/dashboard-content.service';
import { MasterTemplateService } from 'src/app/dashboard/services/master-template.service';
import { RowFilter } from '../interfaces/filter';

export type BreakdownTableIdentifier = string;

export interface MetadataBreakdownTable extends BlockMetadata {
  identifier: BreakdownTableIdentifier;
  parentPath: string;
  parentVersion: number;
  templateType: TemplateType.BreakdownTable;
}

export interface StructureBreakdownTable {
  displayName?: string;
  displayColumns: DisplayColumn[];
  displayBreakdownIdentifiers: BreakdownIdentifier[];
  options: {
    rowFilters: RowFilter[];
  };
}

export interface TemplateBreakdownTable extends BlockTemplate {
  metadata: MetadataBreakdownTable;
  queryParameters?: UnionQueryParameters;
  structure: StructureBreakdownTable;
}
export interface ModelBreakdownTable {
  breakdownTree: ModelTreeGrid;
}

@Injectable({
  providedIn: 'root'
})
export class BreakdownTableService {

  constructor(
    private xyloService: XyloService,
    private dashboardContentService: DashboardContentService,
    private masterTemplateService: MasterTemplateService,
  ) { }

  private static concatFilters(template: TemplateBreakdownTable, master: EnhancedTemplateMaster): RowFilter[] {
    return (template.structure.options.rowFilters || []).concat(master.structure.options.rowFilters || []);
  }

  async instantiate(template: TemplateBreakdownTable): Promise<ModelBreakdownTable> {
    const masterTemplate = await this.masterTemplateService.getMasterTemplate(template);
    const embedPath = this.dashboardContentService.getEmbedPathForTemplate(template);
    return {
      breakdownTree: await this.xyloService.aggregateTable({
        dataSetKey: embedPath,
        displayColumns: template.structure.displayColumns,
        templateColumnMap: masterTemplate.enhancements.templateColumnMap,
        displayBreakdownIdentifiers: template.structure.displayBreakdownIdentifiers,
        templateBreakdownMap: masterTemplate.enhancements.templateBreakdownMap,
        rowFilters: BreakdownTableService.concatFilters(template, masterTemplate),
      }),
    };
  }
}
