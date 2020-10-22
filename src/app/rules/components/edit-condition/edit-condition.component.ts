import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Condition, MetricTypeEnum, TaskOps, GroupOperatorEnum, MetricEnum, OperatorEnum, TaskSetType } from '../../models/task';
import { Options } from '../../../iomap/util/options';
import { ChannelEnum } from 'src/app/iomap/models/channel';

@Component({
  selector: 'app-edit-condition',
  templateUrl: './edit-condition.component.html',
  styleUrls: ['./edit-condition.component.scss']
})
export class EditConditionComponent implements OnInit {
  MetricTypeEnum = MetricTypeEnum;
  GroupOperatorEnum = GroupOperatorEnum;
  Options = Options;
  TaskOps = TaskOps;
  TaskSetType = TaskSetType;

  @Input() glowing: ChannelEnum;
  @Input() condition: Condition;
  @Input() groupOperator: GroupOperatorEnum;
  @Input() conditionIndex: number;
  @Input() channel: ChannelEnum;
  @Input() taskSetType: TaskSetType;
  @Input() allowAddCondition = true;
  @Input() allowDeleteCondition = true;
  @Output() groupOperatorChange = new EventEmitter<GroupOperatorEnum>();
  @Output() metricChange = new EventEmitter<MetricEnum>();
  @Output() conditionOperatorChange = new EventEmitter<OperatorEnum>();
  @Output() metricValueChange = new EventEmitter<string>();
  @Output() addCondition = new EventEmitter<null>();
  @Output() deleteCondition = new EventEmitter<null>();

  constructor() { }

  ngOnInit() {
  }

  onGroupOperatorChange(event) {
    this.groupOperatorChange.emit(event.target.value);
  }

  onMetricChange(event) {
    this.metricChange.emit(event.target.value);
  }

  onConditionOperatorChange(event) {
    this.conditionOperatorChange.emit(event.target.value);
  }

  onMetricValueChange(event) {
    this.metricValueChange.emit(event.target.value);
  }
 
  onAddConditionClick(event) {
    this.addCondition.emit();
  }

  onDeleteConditionClick(event) {
    this.deleteCondition.emit();
  }


}
