import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { TemplateBreakdownTable } from 'src/app/dashboard/services/breakdown-table.service';
import { EnhancedTemplateMaster } from 'src/app/dashboard/interfaces/master';
import { DisplayColumn } from 'src/app/dashboard/interfaces/column';
import { SidebarPageComponent } from 'src/app/sidebar/factories/sidebar-content.factory';
import { EventTemplateEditingValidation } from 'src/app/editing/services/editing.service';

@Component({
  selector: 'app-edit-breakdown-table-columns',
  templateUrl: './edit-breakdown-table-columns.component.html',
  styleUrls: ['./edit-breakdown-table-columns.component.scss'],
})
export class EditBreakdownTableColumnsComponent
implements OnInit, SidebarPageComponent<TemplateBreakdownTable, EnhancedTemplateMaster> {

  @Input() inputTemplate: TemplateBreakdownTable;
  @Input() masterTemplate: EnhancedTemplateMaster;
  @Output() templateUpdate = new EventEmitter<TemplateBreakdownTable>();
  @Output() validationChange = new EventEmitter<EventTemplateEditingValidation>();

  selectedDisplayColumns: DisplayColumn[];

  constructor(
  ) { }

  ngOnInit() {
    this.selectedDisplayColumns = cloneDeep(this.inputTemplate.structure.displayColumns);
  }

  onSelectedDisplayColumnsChange(displayColumns: DisplayColumn[]) {
    const outputTemplate = cloneDeep(this.inputTemplate);
    outputTemplate.structure.displayColumns = cloneDeep(displayColumns);
    this.templateUpdate.emit(outputTemplate);
  }

  onEditColumnsValidationChange(validation: EventTemplateEditingValidation) {
    this.validationChange.emit(validation);
  }
}
