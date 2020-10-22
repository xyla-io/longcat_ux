import { Pipe, PipeTransform } from '@angular/core';
import { ParserNode } from 'src/app/grid/node-ops/parser.node';
import { ParserOps } from '../../tags/models/parser';

@Pipe({
  name: 'sequenceParserSample'
})
export class SequenceParserSamplePipe implements PipeTransform {

  transform(value: ParserNode, ...args: any[]): any {
    const parsers = args[0];
    return ParserOps.sequenceParserSample(value, parsers);
  }

}
