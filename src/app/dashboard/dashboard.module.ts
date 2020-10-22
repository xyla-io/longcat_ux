import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Vendor
import {
  NbCardModule,
  NbSpinnerModule,
  NbTreeGridModule,
  NbSidebarModule,
  NbButtonModule,
  NbContextMenuModule,
  NbIconModule,
  NbTooltipModule,
  NbPopoverModule,
} from '@nebular/theme';

// Modules
import { SharedModule } from 'src/app/shared/shared.module';
import { SidebarModule } from 'src/app/sidebar/sidebar.module';
import { EditingModule } from 'src/app/editing/editing.module';

// Components
// ----------

// Big Number
import { BlockBigNumberComponent } from './components/block-big-number/block-big-number.component';

// Breakdown Table
import { BlockBreakdownTableComponent } from './components/block-breakdown-table/block-breakdown-table.component';
import {
  BlockBreakdownTableBodyComponent
} from './components/block-breakdown-table/block-breakdown-table-body/block-breakdown-table-body.component';
import {
  BlockBreakdownTableHeadingComponent
} from './components/block-breakdown-table/block-breakdown-table-heading/block-breakdown-table-heading.component';

// Groups
import { GroupSummaryPanelComponent } from './components/group-summary-panel/group-summary-panel.component';

// Display
import { DisplayFormatComponent } from './components/display-format/display-format.component';
import { DisplayColumnNameComponent } from './components/display-column-name/display-column-name.component';
import { DashboardOptionsComponent } from './components/dashboard-options/dashboard-options.component';


@NgModule({
  declarations: [
    BlockBigNumberComponent,
    BlockBreakdownTableComponent,
    DisplayFormatComponent,
    GroupSummaryPanelComponent,
    DisplayColumnNameComponent,
    BlockBreakdownTableBodyComponent,
    BlockBreakdownTableHeadingComponent,
    DashboardOptionsComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    SidebarModule,
    EditingModule,
    NbCardModule,
    NbSpinnerModule,
    NbTreeGridModule,
    NbSidebarModule,
    NbButtonModule,
    NbContextMenuModule,
    NbIconModule,
    NbTooltipModule,
    NbPopoverModule,
  ],
  exports: [
    GroupSummaryPanelComponent,
    BlockBreakdownTableComponent,
    DashboardOptionsComponent,
  ],
})
export class DashboardModule { }
