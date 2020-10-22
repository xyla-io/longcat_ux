import * as Papa from 'papaparse';
import { ChannelEnum } from '../../iomap/models/channel';
import { Report } from './report';

export enum IOReportColumnEnum {
  AccountID = 'account.id',
  AccountName = 'account.name',

  CampaignID = 'campaign.id',
  CampaignName = 'campaign.name',

  AdgroupID = 'adgroup.id',
  AdgroupName = 'adgroup.name',
}

export enum IOEntityColumnEnum {
  InternalAccountName = 'accountName',
  AccountPath = 'accountPath',
  Channel = 'channel',
}

export type IOAccountMapping = Record<string, {
  [IOEntityColumnEnum.AccountPath]: string,
  [IOEntityColumnEnum.Channel]: ChannelEnum,
  [IOEntityColumnEnum.InternalAccountName]: string
}>;

export class IOReport extends Report {
  static readonly channelColumnName = 'channel';
  rows: any[] = [];
  columnNames: string[];
  accountMapping: IOAccountMapping;

  addCSV(csv: string, accountMapping: IOAccountMapping) {
    this.accountMapping = accountMapping;
    super.addCSV(csv);
  }

  protected applyRows() {
    this.rows.push(...this.resultData.reduce((objRows, row) => {
      if (!this.accountMapping[row[0]]) { return objRows; }
      const asObj = this.columnNames.reduce((obj, columnName, i) => {
        obj[columnName] = row[i];
        return obj;
      }, { ...this.accountMapping[row[0]] });
      objRows.push(asObj);
      return objRows;
    }, []));
  }
}