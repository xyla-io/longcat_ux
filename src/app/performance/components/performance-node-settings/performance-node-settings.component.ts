import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { Daterange, DaterangeUnit } from 'src/app/dashboard/interfaces/query';
import { OptionConfig, Options } from 'src/app/iomap/util/options';
import { SelectionChange } from 'src/app/shared/components/option-multi-select/option-multi-select.component';

@Component({
  selector: 'app-performance-node-settings',
  templateUrl: './performance-node-settings.component.html',
  styleUrls: ['./performance-node-settings.component.scss']
})
export class PerformanceNodeSettingsComponent implements OnInit, OnChanges {

  @Input() kpiModel: Record<string, boolean> = {};
  @Input() kpiOptions: Record<string, OptionConfig<any>>;
  @Input() daterange: Daterange = { 
    unit: DaterangeUnit.Day,
    value: 30,
  };
  @Input() showLabels: boolean = true;
  @Output() kpiChange = new EventEmitter<string[]>();
  @Output() daterangeChange = new EventEmitter<Daterange>();

  ready = false;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.ready = !!(this.kpiOptions && Object.keys(this.kpiOptions).length);
  }

  onSelectKPIChange(changes: SelectionChange<any>[]) {
    changes.forEach(({option, value}) => {
      this.kpiModel[option.key] = value;
    })
    this.kpiModel = cloneDeep(this.kpiModel);
    this.kpiChange.emit(Options.trueKeys(this.kpiModel));
  }

  onDaterangeChange(event: Daterange) {
    this.daterange = event;
    this.daterangeChange.emit(this.daterange);
  }

}
