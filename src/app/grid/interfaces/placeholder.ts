import { ChannelEnum } from "../../iomap/models/channel";
import { IOEntityReport } from "src/app/util/reports/io-entity-report";
import { IOEntityColumnEnum, IOReportColumnEnum } from "src/app/util/reports/io-report";

export interface Placeholder<T> {
  isPlaceholder: true;
  channel: ChannelEnum;
  account: string;
  campaignID: string;
  adgroupID: string;
  orgID: string;
  metadata: {
    accountName: string;
    campaignName: string;
    adGroupName: string;
  };
}

export class PlaceholderOps {

  static isPlaceholder<T>(obj: Placeholder<T>|T): obj is Placeholder<T> {
    return obj && 'isPlaceholder' in obj && obj.isPlaceholder;
  }

  static placeholdersFromReport<T>(report: IOEntityReport) {
    const entities = report.getEntities();
    const placeholders = entities.map(entity => {
      return {
        _id: [
            report.entityTree[entity.accountPath].accountName,
            entity[IOEntityColumnEnum.Channel],
            entity[IOReportColumnEnum.AccountID],
            entity[IOReportColumnEnum.CampaignID],
            entity[IOReportColumnEnum.AdgroupID]
          ].filter(Boolean).join('/'),
        isPlaceholder: true,
        channel: entity[IOEntityColumnEnum.Channel],
        account: entity[IOEntityColumnEnum.AccountPath],
        orgID: entity[IOReportColumnEnum.AccountID],
        campaignID: entity[IOReportColumnEnum.CampaignID],
        adgroupID: entity[IOReportColumnEnum.AdgroupID] || undefined,
        metadata: {
          accountName: entity[IOEntityColumnEnum.InternalAccountName],
          campaignName: entity[IOReportColumnEnum.CampaignName],
          adGroupName: entity[IOReportColumnEnum.AdgroupName] || '',
        },
      } as Placeholder<T>;
    });
    return placeholders;
  }
}