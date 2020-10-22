import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeAccountComponent } from './components/node-account/node-account.component';
import { NodeAdgroupComponent } from './components/node-adgroup/node-adgroup.component';
import { NodeCampaignComponent } from './components/node-campaign/node-campaign.component';
import { NodeChannelComponent } from './components/node-channel/node-channel.component';
import { NodeSwitchComponent } from './components/node-switch/node-switch.component';
import { BadgeCategoryCountsComponent } from './components/badge-category-counts/badge-category-counts.component';
import { SharedModule } from '../shared/shared.module';
import { SuiModule } from 'ng2-semantic-ui';
import { NbTooltipModule, NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { NodeTagGroupComponent } from './components/node-tag-group/node-tag-group.component';
import { IomapModule } from '../iomap/iomap.module';
import { NodeEntityLevelComponent } from './components/node-entity-level/node-entity-level.component';
import { IoGridComponent } from './components/io-grid/io-grid.component';

// Vendor
import { AgGridModule } from 'ag-grid-angular';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NodePerformanceGroupComponent } from './components/node-performance-group/node-performance-group.component';

@NgModule({
  entryComponents: [
    NodeSwitchComponent,
  ],
  declarations: [
    NodeAccountComponent,
    NodeAdgroupComponent,
    NodeCampaignComponent,
    NodeChannelComponent,
    NodeTagGroupComponent,
    NodeSwitchComponent,
    BadgeCategoryCountsComponent,
    NodeEntityLevelComponent,
    IoGridComponent,
    NodePerformanceGroupComponent,
  ],
  imports: [
    SuiModule,
    SharedModule,
    IomapModule,
    NbTooltipModule,
    NbSpinnerModule,
    NbButtonModule,
    NgxSmartModalModule,
    CommonModule,
    AgGridModule,
  ],
  exports: [
    NodeAccountComponent,
    NodeAdgroupComponent,
    NodeCampaignComponent,
    NodeChannelComponent,
    NodeTagGroupComponent,
    NodeSwitchComponent,
    IoGridComponent,
  ],
})
export class GridModule { }
