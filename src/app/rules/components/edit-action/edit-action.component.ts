import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Action, MetricTypeEnum, TaskOps, ActionEnum } from '../../models/task';
import { Options } from '../../../iomap/util/options';
import { ChannelEnum } from 'src/app/iomap/models/channel';

@Component({
  selector: 'app-edit-action',
  templateUrl: './edit-action.component.html',
  styleUrls: ['./edit-action.component.scss']
})
export class EditActionComponent implements OnInit {
  MetricTypeEnum = MetricTypeEnum;
  Options = Options;
  TaskOps = TaskOps;

  @Input() action: Action;
  @Input() channel: ChannelEnum;
  @Output() actionChange = new EventEmitter<ActionEnum>()
  @Output() adjustmentValueChange = new EventEmitter<number>()
  @Output() adjustmentLimitChange = new EventEmitter<number>()

  constructor() { }

  ngOnInit() {
  }

  onSelectActionChange(event) {
    this.actionChange.emit(event.target.value);
  }

  onAdjustmentValueChange(event) {
    this.adjustmentValueChange.emit(event.target.value);
  }

  onAdjustmentLimitChange(event) {
    this.adjustmentLimitChange.emit(event.target.value);
  }

}
