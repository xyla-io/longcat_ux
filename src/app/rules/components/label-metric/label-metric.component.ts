import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { MetricTypeEnum } from '../../models/task';

@Component({
  selector: 'app-label-metric',
  templateUrl: './label-metric.component.html',
  styleUrls: ['./label-metric.component.scss']
})
export class LabelMetricComponent implements OnInit, OnChanges {
  MetricTypeEnum = MetricTypeEnum;
  @Input() metricType: MetricTypeEnum;

  prefix: boolean;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.prefix = [MetricTypeEnum.Currency].includes(this.metricType)
  }

}
