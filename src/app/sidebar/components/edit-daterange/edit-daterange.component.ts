import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { EnhancedTemplateMaster } from 'src/app/dashboard/interfaces/master';
import { SidebarPageComponent } from 'src/app/sidebar/factories/sidebar-content.factory';
import { EventTemplateEditingValidation } from 'src/app/editing/services/editing.service';
import { BlockTemplate } from 'src/app/dashboard/interfaces/template';
import { Daterange } from 'src/app/dashboard/interfaces/query';

@Component({
  selector: 'app-edit-daterange',
  templateUrl: './edit-daterange.component.html',
  styleUrls: ['./edit-daterange.component.css']
})
export class EditDaterangeComponent
implements OnInit, SidebarPageComponent<BlockTemplate, EnhancedTemplateMaster> {

  @Input() inputTemplate: BlockTemplate;
  @Input() masterTemplate: EnhancedTemplateMaster;
  @Output() templateUpdate = new EventEmitter<BlockTemplate>();
  @Output() validationChange = new EventEmitter<EventTemplateEditingValidation>();

  daterange: Daterange;

  constructor() { }

  ngOnInit() {
    this.daterange = (this.inputTemplate.queryParameters || {}).interval;
    this.emitValidation({ isValid: true, message: null });
  }

  emitValidation(validation: EventTemplateEditingValidation) {
    this.validationChange.emit(validation);
  }

  onEditDaterangeValidationChange(validation: EventTemplateEditingValidation) {
    this.emitValidation(validation);
  }

  onDaterangeChange(daterange: Daterange) {
    const outputTemplate = cloneDeep(this.inputTemplate);
    outputTemplate.queryParameters = (outputTemplate.queryParameters || {});
    outputTemplate.queryParameters.interval = daterange;
    this.templateUpdate.emit(outputTemplate);
  }

}
