import { OptionConfig } from "../util/options";
import { IOReportColumnEnum } from "src/app/util/reports/io-report";
import { EntityEnum, EntityOps } from "./entity";

export enum ChannelEnum {
  Facebook = 'facebook',
  AppleSearchAds = 'apple_search_ads',
  GoogleAds = 'google_ads',
  Snapchat = 'snapchat',
  TikTok = 'tiktok',
}

export interface ChannelOptionConfig extends OptionConfig<any> {
  displayName: string;
  abbreviation: string;
  reporterClass: string;
  reportEntityColumns: IOReportColumnEnum[];
  taggableEntities: EntityEnum[];
  entityDisplayNames?: Partial<Record<EntityEnum, { displayName: string; pluralDisplayName: string; }>>;
  color: string;
  colorRGBA: [number, number, number, number];
}

export class ChannelOps {
  static channelOptions: Record<ChannelEnum, ChannelOptionConfig> = Object.freeze({
    [ChannelEnum.AppleSearchAds]: {
      displayName: 'Apple Search Ads',
      abbreviation: 'ASA',
      color: '#555555',
      // colorRGBA: [85, 85, 85, 1],
      colorRGBA: [0, 0, 0, 1],
      allowUnsafeMode: false,
      reporterClass: 'heathcliff/IOAppleSearchAdsReporter',
      reportEntityColumns: [
        IOReportColumnEnum.AccountID,
        IOReportColumnEnum.AccountName,
        IOReportColumnEnum.CampaignID,
        IOReportColumnEnum.CampaignName,
        IOReportColumnEnum.AdgroupID,
        IOReportColumnEnum.AdgroupName,
      ],
      taggableEntities: [
        EntityEnum.Campaign,
        EntityEnum.Adgroup,
        EntityEnum.Ad,
      ],
      entityDisplayNames: {
        [EntityEnum.Ad]: {
          displayName: 'Creative Set',
          pluralDisplayName: 'Creative Sets',
        }
      },
    },
    [ChannelEnum.GoogleAds]: {
      displayName: 'Google UAC',
      abbreviation: 'Google',
      color: '#4285f4',
      colorRGBA: [66, 133, 244, 1],
      allowUnsafeMode: { label: 'use UAC best practices' },
      reporterClass: 'hazel/IOGoogleAdsReporter',
      reportEntityColumns: [
        IOReportColumnEnum.AccountID,
        IOReportColumnEnum.AccountName,
        IOReportColumnEnum.CampaignID,
        IOReportColumnEnum.CampaignName,
      ],
      taggableEntities: [
        EntityEnum.Campaign,
        EntityEnum.Adgroup,
        EntityEnum.Asset,
      ],
    },
    [ChannelEnum.Snapchat]: {
      displayName: 'Snapchat',
      abbreviation: 'Snapchat',
      color: '#FFFC00',
      // colorRGBA: [255, 252, 0, 1],
      colorRGBA: [255, 213, 0, 1],
      allowUnsafeMode: false,
      reporterClass: 'azrael/IOSnapchatReporter',
      reportEntityColumns: [
        IOReportColumnEnum.AccountID,
        IOReportColumnEnum.AccountName,
        IOReportColumnEnum.CampaignID,
        IOReportColumnEnum.CampaignName,
      ],
      taggableEntities: [
        EntityEnum.Campaign,
        EntityEnum.Adgroup,
        EntityEnum.Ad,
      ],
      entityDisplayNames: {
        [EntityEnum.Adgroup]: {
          displayName: 'Ad Squad',
          pluralDisplayName: 'Ad Squads',
        },
      }
    },
    [ChannelEnum.Facebook]: {
      displayName: 'Facebook',
      abbreviation: 'Facebook',
      color: '#3b5998',
      // colorRGBA: [59, 89, 152, 1],
      // colorRGBA: [125, 6, 249, 1],
      // colorRGBA: [ 86, 3, 173, 1 ],
      colorRGBA: [ 135, 54, 205, 1 ],
      allowUnsafeMode: false,
      reporterClass: '',
      reportEntityColumns: [],
      taggableEntities: [
        EntityEnum.Campaign,
        EntityEnum.Adgroup,
        EntityEnum.Ad,
      ],
    },
    [ChannelEnum.TikTok]: {
      displayName: 'TikTok',
      abbreviation: 'TikTok',
      color: 'linear-gradient(to right, rgb(105, 201, 208), black, rgb(238, 16, 82))',
      // colorRGBA: [0, 0, 0, 1],
      // colorRGBA: [22, 240, 238, 1],
      colorRGBA: [255, 4, 79, 1],
      allowUnsafeMode: false,
      reporterClass: '',
      reportEntityColumns: [],
      taggableEntities: [
        EntityEnum.Campaign,
        EntityEnum.Adgroup,
        EntityEnum.Ad,
      ],
    },
  });

  static getEntityColumns(channels: ChannelEnum[]) {
      return channels.reduce((columns, channel) => {
        columns.push(
          ...ChannelOps.channelOptions[channel].reportEntityColumns
            .map(column => `${ChannelOps.channelOptions[channel].reporterClass}/${column}`)
        );
        return columns;
      }, []);
  }

  static getEntityDisplayName({
    channel,
    entity,
    plural=false,
  }: {
    channel?: ChannelEnum,
    entity: EntityEnum,
    plural?: boolean,
  }): string {
    if (channel) {
      const channelSpecificNames = ChannelOps.channelOptions[channel].entityDisplayNames;
      if (channelSpecificNames && channelSpecificNames[entity]) {
        return plural ? channelSpecificNames[entity].pluralDisplayName : channelSpecificNames[entity].displayName;
      }
    }
    return plural ? EntityOps.entityOptions[entity].pluralDisplayName : EntityOps.entityOptions[entity].displayName;
  }
}
