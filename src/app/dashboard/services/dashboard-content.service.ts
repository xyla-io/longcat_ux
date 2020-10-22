import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';

import { TemplateBigNumber } from './big-number.service';
import { TemplateBreakdownTable } from './breakdown-table.service';
import {
  TemplateType,
  AbstractTemplate,
  TemplateGroup,
  TemplateDeck,
  BlockTemplate,
  TemplateCollection,
  isTemplateCollection,
  isTemplateGroup,
  isTemplateDeck,
} from 'src/app/dashboard/interfaces/template';
import { XylaEmbed, EmbedsService } from 'src/app/services/api/embeds.service';
import { ReportElementType } from 'src/app/services/api/report-element.service';
import { MasterTemplateService } from './master-template.service';
import { TemplateService } from 'src/app/dashboard/services/template.service';
import { XyloService } from 'src/app/dashboard/services/xylo.service';
import { EventTemplateUpdate } from 'src/app/editing/services/editing.service';
import { EnhancedTemplateMaster } from 'src/app/dashboard/interfaces/master';
import { CompanyReport } from 'src/app/services/api/company-reports.service';

export type DashboardContentIdentifer = string;

export interface MetadataDashboardContent {
  identifier: DashboardContentIdentifer;
  templateType: TemplateType.DashboardContent;
}

export interface DashboardContext {
  embeds: Record<string, XylaEmbed>;
}

export interface DashboardContent extends AbstractTemplate {
  type: ReportElementType.XylaContent;
  context: DashboardContext;
  metadata: MetadataDashboardContent;
  structure: {
    decks: {
      breakdownTable?: TemplateDeck<TemplateBreakdownTable>;
      bigNumber?: TemplateDeck<TemplateBigNumber>;
    };
    groups: {
      summaryPanel: TemplateGroup<TemplateBigNumber>;
      [x: string]: TemplateGroup<AbstractTemplate>;
    };
  };
}


export function isDashboardContent(obj: any): obj is DashboardContent {
  return obj && obj.metadata && obj.metadata.templateType === 'dashboard_content';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardContentService {

  private currentReportPath: string;
  private dashboardContentMap = new Map<string, DashboardContent>();
  private cachedEmbeds = new Map<string, XylaEmbed>();
  private embedPathForTemplatePath = new Map<string, string>();
  private groupPathForTemplatePath = new Map<string, string>();
  private _primaryMasterTemplate$ = new BehaviorSubject<EnhancedTemplateMaster>(null);
  get primaryMasterTemplate$(): Observable<EnhancedTemplateMaster> {
    return this._primaryMasterTemplate$.asObservable();
  }

  private static getAllTemplateCollections(dashboardContent: DashboardContent): BlockTemplate[] {
    const { groups, decks } = dashboardContent.structure;
    const topLevelTemplates: BlockTemplate[] = [].concat(
      ...Object.values(groups),
      ...Object.values(decks),
    );
    return topLevelTemplates;
  }

  constructor(
    private embedsService: EmbedsService,
    private templateService: TemplateService,
    private masterTemplateService: MasterTemplateService,
    private xyloService: XyloService,
  ) {
    this.masterTemplateService.masterTemplateUpdate$.subscribe(masterTemplate => {
      // Since we still have one master template per dashboard for the
      // foreseeable future, set any master template that has been updated as the primary
      // template for the current dashboard
      this._primaryMasterTemplate$.next(masterTemplate);
    });
  }

  getEmbedPathForTemplate(template: BlockTemplate): string {
    const groupOrTemplatePath = this.getGroupPathForTemplate(template);
    return this.embedPathForTemplatePath.get(groupOrTemplatePath);
  }

  async postTemplateUpdate(reportPath: string, eventTemplateUpdate: EventTemplateUpdate<BlockTemplate>) {

    const templateUpdates = TemplateService.buildTemplateUpdates(eventTemplateUpdate);
    await this.templateService.updateTemplates(templateUpdates);

    const { outputTemplate } = eventTemplateUpdate;
    if (isTemplateGroup(outputTemplate)) {
      this.storeGroupPathForEachTemplate(outputTemplate);
    }
    await this.registerNewEmbed(reportPath, outputTemplate);
  }

  async initDashboardContent(
    reportPath: string,
    dashboardContent: DashboardContent
  ): Promise<DashboardContent> {
    if (!dashboardContent) { return Promise.resolve(null); }

    const populatedDashboardContent = await this.populateDashboardContent(dashboardContent);
    this.currentReportPath = reportPath;
    this.dashboardContentMap.set(reportPath, populatedDashboardContent);

    const templateCollections = DashboardContentService.getAllTemplateCollections(populatedDashboardContent);

    const embedTargets = templateCollections.reduce((targets, templateCollection) => {
      if (isTemplateGroup(templateCollection)) {
        this.storeGroupPathForEachTemplate(templateCollection);
        targets.push({ path: reportPath, template: templateCollection });
      } else if (isTemplateDeck(templateCollection)) {
        templateCollection.structure.templates.forEach(async blockTemplate => {
          targets.push({ path: reportPath, template: blockTemplate });
        });
      }
      return targets;
    }, []);
    for (const { path, template } of embedTargets) {
      await this.registerNewEmbed(path, template);
    }
    return this.dashboardContentMap.get(reportPath);
  }

  private getGroupPathForTemplate(template: BlockTemplate): string {
    let tryPath = template.path;
    let groupPath;
    do {
      groupPath = tryPath;
      tryPath = this.groupPathForTemplatePath.get(tryPath);
    } while (tryPath) ;
    return groupPath;
  }

  private storeGroupPathForEachTemplate(group: TemplateGroup<BlockTemplate>) {
    group.structure.templates.forEach(subTemplate => {
      this.groupPathForTemplatePath.set(subTemplate.path, group.path);
      if (isTemplateGroup(subTemplate)) {
        this.storeGroupPathForEachTemplate(subTemplate);
      }
    });
  }

  private async registerNewEmbed(reportPath: string, template: BlockTemplate) {
    const { parentPath } = template.metadata;
    const master = await this.masterTemplateService.getMasterTemplate(template);
    const embed = this.embedsService.makeHashedXylaEmbed(
      reportPath,
      master.metadata.parentPath,
      template.queryParameters
    );
    const cachedEmbed = this.cachedEmbeds.get(embed.path);
    if (cachedEmbed) {
      this.embedPathForTemplatePath.set(template.path, cachedEmbed.path);
      return;
    }
    const signedEmbed = await this.embedsService.signEmbed(embed);
    await this.xyloService.fetchData(signedEmbed);
    const updatedMasterTemplate = await this.masterTemplateService.updateDynamicMasterExtensions(
      embed.path,
      master
    );
    this.embedPathForTemplatePath.set(template.path, embed.path);
    this.cachedEmbeds.set(embed.path, embed);
  }

  async populateDashboardContent(dashboardContent: DashboardContent): Promise<DashboardContent> {
    const collections = DashboardContentService.getAllTemplateCollections(dashboardContent);
    const populatedTemplates = await this.populateAllReferenceTemplates(collections);
    return populatedTemplates.reduce((populatedDashboardContent, template) => {
      const collectionKeys = ['groups', 'decks'];
      if (isTemplateCollection(template)) {
        collectionKeys.forEach(collectionKey => {
          for (const [entryKey, collection] of Object.entries(populatedDashboardContent.structure[collectionKey])) {
            if ((collection as any).reference !== template.path) { continue; }
            populatedDashboardContent.structure[collectionKey][entryKey] = template;
            break;
          }
        });
      }
      return populatedDashboardContent;
    }, cloneDeep(dashboardContent));
  }

  private async populateAllReferenceTemplates(templates: BlockTemplate[]): Promise<BlockTemplate[]> {
    const references = templates.reduce((allReferences, template) => {
      if (template.reference) { allReferences.push(template.reference); }
      return allReferences;
    }, []);
    if (references.length) {
      const populatedTemplates = await this.templateService.populateTemplateReferences(references);
      return templates.map(template => {
        if (template.reference) { return populatedTemplates[template.reference]; }
        return template;
      });
    }
    return [];
  }

}
