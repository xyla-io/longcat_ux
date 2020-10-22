import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ChannelEnum } from 'src/app/iomap/models/channel';
import { Task, ActionEnum, GroupOperatorEnum, OperatorEnum, MetricEnum, TaskSetType, TaskOps, ConditionGroup } from '../../models/task';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss']
})
export class EditTaskComponent implements OnInit, OnChanges {
  @Input() task: Task;
  @Input() channel: ChannelEnum;
  @Input() taskSetType: TaskSetType;
  @Input() glowing = false;
  @Output() actionChange = new EventEmitter<ActionEnum>();
  @Output() adjustmentValueChange = new EventEmitter<string>();
  @Output() adjustmentLimitChange = new EventEmitter<string>();
  @Output() groupOperatorChange = new EventEmitter<{operator: GroupOperatorEnum, index: number}>();
  @Output() metricChange = new EventEmitter<{metric: MetricEnum, index: number}>();
  @Output() conditionOperatorChange = new EventEmitter<{operator: OperatorEnum, index: number}>();
  @Output() metricValueChange = new EventEmitter<{metricValue: string, index: number}>();
  @Output() addCondition = new EventEmitter<number>();
  @Output() deleteCondition = new EventEmitter<number>();

  allowMultipleConditions: boolean;

  constructor() { }

  get conditionGroup(): ConditionGroup {
    return this.task.conditionGroup as ConditionGroup;
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.allowMultipleConditions = this.taskSetType !== TaskSetType.CruiseControl;
  }

  onActionChange(action) {
    this.actionChange.emit(action);
  }

  onAdjustmentValueChange(adjustmentValue: string) {
    this.adjustmentValueChange.emit(adjustmentValue);
  }

  onAdjustmentLimitChange(adjustmentLimit: string) {
    this.adjustmentLimitChange.emit(adjustmentLimit);
  }

  onGroupOperatorChange(operator: GroupOperatorEnum, index: number) {
    this.groupOperatorChange.emit({operator, index});
  }

  onMetricChange(metric: MetricEnum, index: number) {
    this.metricChange.emit({metric, index});
  }

  onConditionOperatorChange(operator: OperatorEnum, index: number ) {
    this.conditionOperatorChange.emit({operator, index});
  }

  onMetricValueChange(metricValue: string, index: number) {
    this.metricValueChange.emit({metricValue, index});
  }

  onAddCondition(index: number) {
    this.addCondition.emit(index);
  }

  onDeleteCondition(index: number) {
    this.deleteCondition.emit(index);
  }
}
