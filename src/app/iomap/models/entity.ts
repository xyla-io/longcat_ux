import { OptionConfig } from "src/app/iomap/util/options";

export enum EntityEnum {
  Campaign = 'campaign',
  Adgroup = 'adgroup',
  Ad = 'ad',
  Asset = 'asset',
}

export interface EntityOptionConfig extends OptionConfig<any> {
  defaultTaggingKeyspace: (prefixLetter: string) => string;
  pluralDisplayName: string;
  comparator: (entityLevel: EntityEnum) => number;
}

export class EntityOps {

  static entityOptions: Record<EntityEnum,  EntityOptionConfig> = Object.freeze({
    [EntityEnum.Campaign]: {
      displayName: 'Campaign',
      pluralDisplayName: 'Campaigns',
      defaultTaggingKeyspace: (prefixLetter: string) => {
        return `${prefixLetter}c`;
      },
      comparator: (entityLevel: EntityEnum) => {
        if (entityLevel === EntityEnum.Campaign) { return 0; }
        return 1;
      },
    },
    [EntityEnum.Adgroup]: {
      displayName: 'Ad Group',
      pluralDisplayName: 'Ad Groups',
      defaultTaggingKeyspace: (prefixLetter: string) => {
        return `${prefixLetter}g`;
      },
      comparator: (entityLevel: EntityEnum) => {
        if (entityLevel === EntityEnum.Campaign) { return -1; }
        if (entityLevel === EntityEnum.Adgroup) { return 0; }
        return 1;
      },
    },
    [EntityEnum.Ad]: {
      displayName: 'Ad',
      pluralDisplayName: 'Ads',
      defaultTaggingKeyspace: (prefixLetter: string) => {
        return `${prefixLetter}a`;
      },
      comparator: (entityLevel: EntityEnum) => {
        if ([EntityEnum.Campaign, EntityEnum.Adgroup].includes(entityLevel)) { return -1; }
        if (entityLevel === EntityEnum.Ad) { return 0; }
        return 1;
      },
    },
    [EntityEnum.Asset]: {
      displayName: 'Asset',
      pluralDisplayName: 'Assets',
      defaultTaggingKeyspace: (prefixLetter: string) => {
        return `${prefixLetter}a`;
      },
      comparator: (entityLevel: EntityEnum) => {
        if ([EntityEnum.Campaign, EntityEnum.Adgroup, EntityEnum.Ad].includes(entityLevel)) { return -1; }
        if (entityLevel === EntityEnum.Asset) { return 0; }
        return 1;
      },
    },

  })

  static compareEntityLevel(a: EntityEnum, b: EntityEnum) {
    return EntityOps.entityOptions[a].comparator(b) * -1;
  }

}