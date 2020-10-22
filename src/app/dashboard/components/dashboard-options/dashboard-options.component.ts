import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MasterTemplateService } from '../../services/master-template.service';
import { TemplateService } from '../../services/template.service';
import { RowFilterSet, RowFilter, VariableRowFilterWithSelection } from '../../interfaces/filter';
import { RowFilterOps } from '../../workers/util/row-filter';
import { EnhancedTemplateMaster } from '../../interfaces/master';
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'app-dashboard-options',
  templateUrl: './dashboard-options.component.html',
  styleUrls: ['./dashboard-options.component.scss']
})
export class DashboardOptionsComponent implements OnInit {
  @Input() masterTemplate: EnhancedTemplateMaster;
  @Output() optionsChange = new EventEmitter();

  rowFilterSet: RowFilterSet;

  productNameFilter: VariableRowFilterWithSelection;

  constructor(
    private masterTemplateService: MasterTemplateService,
    private templateService: TemplateService,
  ) { }

  async ngOnInit() {
    this.rowFilterSet = this.templateService.getRowFilterSet(this.masterTemplate);
    this.setupProductNameFilter();
  }

  setupProductNameFilter() {
    if (RowFilterOps.shouldShowProductNameFilter(this.rowFilterSet)) {
      const { rowFilter, variableRowFilter } = RowFilterOps.findFilter(this.rowFilterSet, 'row_filter:product_name');
      this.productNameFilter = Object.assign(cloneDeep(variableRowFilter), {
        activeSelection: rowFilter,
      });
    }
  }

  async onRowFilterChange(rowFilter: RowFilter) {
    const masterTemplate = TemplateService.updateRowFilter(this.masterTemplate, rowFilter) as EnhancedTemplateMaster;
    await this.masterTemplateService.updateMasterTemplate(masterTemplate);
  }

}
