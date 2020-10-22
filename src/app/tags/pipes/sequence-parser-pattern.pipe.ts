import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sequenceParserPattern'
})
export class SequenceParserPatternPipe implements PipeTransform {
  transform(fields: string[], ...args: any[]): any {
    if (!fields || !fields.map) { return ''; }
    const [ selectedDelimiter ] = args;
    return fields.map(name => name.replace(selectedDelimiter, '')).join(selectedDelimiter);
  }

}
