import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { NbCalendarRange, NbDateService } from '@nebular/theme';
import { DaterangeService } from 'src/app/dashboard/services/daterange.service';
import { Daterange, DaterangeUnit, DaterangeValue, StartEnd } from 'src/app/dashboard/interfaces/query';

import {
  EventTemplateEditingValidation,
} from 'src/app/editing/services/editing.service';

interface TimelineOption {
  slug: string;
  unit: DaterangeUnit|null;
  value: DaterangeValue|NbCalendarRange<Date>|null;
  displayName: string;
}

@Component({
  selector: 'app-daterange-builder',
  templateUrl: './daterange-builder.component.html',
  styleUrls: ['./daterange-builder.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DaterangeBuilderComponent implements OnInit, OnDestroy {

  @Input() daterange: Daterange;
  @Output() daterangeChange = new EventEmitter<Daterange>();
  @Output() validationChange = new EventEmitter<EventTemplateEditingValidation>();

  readonly maxDate = new Date();

  timelineOptions: TimelineOption[] = [
    {
      slug: 'daterange',
      unit: DaterangeUnit.Range,
      value: { start: null, end: null },
      displayName: 'Date Range',
    },
    {
      slug: 'three_days',
      unit: DaterangeUnit.Day,
      value: 3,
      displayName: '3 days',
    },
    {
      slug: 'seven_days',
      unit: DaterangeUnit.Day,
      value: 7,
      displayName: '7 days',
    },
    {
      slug: 'thirty_days',
      unit: DaterangeUnit.Day,
      value: 30,
      displayName: '30 days',
    },
    {
      slug: 'sixty_days',
      unit: DaterangeUnit.Day,
      value: 60,
      displayName: '60 days',
    },
    {
      slug: 'ninety_days',
      unit: DaterangeUnit.Day,
      value: 90,
      displayName: '90 days',
    },
    {
      slug: 'one_hundred_eighty_days',
      unit: DaterangeUnit.Day,
      value: 180,
      displayName: '180 days',
    },
    {
      slug: 'three_hundred_sixty_days',
      unit: DaterangeUnit.Day,
      value: 360,
      displayName: '360 days',
    },
    {
      slug: 'all_dates',
      unit: null,
      value: null,
      displayName: 'All Dates',
    },
  ];

  validationState: EventTemplateEditingValidation = {
    isValid: true,
    message: null,
  };
  selectedTimelineOption: TimelineOption;
  daterangeOption = this.timelineOptionForSlug('daterange');
  calendarOpen = false;

  constructor(
    private dateService: NbDateService<Date>,
  ) { }

  ngOnInit() {
    this.selectedTimelineOption = this.timelineOptionForDaterange(this.daterange);
    this.emitValidationChange({ isValid: true, message: null });
  }

  ngOnDestroy() {
  }

  emitValidationChange(validation: EventTemplateEditingValidation) {
    this.validationState = validation;
    this.validationChange.emit(validation);
  }

  onTimelineSelectChange(event: any, ) {
    this.selectedTimelineOption = this.timelineOptionForSlug(event.target.value);
    if (this.selectedTimelineOption.slug === 'daterange') {
      this.calendarOpen = true;
    }
    this.emitDaterangeChanged();
  }

  onCalendarRangeChange(value: any) {
    this.daterangeOption.value = value;
    this.emitDaterangeChanged();
  }

  onToggleRangeSelectionClick(event: any) {
    if (this.calendarOpen && !this.validationState.isValid) {
      return;
    }
    this.calendarOpen = !this.calendarOpen;
  }

  emitDaterangeChanged() {
    let { unit, value } = this.selectedTimelineOption;
    if (unit && typeof value === 'object') {
      if (!value.start || !value.end) {
        this.emitValidationChange({
          isValid: false,
          message: 'Please select a date range',
        });
        return;
      }
      value = {
        start: (value.start as Date).toISOString(),
        end: (value.end as Date).toISOString(),
      };
    }
    const emission = unit ? ({
      unit,
      value,
    } as Daterange) : null;
    this.emitValidationChange({ isValid: true, message: null });
    this.daterangeChange.emit(emission);
  }

  timelineOptionForSlug(slug: string): TimelineOption {
    return this.timelineOptions.find(option => option.slug === slug);
  }

  timelineOptionForDaterange(daterange: Daterange): TimelineOption {
    if (!daterange) {
      return this.timelineOptionForSlug('all_dates');
    }
    if (daterange.unit === DaterangeUnit.Range) {
      const value = daterange.value as StartEnd;
      this.daterangeOption.value = {
        start: new Date(value.start),
        end: new Date(value.end),
      };
      return this.daterangeOption;
    }
    return this.timelineOptions.find(option => {
      return option.unit === daterange.unit && option.value === daterange.value;
    });
  }

}
