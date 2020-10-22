import { Pipe, PipeTransform } from '@angular/core';
import { ParserOps } from 'src/app/tags/models/parser';

@Pipe({
  name: 'sequenceParserKey'
})
export class SequenceParserKeyPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return ParserOps.sequenceParserKey(value);
  }

}
