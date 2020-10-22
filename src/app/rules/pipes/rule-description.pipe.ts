import { Pipe, PipeTransform } from '@angular/core';
import { Rule } from '../models/rule';
import { TaskDescriptionPipe } from "./task-description.pipe";

const taskPipe = new TaskDescriptionPipe();

@Pipe({
  name: 'ruleDescription'
})
export class RuleDescriptionPipe implements PipeTransform {

  transform(rule: Rule): any {
    let components = rule.tasks.map(task => { return taskPipe.transform(task); });
    return components.join(' || ');
  }

}
