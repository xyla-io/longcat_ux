import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { DaterangeService } from 'src/app/dashboard/services/daterange.service';
import { Daterange } from 'src/app/dashboard/interfaces/query';
import { EventTemplateEditingValidation } from 'src/app/editing/services/editing.service';

@Component({
  selector: 'app-daterange-selector',
  templateUrl: './daterange-selector.component.html',
  styleUrls: ['./daterange-selector.component.scss'],
})
export class DaterangeSelectorComponent implements OnInit {
  // Used in the template
  DaterangeService = DaterangeService;

  @Input() daterange: Daterange;
  @Output() daterangeChange = new EventEmitter<Daterange>();
  @Output() validationChange = new EventEmitter<EventTemplateEditingValidation>();

  constructor() { }

  ngOnInit() {
  }

  onDaterangeChange(daterange: Daterange) {
    this.daterangeChange.emit(daterange);
  }

  onValidationChange(validation: EventTemplateEditingValidation) {
    this.validationChange.emit(validation);
  }

}
