import { ObjectReport } from "./object-report";
import { EntityEnum } from "src/app/iomap/models/entity";
import { ChannelEnum } from "src/app/iomap/models/channel";

export enum NodeType {
  ChannelEntity = 'channel_entity',
}

export interface AlmacenEntityNode {
  nodeType: NodeType.ChannelEntity,
  channel: ChannelEnum,
  entityLevel: EntityEnum,
  name: string,
  id: string;
  _id: string;
  parserName: string;
  tags?: Record<string, string>;
}

export interface AlmacenEntityNodeWithNamingConvention extends AlmacenEntityNode {
  parserName: string;
}

export interface AlmacenEntityRow {
  url: string;      // channel_entity://<ChannelEnum>/<EntityEnum>/<id>
  channel: string;  // Human-readable name, e.g., 'Google', 'Apple', 'Snapchat'
  entity: EntityEnum;
  name: string;
  id: string;
  number: string;
}

export class AlmacenEntityReport extends ObjectReport {

  static rowAsGridNode(row) {
    const [ channelEnum, entityLevel ] = AlmacenEntityReport.pathComponentsFromRowUrl(row.url);
    return {
      _id: row.url,
      nodeType: NodeType.ChannelEntity,
      channel: channelEnum as ChannelEnum,
      entityLevel: entityLevel as EntityEnum,
      name: row.name,
      id: row.id,
      parserName: '',
    }
  }

  // TODO: this needs to be deprecated with the list-tags.component becoming compatible with io-grid.component
  rowsAsGridNodes(): AlmacenEntityNode[] {
    return this.rows.map((row: AlmacenEntityRow): AlmacenEntityNode => {
      return AlmacenEntityReport.rowAsGridNode(row);
    });
  }

  gridNodesByChannelAndEntityLevel() {
    return this.rows.reduce((namesByChannel, row) => {
      const [ channelEnum, entityLevel ] = AlmacenEntityReport.pathComponentsFromRowUrl(row.url);
      namesByChannel[channelEnum] = namesByChannel[channelEnum] || {};
      namesByChannel[channelEnum][entityLevel] = namesByChannel[channelEnum][entityLevel] || [];
      namesByChannel[channelEnum][entityLevel].push(AlmacenEntityReport.rowAsGridNode(row));
      return namesByChannel;
    }, {});
  }

}