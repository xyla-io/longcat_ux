import {
  Component,
  OnInit,
  OnChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { v4 as uuid } from 'uuid';
import { EnhancedTemplateMaster, ColumnCategory, ColumnCategoryIdentifier } from 'src/app/dashboard/interfaces/master';
import {
  EventTemplateEditingValidation,
} from 'src/app/editing/services/editing.service';
import { TemplateColumn, ColumnIdentifier, DisplayColumn } from 'src/app/dashboard/interfaces/column';
import { RowFilterOps } from 'src/app/dashboard/workers/util/row-filter';
import { BankedButton } from 'src/app/shared/components/button-bank/button-bank.component';
import { ColumnOps } from 'src/app/dashboard/workers/util/column';

@Component({
  selector: 'app-edit-columns',
  templateUrl: './edit-columns.component.html',
  styleUrls: ['./edit-columns.component.scss'],
})
export class EditColumnsComponent implements OnInit, OnChanges {

  @Input() selectedDisplayColumns: DisplayColumn[];
  @Input() masterTemplate: EnhancedTemplateMaster;
  @Input() firstColumnBadge?: string;
  @Input() maxSelectedDisplayColumns?: number;

  @Output() selectedDisplayColumnsChange = new EventEmitter<DisplayColumn[]>();
  @Output() validationChange = new EventEmitter<EventTemplateEditingValidation>();

  templateColumnMap: Map<ColumnIdentifier, TemplateColumn>;
  columnToColumnCategoryMap: Map<ColumnIdentifier, ColumnCategory>;
  columnCategories: ColumnCategory[];
  columnCategoryMap: Map<ColumnCategoryIdentifier, ColumnCategory>;
  displayColumnTitles: string[];

  bankedButtons: BankedButton[] = [];
  expandedIndex = -1;
  expandedDisplayColumn: DisplayColumn;

  constructor(
  ) { }

  ngOnInit() {
    this.templateColumnMap = this.masterTemplate.enhancements.templateColumnMap;
    this.columnToColumnCategoryMap = this.masterTemplate.enhancements.columnToColumnCategoryMap;
    this.columnCategories = this.masterTemplate.structure.columnCategories;
    this.columnCategoryMap = this.masterTemplate.enhancements.columnCategoryMap;
    this.selectedDisplayColumns = this.selectedDisplayColumns.slice();
    this.displayColumnTitles = this.selectedDisplayColumns.map(displayColumn => {
      // userDisplayName takes precedence
      const { userDisplayName } = displayColumn.parameters;
      if (userDisplayName) { return userDisplayName; }
      const templateColumn = this.templateColumnMap.get(displayColumn.identifier);
      const title = ColumnOps.getDisplayColumnName({ displayColumn, templateColumn });
      displayColumn.parameters.inscriptionDisplayName = title;
      return title;
    });
    this.emitValidation();
    this.updateBankedButtons();
  }

  ngOnChanges() {

  }

  emitSelectedDisplayColumnsChange() {
    this.emitValidation();
    this.selectedDisplayColumnsChange.emit(cloneDeep(this.selectedDisplayColumns));
    this.updateBankedButtons();
  }

  emitValidation() {
    if (!this.selectedDisplayColumns.length) {
      this.validationChange.emit({
        isValid: false,
        message: 'Please select at least one KPI',
      });
      return;
    }
    this.validationChange.emit({isValid: true, message: null});
  }

  updateBankedButtons() {
    let maxColumnsReached = false;
    if (typeof this.maxSelectedDisplayColumns === 'number') {
      maxColumnsReached = this.selectedDisplayColumns.length >= this.maxSelectedDisplayColumns;
    }
    this.bankedButtons = this.columnCategories.map(category => ({
      identifier: category.metadata.identifier,
      displayName: category.displayName,
      disabled: maxColumnsReached,
      tooltip: maxColumnsReached ? 'Maximum reached' : null,
    }));
  }

  onBankedButtonClick(categoryIdentifier: string) {
    const columnCategory = this.columnCategoryMap.get(categoryIdentifier);
    const columnIdentifier = columnCategory.columnIdentifiers[0];

    const templateColumn = this.templateColumnMap.get(columnIdentifier);
    const title = ColumnOps.getDisplayColumnName({ templateColumn });
    this.selectedDisplayColumns.push({
      uid: uuid(),
      identifier: columnIdentifier,
      parameters: {
        inscriptionDisplayName: title,
      },
    });
    this.toggleColumnExpansion(this.selectedDisplayColumns.length - 1);
    this.emitSelectedDisplayColumnsChange();
  }

  onClickRemoveColumn(index: number) {
    this.selectedDisplayColumns.splice(index, 1);
    this.emitSelectedDisplayColumnsChange();

    if (this.expandedIndex === index) {
      this.toggleColumnExpansion(index);
    } else if (this.expandedIndex > index) {
      this.setExpandedIndex(this.expandedIndex - 1);
    }
  }

  onClickExpandColumn(index: number) {
    this.toggleColumnExpansion(index);
  }

  onDisplayColumnChange(displayColumn: DisplayColumn) {
    this.updateExpandedDisplayColumn(displayColumn);
    this.emitSelectedDisplayColumnsChange();
  }


  toggleColumnExpansion(index: number) {
    if (index === this.expandedIndex) {
      this.setExpandedIndex(-1);
      return;
    }
    this.setExpandedIndex(index);
  }

  setExpandedIndex(index: number) {
    this.expandedIndex = index;
    this.updateExpandedDisplayColumn(this.selectedDisplayColumns[index]);
  }

  updateExpandedDisplayColumn(displayColumn: DisplayColumn) {
    this.expandedDisplayColumn = null;
    if (displayColumn) {
      this.selectedDisplayColumns[this.expandedIndex] = cloneDeep(displayColumn);
      this.expandedDisplayColumn = cloneDeep(displayColumn);
    }
  }

}
