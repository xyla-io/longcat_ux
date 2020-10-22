import { Type, EventEmitter } from '@angular/core';

import {
  EventTemplateEditingValidation,
} from 'src/app/editing/services/editing.service';

import {
  EditBreakdownTableBreakdownsComponent
} from 'src/app/sidebar/components/edit-breakdown-table-breakdowns/edit-breakdown-table-breakdowns.component';
import {
  EditBreakdownTableColumnsComponent
} from 'src/app/sidebar/components/edit-breakdown-table-columns/edit-breakdown-table-columns.component';
import { EnhancedTemplateMaster } from 'src/app/dashboard/interfaces/master';
import { AbstractTemplate } from 'src/app/dashboard/interfaces/template';
import { EditSummaryPanelComponent } from 'src/app/sidebar/components/edit-summary-panel/edit-summary-panel.component';
import { EditDaterangeComponent } from 'src/app/sidebar/components/edit-daterange/edit-daterange.component';
import { EditTagParserComponent } from '../../tags/sidebar/edit-tag-parser/edit-tag-parser.component';

export enum SidebarContentType {
  Hidden = 'hidden',
  EditBreakdownTable = 'edit_breakdown_table',
  EditSummaryPanel = 'edit_summary_panel',
  EditTagParser = 'edit_tag_parser',
}

export interface SidebarPageComponent<Template, Master> {
  inputTemplate: Template;
  masterTemplate: Master;
  templateUpdate: EventEmitter<Template>;
  validationChange: EventEmitter<EventTemplateEditingValidation>;
}

export interface SidebarPage {
  displayName: string;
  heading: string;
  peekText: string;
  component: Type<SidebarPageComponent<AbstractTemplate, EnhancedTemplateMaster>>;
}

export enum SidebarDisplayType {
  Steps = 'steps',
  Tabs = 'tabs',
}

export abstract class SidebarContent {
  displayTitle = 'Configure';
  hideSubtitle = false;
  displayObjective = 'Save';
  displayType: SidebarDisplayType = SidebarDisplayType.Steps;
  pages: SidebarPage[] = null;
}

export class EditBreakdownTableSidebarContent extends SidebarContent {
  displayTitle = 'Configure Table';
  displayObjective = 'Save Table';
  pages = [
    {
      displayName: 'Timeline',
      heading: 'Select Timeline',
      peekText: 'Select Timeline',
      component: EditDaterangeComponent,
    },
    {
      displayName: 'Dimensions',
      heading: 'Select Dimensions (Add up to 3)',
      peekText: 'Select Dimensions',
      component: EditBreakdownTableBreakdownsComponent,
    },
    {
      displayName: 'KPIs',
      heading: 'Select KPIs',
      peekText: 'Select KPIs',
      component: EditBreakdownTableColumnsComponent,
    },
  ];
}

export class EditSummaryPanelSidebarContent extends SidebarContent {
  displayTitle = 'Edit Summary';
  hideSubtitle = true;
  displayObjective = 'Save Summary';
  pages = [
    {
      displayName: 'KPIs',
      heading: 'Select KPIs (up to 4)',
      peekText: 'Select KPIs',
      component: EditSummaryPanelComponent,
    },
  ];
}

export class EditTagParserSidebarContent extends SidebarContent {
  displayTitle = 'Naming Convention';
  hideSubtitle = true;
  displayObjective = 'Update Naming Convention';
  pages = [
    {
      displayName: 'Naming Convention',
      heading: '',
      peekText: 'Naming Convention',
      component: EditTagParserComponent,
    },
  ];
}


export class SidebarContentFactory {

  constructor() { }

  static create(contentType: SidebarContentType): SidebarContent {
    switch (contentType) {
      case SidebarContentType.EditBreakdownTable: return new EditBreakdownTableSidebarContent();
      case SidebarContentType.EditSummaryPanel: return new EditSummaryPanelSidebarContent();
      case SidebarContentType.EditTagParser: return new EditTagParserSidebarContent();
      default: return null;
    }
  }

}
