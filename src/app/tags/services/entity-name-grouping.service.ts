import { Injectable } from '@angular/core';
import { TagParserService } from './tag-parser.service';
import { AlmacenEntityReport, AlmacenEntityNode, AlmacenEntityNodeWithNamingConvention } from 'src/app/util/reports/almacen-entity-report';
import { ChannelEnum, ChannelOps } from 'src/app/iomap/models/channel';
import { EntityEnum, EntityOps } from 'src/app/iomap/models/entity';
import { ParserOps } from '../models/parser';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';

export type ParseCallback = (nodes: AlmacenEntityNodeWithNamingConvention[], companyIdentifier: string) => boolean;
export type ParseCompleteCallback = () => void;

@Injectable({
  providedIn: 'root'
})
export class EntityNameGroupingService {

  entityReport: AlmacenEntityReport;
  channelGroupedEntities: Record<ChannelEnum, Record<EntityEnum, AlmacenEntityNode[]>>;

  constructor(
    private tagParserService: TagParserService,
    private alertService: UserAlertService,
  ) { }

  async loadEntityReport(url: string) {
    this.entityReport = new AlmacenEntityReport({});
    await this.entityReport.addCSVFromURL(url);
    this.channelGroupedEntities = this.entityReport.gridNodesByChannelAndEntityLevel();
    console.log('namesByChannel', this.channelGroupedEntities);
  }

  async parseNames(companyIdentifier: string, callback: ParseCallback, completion: ParseCompleteCallback) {
    for await (let channel of Object.keys(this.channelGroupedEntities)) {
      let isCancelled = await this.parseNamesForChannel(companyIdentifier, channel as ChannelEnum, callback);
      if (isCancelled) { return true; }
    }
    completion();
  }

  async parseNamesForChannel(companyIdentifier: string, channel: ChannelEnum, callback: ParseCallback) {
    const channelEntityNodes = this.channelGroupedEntities[channel];
    if (!channelEntityNodes) { return; }
    for await (let entityLevel of Object.keys(channelEntityNodes)) {
      let isCancelled = await this.parseNamesForEntityLevel(companyIdentifier, channel, entityLevel as EntityEnum, callback);
      if (isCancelled) return isCancelled;
    }
  }

  async parseNamesForEntityLevel(companyIdentifier: string, channel: ChannelEnum, entityLevel: EntityEnum, callback: ParseCallback) {
    const channelNodes = this.channelGroupedEntities[channel];
    if (!channelNodes) { return; }
    const entityLevelNodes = channelNodes[entityLevel];
    if (!entityLevelNodes) { return; }
    const names = entityLevelNodes.map(entity => entity.name);
    const identifierParserName = ParserOps.makeIdentifierParserName({ channel: channel as ChannelEnum, entityLevel: entityLevel as EntityEnum });

    let isCancelled = false;
    const addEntities = (nodes: AlmacenEntityNode[], nameTags?: Record<string,{ parser_identifier: string }>) => {
      const nodesWithNamingConvention: AlmacenEntityNodeWithNamingConvention[] = entityLevelNodes.map(node => ({
        ...node,
        parserName: nameTags ? nameTags[node.name].parser_identifier : '',
      }));
      isCancelled = callback(nodesWithNamingConvention, companyIdentifier);
    }

    try {
      const parseResponse = await this.tagParserService.parseNames(identifierParserName, names);
      addEntities(entityLevelNodes, parseResponse.name_tags);
    } catch (e) {
      addEntities(entityLevelNodes, undefined);
      if (e.status === 404) { return; }
      console.error(e);
      this.alertService.postAlert({
        alertType: UserAlertType.error,
        header: e.statusText,
        body: `There was a problem parsing ${EntityOps.entityOptions[entityLevel as EntityEnum].pluralDisplayName} for ${ChannelOps.channelOptions[channel as ChannelEnum].displayName}`,
      })
    }
    return isCancelled;
  }



}
