import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { TemplateColumn, DisplayColumn } from 'src/app/dashboard/interfaces/column';
import {
  RowFilter,
  VariableRowFilter,
} from 'src/app/dashboard/interfaces/filter';
import { RowFilterOps } from 'src/app/dashboard/workers/util/row-filter';
import { ColumnCategory } from 'src/app/dashboard/interfaces/master';
import { ColumnOps } from 'src/app/dashboard/workers/util/column';

@Component({
  selector: 'app-edit-breakdown-table-columns-expanded',
  templateUrl: './edit-breakdown-table-columns-expanded.component.html',
  styleUrls: ['./edit-breakdown-table-columns-expanded.component.scss'],
})
export class EditBreakdownTableColumnsExpandedComponent implements OnInit {

  @Input() readonly displayColumn: DisplayColumn;
  @Input() readonly templateColumnMap: Map<string, TemplateColumn>;
  @Input() readonly columnCategory: ColumnCategory;

  @Output() displayColumnChange = new EventEmitter<DisplayColumn>();

  workingDisplayColumn: DisplayColumn;
  variableRowFilters: VariableRowFilter[] = [];
  rowFilterMap = new Map<string, RowFilter>();

  constructor(
  ) { }

  ngOnInit() {
    this.workingDisplayColumn = cloneDeep(this.displayColumn);
    this.updateRowFilters();
  }

  onColumnRadioChange(event: any) {
    this.workingDisplayColumn.identifier = event.target.value;
    this.workingDisplayColumn.parameters = {};
    this.updateRowFilters();
    this.emitDisplayColumnChange();
  }

  emitDisplayColumnChange() {
    this.displayColumnChange.emit(cloneDeep(this.workingDisplayColumn));
  }

  updateRowFilters() {
    this.variableRowFilters = this.templateColumnMap.get(this.workingDisplayColumn.identifier).options.variableRowFilters || [];
    const rowFilters = this.workingDisplayColumn.parameters.rowFilters || [];
    this.rowFilterMap = new Map();
    rowFilters.forEach(rowFilter => this.rowFilterMap.set(rowFilter.metadata.identifier, rowFilter));
  }

  onRowFilterChange(rowFilter: RowFilter) {
    let isNewRowFilter = true;
    this.workingDisplayColumn.parameters.rowFilters = (this.workingDisplayColumn.parameters.rowFilters || []).map(rf => {
      if (rf.metadata.identifier === rowFilter.metadata.identifier) {
        isNewRowFilter = false;
        return rowFilter;
      }
      if (!rf.column) { return null; }
      return cloneDeep(rf);
    }).filter(_ => _);
    if (isNewRowFilter) {
      this.workingDisplayColumn.parameters.rowFilters.push(rowFilter);
    }
    this.updateRowFilters();
    const templateColumn = this.templateColumnMap.get(this.workingDisplayColumn.identifier);
    this.workingDisplayColumn.parameters.inscriptionDisplayName = ColumnOps.getDisplayColumnName({
      displayColumn: this.workingDisplayColumn,
      templateColumn,
    });

    this.emitDisplayColumnChange();
  }
}

