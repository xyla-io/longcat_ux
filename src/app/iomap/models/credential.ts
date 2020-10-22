import { ChannelEnum } from "./channel";

export interface Credential {
  path?: string;
  user?: string;
  target: ChannelEnum;
  name: string;
  modificationDate?: Date;
  creationDate?: Date;
  credential?: object;
}

export interface GoogleAdsCredentialContent {
  developer_token?: string;
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  login_customer_id?: string;
  customer_id?: string;
}

export interface SnapchatCredentialContent {
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  ad_account_id?: string;
}

export interface GoogleAdsCredential extends Credential {
  credential?: GoogleAdsCredentialContent; 
}

export interface SnapchatCredential extends Credential {
  credential?: SnapchatCredentialContent; 
}

export class EditGoogleAdsCredential {
  path?: string;
  user?: string;
  target: ChannelEnum;
  name: string;
  modificationDate?: Date;
  creationDate?: Date;
  credential?: GoogleAdsCredentialContent;

  constructor(data?: GoogleAdsCredential) {
    this.target = ChannelEnum.GoogleAds;
    this.name = '';
    this.credential = {};
  }
}

export class EditSnapchatCredential {
  path?: string;
  user?: string;
  target: ChannelEnum;
  name: string;
  modificationDate?: Date;
  creationDate?: Date;
  credential?: SnapchatCredentialContent;

  constructor(data?: SnapchatCredential) {
    this.target = ChannelEnum.Snapchat;
    this.name = '';
    this.credential = {};
  }
}

export interface ChannelReportParameters {
  credentialPath: string;
  timeGranularity: string;
  entityGranularity: string;
  start: Date;
  end: Date;
}