import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { NbMenuService, NbMenuItem } from '@nebular/theme';
import { NbMenuHelper, MenuClickHandler } from 'src/app/util/nb-menu-helper';
import { TemplateBreakdownTable, BreakdownTableService, ModelBreakdownTable } from 'src/app/dashboard/services/breakdown-table.service';
import { SidebarService } from 'src/app/sidebar/services/sidebar.service';
import { SidebarContentType } from 'src/app/sidebar/factories/sidebar-content.factory';
import { EventTemplateUpdate } from 'src/app/editing/services/editing.service';
import { Daterange } from 'src/app/dashboard/interfaces/query';
import { DashboardAlertService } from 'src/app/services/alerts/dashboard-alert.service';
import { EnhancedTemplateMaster } from 'src/app/dashboard/interfaces/master';
import { Block } from 'src/app/dashboard/interfaces/block';
import { MasterTemplateService } from 'src/app/dashboard/services/master-template.service';

@Component({
  selector: 'app-block-breakdown-table',
  templateUrl: './block-breakdown-table.component.html',
  styleUrls: ['./block-breakdown-table.component.scss'],
})
export class BlockBreakdownTableComponent
implements OnInit, OnChanges, OnDestroy, MenuClickHandler, Block<TemplateBreakdownTable> {

  @Input() template: TemplateBreakdownTable;
  @Input() dataRefreshing = true;
  @Output() templateUpdate = new EventEmitter<EventTemplateUpdate<TemplateBreakdownTable>>();

  master: EnhancedTemplateMaster;
  viewModel: ModelBreakdownTable;
  error = '';

  menuHelper: NbMenuHelper;

  constructor(
    private breakdownTableService: BreakdownTableService,
    private dashboardAlertService: DashboardAlertService,
    private sidebarService: SidebarService,
    private masterTemplateService: MasterTemplateService,
    public nbMenuService: NbMenuService,
  ) { }

  async ngOnInit() {
    this.menuHelper = new NbMenuHelper(
      this,
      [
        {
          identifier: 'edit_table',
          nbMenuItem: { title: 'Edit Table' },
        }
      ]
    );
    this.master = await this.masterTemplateService.getMasterTemplate(this.template);
  }

  async ngOnChanges() {
    if (this.dataRefreshing) { return; }
    this.refreshData();
  }

  async refreshData() {
    try {
      this.viewModel = await this.breakdownTableService.instantiate(this.template);
    } catch (e) {
      console.error(e);
      this.dashboardAlertService.postDataRetrievalError();
      this.error = 'Problem loading data for this table';
    }
  }

  ngOnDestroy() {
    this.menuHelper.unsubscribe();
  }

  menuItemClicked(identifier: string, nbMenuItem: NbMenuItem) {
    (
      {
        edit_table: () => this.sidebarService.requestSidebar({
          contentType: SidebarContentType.EditBreakdownTable,
          inputTemplate: this.template,
        }),
      }
    )[identifier]();
  }

  onDaterangeChange(daterange: Daterange) {
    const outputTemplate = cloneDeep(this.template);
    outputTemplate.queryParameters = outputTemplate.queryParameters || {};
    outputTemplate.queryParameters.interval = daterange;
    setTimeout(() => {
      this.templateUpdate.emit({ inputTemplate: this.template, outputTemplate });
    });
  }

}
