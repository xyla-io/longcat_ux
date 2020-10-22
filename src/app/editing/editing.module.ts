import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  NbPopoverModule,
  NbIconModule,
  NbCalendarRangeModule,
} from '@nebular/theme';

import { SharedModule } from 'src/app/shared/shared.module';

import { EditingService } from 'src/app/editing/services/editing.service';

import { DaterangeSelectorComponent } from './components/daterange-selector/daterange-selector.component';
import { DaterangeBuilderComponent } from './components/daterange-builder/daterange-builder.component';
import { RowFilterComponent } from './components/row-filter/row-filter.component';
import { SaveControlComponent } from './components/save-control/save-control.component';

@NgModule({
  declarations: [
    DaterangeSelectorComponent,
    DaterangeBuilderComponent,
    RowFilterComponent,
    SaveControlComponent,
  ],
  providers: [
    EditingService,
  ],
  imports: [
    CommonModule,
    SharedModule,
    NbPopoverModule,
    NbIconModule,
    NbCalendarRangeModule,
  ],
  exports: [
    DaterangeSelectorComponent,
    DaterangeBuilderComponent,
    RowFilterComponent,
    SaveControlComponent,
  ],
})
export class EditingModule { }
