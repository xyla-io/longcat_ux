import { Pipe, PipeTransform } from '@angular/core';

export interface SelectionChoices {
  min?: number;
  max?: number;
  values?: (number|string)[];
}

@Pipe({
  name: 'selectionChoices'
})
export class SelectionChoicesPipe implements PipeTransform {

  transform(selectionChoices: SelectionChoices, ...args: any[]): any {
    if (selectionChoices.values) { return selectionChoices.values; }
    return Array(selectionChoices.max - selectionChoices.min + 1)
      .fill(0)
      .map((_, i) => i + selectionChoices.min);
  }
}
