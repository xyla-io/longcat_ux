import { Injectable } from '@angular/core';
import { Model } from 'development_packages/xylo/src/browser';
import {
  TemplateColumn,
  DisplayColumn,
} from 'src/app/dashboard/interfaces/column';
import { MasterTemplateService } from './master-template.service';
import { EnhancedTemplateMaster } from 'src/app/dashboard/interfaces/master';
import {
  TemplateType,
  BlockMetadata,
  BlockTemplate
} from 'src/app/dashboard/interfaces/template';
import { UnionQueryParameters } from 'src/app/dashboard/interfaces/query';
import { XyloService } from 'src/app/dashboard/services/xylo.service';
import { ColumnOps } from 'src/app/dashboard/workers/util/column';
import { DashboardContentService } from 'src/app/dashboard/services/dashboard-content.service';
import { RowFilter } from '../interfaces/filter';

export type BigNumberIdentifier = string;

export interface MetadataBigNumber extends BlockMetadata {
  identifier: BigNumberIdentifier;
  parentPath: string;
  parentVersion: number;
  templateType: TemplateType.BigNumber;
}

export enum BigNumberSize {
  Normal = 'normal',
  Large = 'large',
}

export interface StructureBigNumber {
  displayColumn: DisplayColumn;
  size: BigNumberSize;
}

export interface TemplateBigNumber extends BlockTemplate {
  metadata: MetadataBigNumber;
  queryParameters?: UnionQueryParameters;
  structure: StructureBigNumber;
}

export interface ModelBigNumber {
  value: number;
  columnTemplate: TemplateColumn;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class BigNumberService {

  constructor(
    private xyloService: XyloService,
    private dashboardContentService: DashboardContentService,
    private masterTemplateService: MasterTemplateService,
  ) { }

  private static concatFilters(template: TemplateBigNumber, master: EnhancedTemplateMaster): RowFilter[] {
    return (template.structure.displayColumn.parameters.rowFilters || []).concat(master.structure.options.rowFilters || []);
  }

  async instantiate(template: TemplateBigNumber): Promise<ModelBigNumber> {
    const masterTemplate = await this.masterTemplateService.getMasterTemplate(template);
    const embedPath = this.dashboardContentService.getEmbedPathForTemplate(template);
    const templateColumn = masterTemplate.enhancements.templateColumnMap.get(template.structure.displayColumn.identifier);

    const value = await this.xyloService.aggregateColumn({
      dataSetKey: embedPath,
      templateColumn,
      rowFilters: BigNumberService.concatFilters(template, masterTemplate),
    });

    return {
      value: value,
      label: ColumnOps.getDisplayColumnName({ displayColumn: template.structure.displayColumn, templateColumn }),
      columnTemplate: templateColumn,
    };
  }
}
