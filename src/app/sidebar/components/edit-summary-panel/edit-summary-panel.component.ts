import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { cloneDeep } from 'lodash-es';
import { SidebarPageComponent } from 'src/app/sidebar/factories/sidebar-content.factory';
import {
  EventTemplateEditingValidation,
} from 'src/app/editing/services/editing.service';
import { TemplateBigNumber, BigNumberSize } from 'src/app/dashboard/services/big-number.service';
import { EnhancedTemplateMaster } from 'src/app/dashboard/interfaces/master';
import { TemplateGroup, TemplateType } from 'src/app/dashboard/interfaces/template';
import { DisplayColumn } from 'src/app/dashboard/interfaces/column';
import { Daterange } from 'src/app/dashboard/interfaces/query';
import { TemplateService } from 'src/app/dashboard/services/template.service';

@Component({
  selector: 'app-edit-summary-panel',
  templateUrl: './edit-summary-panel.component.html',
  styleUrls: ['./edit-summary-panel.component.scss']
})
export class EditSummaryPanelComponent implements OnInit, SidebarPageComponent<TemplateGroup<TemplateBigNumber>, EnhancedTemplateMaster> {
  @Input() inputTemplate: TemplateGroup<TemplateBigNumber>;
  @Input() masterTemplate: EnhancedTemplateMaster;
  @Output() templateUpdate = new EventEmitter<TemplateGroup<TemplateBigNumber>>();
  @Output() validationChange = new EventEmitter<EventTemplateEditingValidation>();

  validationMap: Record<string, EventTemplateEditingValidation> = {
    editColumns: null,
    editDaterange: null,
  };

  selectedDisplayColumns: DisplayColumn[];
  outputTemplate: TemplateGroup<TemplateBigNumber>;
  interval: Daterange;

  readonly maxSelectedDisplayColumns = 4;

  constructor(
    private templateService: TemplateService,
  ) { }

  ngOnInit() {
    const { queryParameters } = this.inputTemplate;
    this.interval = (queryParameters || {}).interval;

    this.selectedDisplayColumns = this.inputTemplate.structure.templates.map(template => {
      return cloneDeep(template.structure.displayColumn);
    });

    this.outputTemplate = cloneDeep(this.inputTemplate);
  }

  onEditColumnsValidationChange(validation: EventTemplateEditingValidation) {
    this.updateValidationMap('editColumns', validation);
  }

  onSelectedDisplayColumnsChange(displayColumns: DisplayColumn[]) {
    const { parentPath, parentVersion } = this.inputTemplate.metadata;
    this.outputTemplate.structure.templates = displayColumns.map((column, i) => {
      const identifier = uuid();
      return {
        metadata: {
          identifier,
          templateType: TemplateType.BigNumber,
          parentPath,
          parentVersion,
          version: 0,
          more: {},
        },
        structure: {
          displayColumn: column,
          size: (i === 0) ? BigNumberSize.Large : BigNumberSize.Normal,
        },
        path: this.templateService.buildTemplatePath({
          templateType: TemplateType.BigNumber,
          identifier,
          unprotected: true
        }),
      };
    });
    this.templateUpdate.emit(this.outputTemplate);
  }

  onEditDaterangeValidationChange(validation: EventTemplateEditingValidation) {
    this.updateValidationMap('editDaterange', validation);
  }

  onDaterangeChange(daterange: Daterange) {
    if (!this.outputTemplate.queryParameters) {
      this.outputTemplate.queryParameters = {};
    }
    this.outputTemplate.queryParameters.interval = daterange;
    this.templateUpdate.emit(this.outputTemplate);
  }

  updateValidationMap(validationKey: string, validation: EventTemplateEditingValidation) {
    this.validationMap[validationKey] = validation;
    if (!validation.isValid) {
      this.validationChange.emit(validation);
      return;
    }

    const allValid = Object.values(this.validationMap).every(value => value && value.isValid);
    if (allValid) {
      this.validationChange.emit({ isValid: true, message: null });
    }
  }

}
