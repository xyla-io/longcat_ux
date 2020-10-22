import { Pipe, PipeTransform } from '@angular/core';
import { Condition, OperatorEnum, GroupOperatorEnum, ActionEnum, TaskOps, MetricEnum, ConditionGroup, Task } from '../models/task';

@Pipe({
  name: 'taskDescription'
})
export class TaskDescriptionPipe implements PipeTransform {

  transform(task: Task): any {
    let components: string[] = [
      conditionGroupDescription(task.conditionGroup as ConditionGroup),
      '→',
      `${action(task.actions[0].action)}`,
    ];

    if (!['no_action', 'pause_keyword', 'pause_campaign'].includes(task.actions[0].action)) {
      components = components.concat([
        `${task.actions[0].adjustmentValue}%`,
        '⇥',
        `$${task.actions[0].adjustmentLimit}`,
      ]);
    }
    return components.join(' ');
  }

}

function conditionGroupDescription(group: ConditionGroup): string {
  let conditionDescriptions = group.conditions.map(conditionDescription);
  let subgroupDescriptions = group.subgroups.map(conditionGroupDescription);

  let components = conditionDescriptions.concat(subgroupDescriptions);

  if (components.length === 1) { return components[0] }

  let operator = groupOperator(group.operator);

  return `( ${components.join(' ' + operator + ' ')} )`
}

function conditionDescription(condition: Condition): string {
  let components: string[] = [
    metric(condition.metric),
    `${conditionalOperator(condition.operator)}`,
    `$${condition.metricValue}`,
  ];

  return components.join(' ');
}

function conditionalOperator(operator: OperatorEnum): string {
  const option = TaskOps.operatorOptions[operator];
  return option.shorthandDescription || option.displayName || '';
}

function groupOperator(operator: GroupOperatorEnum): string {
  const option = TaskOps.groupOperatorOptions[operator];
  return option.shorthandDescription || option.displayName || '';
}

function action(action: ActionEnum): string {
  const option = TaskOps.actionOptions[action];
  return option.shorthandDescription || option.displayName || '';
}

function metric(metric: MetricEnum): string {
  const option = TaskOps.metricOptions[metric];
  return option.shorthandDescription || option.displayName || '';
}
