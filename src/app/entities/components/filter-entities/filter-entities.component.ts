import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { FilterDataProvider, PresetFilter } from 'src/app/interfaces/filter-data-provider.interface';
import { RowProvider, TableRow } from 'src/app/interfaces/table.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-filter-entities',
  templateUrl: './filter-entities.component.html',
  styleUrls: ['./filter-entities.component.css']
})
export class FilterEntitiesComponent implements OnInit, OnDestroy {
  _showFilterInput = false;
  @Input() provider: FilterDataProvider;
  @Input() rowProvider: RowProvider;
  @Input() applyActiveFilterEvent: EventEmitter<boolean>;
  @Input() changeActiveFilterEvent: EventEmitter<string>;
  @Input() showLoading: boolean;
  @Input('showFilterInput')
  set showFilterInput(show: boolean) {
    this._showFilterInput = show;
    this.emitActiveFilterRows();
  }
  @Output() filterRowsEvent = new EventEmitter();

  applyFilterEventSubscription: Subscription;
  changeFilterEventSubscription: Subscription;
  filters: PresetFilter[];
  activePresetKey: string;
  filterInputText = '';
  customFilterActive = false;
  filterDebounceTimeout: any;

  constructor() { }

  ngOnInit() {
    this.filters = this.provider.orderedFilterKeys.map(key => {
      return this.provider.presetFilterMap[key];
    });
    this.activePresetKey = this.provider.defaultFilterKey;
    this.applyFilterEventSubscription = this.applyActiveFilterEvent.subscribe(shouldApply => {
      if (shouldApply) {
        this.emitActiveFilterRows();
      }
    });

    this.changeFilterEventSubscription = this.changeActiveFilterEvent.subscribe(filterKey => {
      if (filterKey) {
        this.setActivePreset(filterKey);
      }
    });
  }

  ngOnDestroy() {
    if (this.applyFilterEventSubscription) {
      this.applyFilterEventSubscription.unsubscribe();
    }
    if (this.changeFilterEventSubscription) {
      this.changeFilterEventSubscription.unsubscribe();
    }
  }

  setActivePreset(key: string) {
    this.activePresetKey = key;
    this.emitActiveFilterRows();
  }

  onPresetClicked(filter: PresetFilter) {
    this.setActivePreset(filter.key);
  }

  getPresetRowCount(key: string): number {
    const rows = this.rowProvider.getAllRows();
    if (!rows || !rows.length) { return 0; }
    return this.provider.presetFilterMap[key].apply(rows).length;
  }

  applyPresetFilter(key: string) {
    const rows = this.rowProvider.getAllRows();
    if (!rows || !rows.length) { return []; }
    return this.provider.presetFilterMap[key].apply(rows);
  }

  emitActiveFilterRows() {
    let rows = this.applyPresetFilter(this.activePresetKey);
    rows = this.applyCustomFilter(this.filterInputText, rows);
    this.filterRowsEvent.emit({
      filterKey: this.customFilterActive ? 'custom' : this.activePresetKey,
      rows: rows,
    });
  }

  applyCustomFilter(text: string, rows: TableRow[]): TableRow[] {
    this.filterInputText = text;
    if (!rows || !rows.length) { return []; }
    if (!this.filterInputText || this.filterInputText.trim() === '') {
      this.customFilterActive = false;
      return rows;
    }
    this.customFilterActive = true;
    const filteredRows = rows.filter(row => {
      return Object.keys(row.values).some(colKey => {
        if (row.values[colKey] === undefined || row.values[colKey] === null) { return false; }
        return row.values[colKey].toLowerCase().includes(this.filterInputText.toLowerCase());
      });
    });
    return filteredRows;
  }

  customFilterTextChanged(event) {
    this.filterInputText = event.target.value;
    setTimeout(() => {
      if (this.filterDebounceTimeout) {
        clearTimeout(this.filterDebounceTimeout);
      }
      this.filterDebounceTimeout = setTimeout(() => {
        this.emitActiveFilterRows();
      }, 1000);
    });
  }
}
