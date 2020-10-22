import { Injectable } from '@angular/core';
import { APIService, APIResponse } from './api.service';
import { TemplateBigNumber } from 'src/app/dashboard/services/big-number.service';
import { TemplateBreakdownTable } from 'src/app/dashboard/services/breakdown-table.service';
import { UnionQueryParameters } from 'src/app/dashboard/interfaces/query';
import { computeHashForObject } from 'src/app/util/hash.util';

export interface EmbedsResponse extends APIResponse {
  embeds: Embeds;
}

export interface Embeds {
  mode?: {[x: string]: ModeEmbed };
  periscope?: {[x: string]: PeriscopeEmbed };
  xyla?: {[x: string]: XylaEmbed };
  datadragon?: {[x: string]: DataDragonEmbed };
}

export interface DataDragonEmbed {
  companyIdentifier: string;
  apiOnly?: boolean;
  signedURL?: string;
  message?: string;
}

export interface ModeEmbed {
  path?: string;
  url: string;
  signedURL?: string;
}

export interface PeriscopeEmbed {
  path?: string;
  dashboardID: number;
  params: {[x: string]: any};
  signedURL?: string;
}

export interface XylaEmbed {
  path?: string;
  queryPath: string;
  queryParameters?: UnionQueryParameters;
  signedURL?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmbedsService {

  private embedsURL = `${APIService.baseURL}/embeds`;

  static isXylaEmbed(obj: any): obj is XylaEmbed {
    return typeof obj.queryPath === 'string';
  }

  static get emptyEmbeds(): Embeds {
    return {
      xyla: {},
      mode: {},
      periscope: {},
    };
  }

  static isEmptyEmbeds(embeds: Embeds): boolean {
    return Object.keys(embeds).every(namespace => {
      return !Object.keys(embeds[namespace]).length;
    });
  }

  constructor(
    private apiService: APIService,
  ) {}

  signEmbeds(embeds: Embeds): Promise<Embeds> {
    if (EmbedsService.isEmptyEmbeds(embeds)) {
      return Promise.resolve(embeds);
    }
    return this.apiService.client
      .post(`${this.embedsURL}/sign`, embeds)
      .toPromise()
      .then(response => (response as EmbedsResponse).embeds);
  }

  signEmbed(xylaEmbed: XylaEmbed): Promise<XylaEmbed> {
    const embeds: Embeds = EmbedsService.emptyEmbeds;
    embeds.xyla[xylaEmbed.path] = xylaEmbed;
    return this.signEmbeds(embeds).then(signedEmbeds => {
      return signedEmbeds.xyla[xylaEmbed.path];
    });
  }

  makeHashedXylaEmbed(
    reportPath: string,
    queryPath: string,
    queryParameters: UnionQueryParameters = {},
  ): XylaEmbed {
    const embed: XylaEmbed = {
      queryPath,
      queryParameters,
      path: `${reportPath}_embeds_xyla`,
    };
    const embedHash = computeHashForObject(embed);
    // re-set the path with the hash included
    embed.path = `${reportPath}_embeds_xyla_${embedHash}`;
    return embed;
  }
}
