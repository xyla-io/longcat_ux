import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import {
  RowFilter,
  VariableRowFilter,
} from 'src/app/dashboard/interfaces/filter';
import { TemplateType } from 'src/app/dashboard/interfaces/template';
import { RowFilterOps } from 'src/app/dashboard/workers/util/row-filter';

@Component({
  selector: 'app-row-filter',
  templateUrl: './row-filter.component.html',
  styleUrls: ['./row-filter.component.scss']
})
export class RowFilterComponent implements OnInit, OnChanges {

  @Input() variableRowFilter: VariableRowFilter;
  @Input() rowFilter:  RowFilter;
  @Output() rowFilterChange = new EventEmitter<RowFilter>();
  workingRowFilter: RowFilter;

  constructor() {}

  ngOnChanges() {}

  ngOnInit() {
    if (this.rowFilter) {
      this.workingRowFilter = cloneDeep(this.rowFilter);
      return;
    }
    const defaultRowFilter = this.variableRowFilter.default;
    const { identifier } = this.variableRowFilter.metadata;
    this.workingRowFilter = {
      metadata: {
        templateType: TemplateType.RowFilter,
        identifier,
      },
      column: defaultRowFilter ? defaultRowFilter.column : null,
      operator: defaultRowFilter ? defaultRowFilter.operator : null,
      value: defaultRowFilter ? defaultRowFilter.value : null,
    };
  }

  onOperatorChange(event: any) {
    const operator = event.target.value;
    this.workingRowFilter.operator = operator;
    this.emitRowFilterChange();
  }

  onValueChange(event: any) {
    const value = event.target.value;
    if (value === '_null') {
      this.workingRowFilter.column = null;
      this.workingRowFilter.operator = null;
      this.workingRowFilter.value = null;
    } else {
      this.workingRowFilter.value = value;
      RowFilterOps.replaceNullsWithDefault(this.workingRowFilter, this.variableRowFilter);
    }
    this.emitRowFilterChange();
  }

  onColumnChange(event: any) {
    const column = event.target.value;
    if (column === '_null') {
      this.workingRowFilter.column = null;
      this.workingRowFilter.operator = null;
      this.workingRowFilter.value = null;
    } else {
      this.workingRowFilter.column = column;
      RowFilterOps.replaceNullsWithDefault(this.workingRowFilter, this.variableRowFilter);
    }
    this.emitRowFilterChange();
  }

  emitRowFilterChange() {
    this.rowFilterChange.emit(cloneDeep(this.workingRowFilter));
  }

}
