import { Pipe, PipeTransform } from '@angular/core';
import { ParserOps } from 'src/app/tags/models/parser';
import { ChannelOps, ChannelEnum } from '../models/channel';
import { EntityEnum } from '../models/entity';

@Pipe({
  name: 'entityDisplayName'
})
export class EntityDisplayNamePipe implements PipeTransform {

  transform(value: EntityEnum, ...args: string[]): any {
    const [ channel ] = args;
    return ChannelOps.getEntityDisplayName({
      channel: channel !== 'plural' ? channel as ChannelEnum : undefined,
      entity: value as EntityEnum,
      plural: args.includes('plural'),
    })
  }

}
