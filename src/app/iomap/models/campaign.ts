import { EntityEnum } from "./entity";
import { IOReportColumnEnum, IOEntityColumnEnum } from "src/app/util/reports/io-report";

export interface Campaign {
  type: EntityEnum.Campaign;
  [IOEntityColumnEnum.AccountPath]: string;
  [IOEntityColumnEnum.Channel]: string;
  [IOReportColumnEnum.AccountID]: string;
  [IOReportColumnEnum.AccountName]: string;
  [IOReportColumnEnum.CampaignID]: string;
  [IOReportColumnEnum.CampaignName]: string;
}

export function isCampaign(obj: any) {
  return obj && obj[IOReportColumnEnum.CampaignID] && !obj[IOReportColumnEnum.AdgroupID];
}