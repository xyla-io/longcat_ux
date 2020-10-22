import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarContentComponent } from './components/sidebar-content/sidebar-content.component';
import { SidebarContentDirective } from './directives/sidebar-content.directive';

import { EditBreakdownTableColumnsComponent } from './components/edit-breakdown-table-columns/edit-breakdown-table-columns.component';
import {
  EditBreakdownTableBreakdownsComponent
} from './components/edit-breakdown-table-breakdowns/edit-breakdown-table-breakdowns.component';

import {
  NbIconModule,
  NbStepperModule,
  NbButtonModule,
  NbSpinnerModule,
  NbAccordionModule,
  NbCheckboxModule,
  NbRadioModule,
  NbTooltipModule,
  NbPopoverModule,
  NbCalendarRangeModule,
  NbSelectModule,
} from '@nebular/theme';

import { SharedModule } from 'src/app/shared/shared.module';
import { EditingModule } from 'src/app/editing/editing.module';
import {
  EditBreakdownTableColumnsExpandedComponent
} from './components/edit-breakdown-table-columns-expanded/edit-breakdown-table-columns-expanded.component';
import { EditSummaryPanelComponent } from './components/edit-summary-panel/edit-summary-panel.component';
import { EditColumnsComponent } from './components/edit-columns/edit-columns.component';
import { EditDaterangeComponent } from './components/edit-daterange/edit-daterange.component';

@NgModule({
  // For the Sidebar module, entryComponents are SidebarPageComponent-based
  // classes These are the same components that can be included in the
  // 'pages' property of SidebarContent-based classes.
  entryComponents: [
    EditBreakdownTableBreakdownsComponent,
    EditBreakdownTableColumnsComponent,
    EditDaterangeComponent,
    EditSummaryPanelComponent,
  ],
  declarations: [
    SidebarContentComponent,
    SidebarContentDirective,
    EditBreakdownTableColumnsComponent,
    EditBreakdownTableBreakdownsComponent,
    EditBreakdownTableColumnsExpandedComponent,
    EditSummaryPanelComponent,
    EditColumnsComponent,
    EditDaterangeComponent,
  ],
  imports: [
    CommonModule,
    NbIconModule,
    NbStepperModule,
    NbButtonModule,
    NbSpinnerModule,
    NbAccordionModule,
    NbCheckboxModule,
    NbRadioModule,
    NbTooltipModule,
    NbPopoverModule,
    NbCalendarRangeModule,
    NbSelectModule,
    SharedModule,
    EditingModule,
  ],
  exports: [
    SidebarContentComponent,
  ],
})
export class SidebarModule { }
