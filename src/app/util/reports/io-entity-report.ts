import { IOReport, IOReportColumnEnum, IOAccountMapping, IOEntityColumnEnum } from "./io-report";
import { Campaign, isCampaign } from "src/app/iomap/models/campaign";
import { Adgroup, isAdgroup } from "src/app/iomap/models/adgroup";
import { EntityEnum } from "src/app/iomap/models/entity";
import { ChannelEnum } from "src/app/iomap/models/channel";

export interface EntityNode { 
  id: string;
  name: string;
  children: Record<string, EntityNode>;
}

export interface AccountEntityNode extends EntityNode {
  accountPath: string;
  accountName: string;
  channel: ChannelEnum;
}

type AccountPath = string;

export type EntityTree = Record<AccountPath, AccountEntityNode>;

export class IOEntityReport extends IOReport {
  entityTree: EntityTree;

  addCSV(csv: string, accountMapping: IOAccountMapping) {
    super.addCSV(csv, accountMapping);
    this.entityTree = this.rows.reduce((nodes, row) => {
      nodes[row.accountPath] = nodes[row.accountPath] || {
        id: row[IOReportColumnEnum.AccountID],
        name: row[IOReportColumnEnum.AccountName],
        accountPath: row.accountPath,
        accountName: row.accountName,
        channel: row.channel,
        children: {},
      };
      if (isCampaign(row)) {
        nodes[row.accountPath].children[row[IOReportColumnEnum.CampaignID]] = {
          id: row[IOReportColumnEnum.CampaignID],
          name: row[IOReportColumnEnum.CampaignName],
          children: {},
        };
      }
      if (isAdgroup(row)) {
        nodes[row.accountPath]
          .children[row[IOReportColumnEnum.CampaignID]]
          .children[row[IOReportColumnEnum.AdgroupID]] = {
            id: row[IOReportColumnEnum.AdgroupID],
            name: row[IOReportColumnEnum.AdgroupName],
            children: {},
          };
      }
      return nodes;
    }, {})
  }

  getEntities({
    includeCampaigns=true,
    includeAdgroups=true,
  }={}): (Campaign|Adgroup)[] {
    return this.rows.reduce((entities, row) => {
      if (row[IOReportColumnEnum.AdgroupID]) {
        if (includeAdgroups) {
          entities.push({ type: EntityEnum.Adgroup, ...row } as Adgroup);
        }
      } else if (row[IOReportColumnEnum.CampaignID]) {
        if (includeCampaigns) {
          entities.push({ type: EntityEnum.Campaign, ...row } as Campaign);
        }
      }
      return entities;
      // This will skip account rows (that only contain account.id value)
    }, []);
  }

  getEntity({
    accountPath,
    campaignID,
    adgroupID,
  }: {
    accountPath: string,
    campaignID?: string,
    adgroupID?: string,
  }): AccountEntityNode|EntityNode {
      const account = this.entityTree[accountPath];
      if (!account) { return undefined; }
      if (!campaignID) { return account; }
      const campaign = account.children[campaignID];
      if (!campaign) { return undefined; }
      if (!adgroupID) { return campaign; }
      const adgroup = campaign.children[adgroupID];
      return adgroup;
  }

}