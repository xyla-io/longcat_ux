import { EntityEnum } from "./entity";
import { IOEntityColumnEnum, IOReportColumnEnum } from "src/app/util/reports/io-report";

export interface Adgroup {
  type: EntityEnum.Adgroup
  [IOEntityColumnEnum.AccountPath]: string;
  [IOEntityColumnEnum.Channel]: string;
  [IOReportColumnEnum.AccountID]: string;
  [IOReportColumnEnum.AccountName]: string;
  [IOReportColumnEnum.CampaignID]: string;
  [IOReportColumnEnum.CampaignName]: string;
  [IOReportColumnEnum.AdgroupID]: string;
  [IOReportColumnEnum.AdgroupName]: string;
}

export function isAdgroup(obj: any) {
  return obj && obj[IOReportColumnEnum.AdgroupID];
}
