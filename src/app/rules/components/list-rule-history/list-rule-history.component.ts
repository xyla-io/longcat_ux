import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { Rule } from '../../models/rule';
import { RuleHistoryService } from '../../services/rule-history.service';
import { RuleHistory, RuleHistoryType } from '../../models/rule-history';
import { DateUtil } from 'src/app/util/date.util';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';

@Component({
  selector: 'app-list-rule-history',
  templateUrl: './list-rule-history.component.html',
  styleUrls: ['./list-rule-history.component.scss']
})
export class ListRuleHistoryComponent implements OnInit, OnChanges {
  @Input() rule: Rule;

  ruleHistory: RuleHistory[];

  gridOptions = {
    loadingOverlayComponent: 'loaderComponent',
    loadingOverlayComponentParams: { size: 34 },
    // suppressContextMenu: true,
    defaultColDef: {
      autoHeight: true,
      resizable: true,
      filter: true,
      sortable: true,
      editable: false,
    },
    frameworkComponents: {
      loaderComponent: LoaderComponent,
    },
  }

  columnDefs = [
    {
      headerName: 'Event At',
      field: 'historyCreationDate',
      cellRenderer: ({value}) => `<div>${DateUtil.formatDateAndTime(value).split(' at ').join('<br>')}</div>`,
      cellClass: 'multiline date',
      width: 90,
    },
    {
      headerName: 'Event Description',
      field: 'actionDescription',
      cellRenderer: ({value}) => `<div>${value}<div>`,
      flex: 1,
      cellClass: 'condensed',
    },
    {
      headerName: 'Data From',
      field: 'lastDataCheckedDate',
      valueFormatter: ({value}) => DateUtil.formatDateAndTime(value, { hideTime: true }),
      width: 100,
      cellClass: 'multiline date',
    },
  ]

  constructor(
    private ruleHistoryService: RuleHistoryService,
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.rule) {
      const invalidateCache = changes.rule.previousValue 
        && changes.rule.currentValue
        && changes.rule.previousValue.modified !== changes.rule.currentValue.modified;
      this.ruleHistory = (await this.ruleHistoryService.getHistory(this.rule._id, { invalidateCache }))
        .filter(history => history.historyType !== RuleHistoryType.Execute)
    }
  }

}
