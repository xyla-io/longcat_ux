import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewChecked,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { APIQueryResult } from 'src/app/services/api/api.service';
import { FilterDataProvider, PresetFilter } from 'src/app/interfaces/filter-data-provider.interface';
import { FileInputEvent } from 'src/app/shared/components/file-upload/file-upload.component';
import {
  ColumnTemplate,
  TableRow,
  TableCell,
  SelectionState,
  RowProvider,
} from 'src/app/interfaces/table.interface';
import { TaggingService } from 'src/app/services/api/tagging.service';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';
import { URLProvider } from 'src/app/interfaces/url-provider.interface';

@Component({
  selector: 'app-selectable-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './selectable-table.component.html',
  styleUrls: ['./selectable-table.component.scss']
})
export class SelectableTableComponent implements OnInit, AfterViewChecked, RowProvider, URLProvider {
  SelectionState = SelectionState;
  private _queryResult: APIQueryResult;

  isRefreshing = true;

  @Output() addTag = new EventEmitter();
  @Output() addSubtag = new EventEmitter();
  @Output() removeTag = new EventEmitter();

  @Input() isLoadingEntities = true;
  @Input() entityName: string;
  @Input('queryResult')
  set queryResult(queryResult: APIQueryResult) {
    this._queryResult = queryResult;
    if (!this.queryResult) { return; }
    this.isRefreshing = false;
    this.resetState();
  }
  get queryResult(): APIQueryResult {
    return this._queryResult;
  }

  @Input() columnTemplates: ColumnTemplate[];
  @Input() filterDataProvider: FilterDataProvider;
  @Input() changeFilterEventEmitter: EventEmitter<string>;

  @ViewChild('headerRow', {static: false}) headerRow: ElementRef;
  @ViewChild('footerRow', {static: false}) footerRow: ElementRef;
  @ViewChild('tableBody', {static: false}) tableBody: ElementRef;
  @ViewChild('tableContainer', {static: false}) tableContainer: ElementRef;
  @ViewChild('paddingCell', {static: false}) paddingCell: ElementRef;
  @ViewChild('fixedHeightContainer', {static: false}) fixedHeightContainer: ElementRef;

  allRows: any[];       // all the rows
  availableRows: any[]; // all the rows available for display under the current level 1 filter set
  visibleRows: any[];   // all the rows actually visible to the user under the current level 2 filter set
  sortedColumnIndex = -1;
  sortReverse = false;
  selectionState: SelectionState = SelectionState.NONE;
  rowSelectionCount = 0;
  allSubtags: string[];
  allTags: string[];
  filteredTags: string[];
  filteredSubtags: string[];
  isFilteredBySelection = false;
  tagInputValue = '';
  subtagInputValue = '';
  applyFilterEventEmitter = new EventEmitter();
  bulkTaggingType = 'Campaign';
  actionStates = {
    tag: {
      isApplyingChanges: false,
      didApplyChanges: false,
      isOpen: false,
    },
    subtag: {
      isApplyingChanges: false,
      didApplyChanges: false,
      isOpen: false,
    },
    untag: {
      isApplyingChanges: false,
      didApplyChanges: false,
      isOpen: false,
    },
    fileTransfer: {
      isUploading: false,
      isDownloading: false,
      isOpen: false,
    },
  };

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateTableDimensions();
  }

  constructor(
    private taggingService: TaggingService,
    private userAlertService: UserAlertService,
  ) { }

  ngAfterViewChecked() {
    this.updateTableDimensions();
  }

  resetState() {
    this.allRows = this.prepareRows(this.queryResult);
    this.availableRows = [];
    this.applyFilterEventEmitter.emit(true);
    this.sortedColumnIndex = -1;
    this.sortReverse = false;
    this.selectionState = SelectionState.NONE;
    this.rowSelectionCount = 0;
    this.fulfillActionStates();
    this.allTags = Array.from(new Set(this.allRows.map(row => row.values.campaign_tag))).filter(tag => tag);
    this.allSubtags = Array.from(new Set(this.allRows.map(row => row.values.campaign_subtag))).filter(subtag => subtag);
    this.filteredTags = this.allTags;
    this.filteredSubtags = this.allSubtags;
    if (this.isFilteredBySelection) {
      this.toggleFilterSelected();
    }
  }

  fulfillActionStates() {
    Object.keys(this.actionStates).forEach(key => {
      if (this.actionStates[key].isApplyingChanges) {
        this.actionStates[key].didApplyChanges = true;
        setTimeout(() => {
          this.actionStates[key].isOpen = false;
          setTimeout(() => {
            this.actionStates[key].didApplyChanges = false;
          }, 500);
        }, 1000);
        this.actionStates[key].isApplyingChanges = false;
      }
    });
  }

  updateTableDimensions() {
    const targetTableHeight = this.fixedHeightContainer.nativeElement.offsetHeight;
    this.paddingCell.nativeElement.height = 0;
    const realTableHeight =
      this.headerRow.nativeElement.offsetHeight +
      this.tableBody.nativeElement.offsetHeight;
    if (realTableHeight < targetTableHeight) {
      this.paddingCell.nativeElement.height = targetTableHeight - realTableHeight;
    }
  }

  ngOnInit() {
  }

  prepareRows(queryResult: APIQueryResult): TableRow[] {
    const columnMap = {};
    queryResult.column_names.forEach((name, i) => {
      columnMap[name] = i;
    });
    return queryResult.rows.map((row, i) => {
      const values = {};
      this.columnTemplates.map(template => {
        template.data_columns.forEach(col => {
          values[col] = row[columnMap[col]];
        });
        return { values: values };
      });
      return {
        index: i,
        isSelected: false,
        values: values,
      };
    });
  }

  sortRows(rows: TableRow[], columnIndex: number): TableRow[] {
    const sortColumnName = this.columnTemplates[columnIndex].sort_column;
    const sortDirection = this.sortReverse ? -1 : 1;
    const sortedRows = rows.sort((r1, r2) => {
      const a = r1.values[sortColumnName] || '';
      const b = r2.values[sortColumnName] || '';
      if (a < b) { return -1 * sortDirection; }
      if (a > b) { return 1 * sortDirection; }
      return 0;
    });
    return rows;
  }

  filterRowsEventHandler(event: any) {
    if (!this.allRows) { return; }
    if (event.filterKey !== 'custom') {
      this.availableRows = event.rows;
    } else {
      this.availableRows = this.allRows;
    }
    if (this.isFilteredBySelection) {
      this.setVisibleRowsFilteredBySelection();
    } else {
      this.setVisibleRows(event.rows);
    }
  }

  setVisibleRows(rows: TableRow[]) {
    if (this.sortedColumnIndex > -1) {
      this.visibleRows = this.sortRows(rows, this.sortedColumnIndex);
    } else {
      this.visibleRows = rows;
    }
    this.updateSelectionState();
  }

  toggleRowSelection(rowIndex: number) {
    const rowWasSelected = this.visibleRows[rowIndex].isSelected;
    this.visibleRows[rowIndex].isSelected = !rowWasSelected;
    if (rowWasSelected) {
      this.rowSelectionCount -= 1;
    } else {
      this.rowSelectionCount += 1;
    }
    this.updateSelectionState();
  }

  updateSelectionState() {
    let allSelected = true;
    let someSelected = false;

    this.visibleRows.forEach(row => {
      if (row.isSelected) {
        someSelected = true;
      } else {
        allSelected = false;
      }
    });

    if (someSelected && allSelected) {
      this.selectionState = SelectionState.ALL;
    } else if (someSelected) {
      this.selectionState = SelectionState.SOME;
    } else {
      this.selectionState = SelectionState.NONE;
    }
  }

  updateSortedColumnIndex(columnIndex: number) {
    this.sortReverse = this.sortedColumnIndex === columnIndex ? !this.sortReverse : false;
    this.sortedColumnIndex = columnIndex;
    this.setVisibleRows(this.visibleRows);
  }

  clickHeaderCell(columnIndex) {
    this.updateSortedColumnIndex(columnIndex);
  }

  clickTableRow(rowIndex: number) {
    this.toggleRowSelection(rowIndex);
    if (this.isFilteredBySelection) {
      this.setVisibleRowsFilteredBySelection();
    }
  }

  clickMasterSelect() {
    switch (this.selectionState) {
      case SelectionState.NONE:
        this.visibleRows.forEach(row => {
          if (!row.isSelected) {
            this.rowSelectionCount += 1;
            row.isSelected = true;
          }
        });
        break;
      case SelectionState.SOME:
      case SelectionState.ALL:
        this.visibleRows.forEach(row => {
          if (row.isSelected) {
            this.rowSelectionCount -= 1;
            row.isSelected = false;
          }
        });
        break;
    }
    this.updateSelectionState();
    if (this.isFilteredBySelection) {
      this.setVisibleRowsFilteredBySelection();
    }
  }

  clickApplyTag(event) {
    const selectedRows = this.allRows.filter(row => row.isSelected);
    if (!selectedRows.length) { return; }

    this.actionStates.tag.isApplyingChanges = true;
    this.addTag.emit({
      tag: this.tagInputValue,
      rowIndices: selectedRows.map(row => row.index),
    });

    this.tagInputValue = '';
  }

  clickApplySubtag(event) {
    const selectedRows = this.allRows.filter(row => row.isSelected);
    if (!selectedRows.length) { return; }
    this.actionStates.subtag.isApplyingChanges = true;
    this.addSubtag.emit({
      subtag: this.subtagInputValue,
      rowIndices: selectedRows.map(row => row.index),
    });

    this.subtagInputValue = '';
  }

  clickUntag(event) {
    const selectedRows = this.allRows.filter(row => row.isSelected);
    if (!selectedRows.length) { return; }
    this.actionStates.untag.isApplyingChanges = true;
    this.removeTag.emit({
      rowIndices: selectedRows.map(row => row.index),
    });
  }

  selectPreviousTag(tag: string) {
    this.tagInputValue = tag;
  }

  selectPreviousSubtag(subtag: string) {
    this.subtagInputValue = subtag;
  }

  inputTagTextChanged(event) {
    this.tagInputValue = event.target.value;
    this.filteredTags = this.filterItemsByText(this.allTags, event.target.value);
  }

  inputSubtagTextChanged(event) {
    this.subtagInputValue = event.target.value;
    this.filteredSubtags = this.filterItemsByText(this.allSubtags, event.target.value);
  }

  filterItemsByText(items: string[], text: string): string[] {
    const loweredText = text.trim().toLowerCase();
    return items.filter(item => {
      return item.toLowerCase().includes(loweredText);
    }).sort((a, b) => {
      if (a.toLowerCase().startsWith(loweredText)) {
        return -1;
      } else if (b.toLowerCase().startsWith(loweredText)) {
        return 1;
      }
      return 0;
    });
  }

  clickFilterSelected() {
    this.toggleFilterSelected();
  }

  toggleFilterSelected() {
    this.isFilteredBySelection = !this.isFilteredBySelection;
    if (this.isFilteredBySelection) {
      this.setVisibleRowsFilteredBySelection();
    } else {
      this.setVisibleRows(this.availableRows);
    }
  }

  setVisibleRowsFilteredBySelection() {
    this.setVisibleRows(this.availableRows.filter(row => row.isSelected));
  }

  tagDropdownOpenChange(isOpen: boolean) {
    this.actionStates.tag.isOpen = isOpen;
  }

  subtagDropdownOpenChange(isOpen: boolean) {
    this.actionStates.subtag.isOpen = isOpen;
  }

  untagDropdownOpenChange(isOpen: boolean) {
    this.actionStates.untag.isOpen = isOpen;
  }

  fileTransferDropdownOpenChange(isOpen: boolean) {
    this.actionStates.fileTransfer.isOpen = isOpen;
  }

  selectedBulkTaggingEntity(): string {
    return this.bulkTaggingType.split(' ').join('').toLowerCase();
  }

  async handleFileInputEvent(fileInputEvent: FileInputEvent) {
    if (this.actionStates.fileTransfer.isUploading || this.actionStates.fileTransfer.isDownloading) {
      return;
    }
    this.actionStates.fileTransfer.isUploading = true;
    this.actionStates.fileTransfer.isOpen = false;

    const entity = this.selectedBulkTaggingEntity();

    try {
      await this.taggingService.mergeCSVTags(entity, fileInputEvent.data);
      this.userAlertService.postAlert({
        alertType: UserAlertType.success,
        header: 'Upload Complete',
        body: 'Tags have been updated from the CSV file',
      });
      if (entity === 'campaign') {
        this.isRefreshing = true;
        this.taggingService.refreshEntities(entity);
      }
    } catch (error) {
      console.error(error);
      this.userAlertService.postAlert({
        alertType: UserAlertType.error,
        header: 'There was a problem uploading the CSV file',
        body: 'Please check the file format and try again. When exporting the CSV from a Spreadsheet program, be sure to select \'UTF-8\' as the encoding.',
        replacementKey: 'csv_upload_error',
        autoCloseSeconds: 60,
      });
    }
    this.actionStates.fileTransfer.isUploading = false;
  }

  onCSVDownloadLoadingChange(isLoading: boolean) {
    this.actionStates.fileTransfer.isDownloading = isLoading;
  }

  // Interface: RowProvider
  getAllRows(): TableRow[] {
    return this.allRows;
  }

  // Interface: RowProvider
  getAvailableRows(): TableRow[] {
    return this.availableRows;
  }

  // Interface: URLProvider
  async getURL(key: string): Promise<string|null> {
    return this.taggingService.getCSVTags(this.selectedBulkTaggingEntity())
    .then(response => response.signedURL);
  }

  // Interface: URLProvider
  getResourceName(key: string): string {
    return `${key}_tags`;
  }

  // Interface: URLProvider
  getDisplayName(key: string): string {
    return `${this.bulkTaggingType} Tags`;
  }
}
