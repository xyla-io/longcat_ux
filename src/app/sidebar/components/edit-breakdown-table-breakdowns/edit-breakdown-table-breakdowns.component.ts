import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { NbAccordionItemComponent } from '@nebular/theme';
import { cloneDeep } from 'lodash-es';
import {
  EnhancedTemplateMaster,
} from 'src/app/dashboard/interfaces/master';
import { TemplateBreakdownTable } from 'src/app/dashboard/services/breakdown-table.service';
import { TemplateBreakdown, BreakdownIdentifier } from 'src/app/dashboard/interfaces/breakdown';
import {
  SidebarPageComponent,
} from 'src/app/sidebar/factories/sidebar-content.factory';
import {
  EventTemplateEditingValidation,
} from 'src/app/editing/services/editing.service';
import { BankedButton } from 'src/app/shared/components/button-bank/button-bank.component';


@Component({
  selector: 'app-edit-breakdown-table-breakdowns',
  templateUrl: './edit-breakdown-table-breakdowns.component.html',
  styleUrls: ['./edit-breakdown-table-breakdowns.component.scss'],
})
export class EditBreakdownTableBreakdownsComponent
implements OnInit, SidebarPageComponent<TemplateBreakdownTable, EnhancedTemplateMaster> {

  @Input() inputTemplate: TemplateBreakdownTable;
  @Input() masterTemplate: EnhancedTemplateMaster;
  @Output() templateUpdate = new EventEmitter<TemplateBreakdownTable>();
  @Output() validationChange = new EventEmitter<EventTemplateEditingValidation>();

  outputTemplate: TemplateBreakdownTable;

  templateBreakdowns: TemplateBreakdown[];
  templateBreakdownMap: Map<BreakdownIdentifier, TemplateBreakdown>;
  bankedButtons: BankedButton[] = [];

  @ViewChildren('breakdownWidget') breakdownWidgets: QueryList<NbAccordionItemComponent>;

  readonly maxBreakdowns = 3;
  selectedDisplayBreakdownIdentifiers: BreakdownIdentifier[];

  numberToOrdinalText(value: number): string {
    return ['', 'First', 'Second', 'Third'][value] || '';
  }

  constructor() { }

  ngOnInit() {
    this.selectedDisplayBreakdownIdentifiers = this.inputTemplate.structure.displayBreakdownIdentifiers.slice();
    this.templateBreakdowns = this.masterTemplate.structure.templateBreakdowns;
    this.templateBreakdownMap = this.masterTemplate.enhancements.templateBreakdownMap;
    this.outputTemplate = cloneDeep(this.inputTemplate);
    this.updateBankedButtons();
    this.emitValidation();
  }

  emitValidation() {
    if (!this.selectedDisplayBreakdownIdentifiers.length) {
      this.validationChange.emit({
        isValid: false,
        message: 'Please select at least one dimension',
      });
      return;
    }
    this.validationChange.emit({isValid: true, message: null});
  }

  addDimension(identifier: string) {
    if (this.selectedDisplayBreakdownIdentifiers.length >= this.maxBreakdowns) { return; }
    this.selectedDisplayBreakdownIdentifiers.push(identifier);
    this.emitOutputTemplate();
  }

  removeDimension(index: number) {
    this.selectedDisplayBreakdownIdentifiers.splice(index, 1);
    this.emitOutputTemplate();
  }

  emitOutputTemplate() {
    this.emitValidation();
    this.outputTemplate.structure.displayBreakdownIdentifiers = this.selectedDisplayBreakdownIdentifiers;
    this.templateUpdate.emit(this.outputTemplate);
    this.updateBankedButtons();
  }

  nextAvailableTemplateBreakdowns(identifier: BreakdownIdentifier): BreakdownIdentifier[] {
    const breakdown = this.templateBreakdownMap.get(identifier);
    return breakdown.descendantIdentifiers;
  }

  onClickRemoveDimension(index: number) {
    this.removeDimension(index);
  }

  onBankedButtonClick(identifier: string) {
    this.addDimension(identifier);
  }

  updateBankedButtons() {
    const maxBreakdownsReached = this.selectedDisplayBreakdownIdentifiers.length >= this.maxBreakdowns;
    this.bankedButtons = this.templateBreakdowns.reduce((buttons, breakdown) => {
      if (this.selectedDisplayBreakdownIdentifiers.includes(breakdown.metadata.identifier)) {
        return buttons;
      }
      const button = {
        identifier: breakdown.metadata.identifier,
        displayName: breakdown.displayName,
        disabled: false,
        tooltip: null,
      };
      if (maxBreakdownsReached) {
        button.disabled = true;
        button.tooltip = 'Maximum dimensions reached';
      } else {
        this.selectedDisplayBreakdownIdentifiers.forEach(identifier => {
          const ancestorBreakdown = this.templateBreakdownMap.get(identifier);
          if (!ancestorBreakdown.descendantIdentifiers.includes(breakdown.metadata.identifier)) {
            button.disabled = true;
            const parentDisplayName = ancestorBreakdown.displayName;
            button.tooltip = `${breakdown.displayName} cannot be a descendant of ${ancestorBreakdown.displayName}`;
          }
        });
      }
      buttons.push(button);
      return buttons;
    }, []);
  }

}
