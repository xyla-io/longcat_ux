import { Injectable } from '@angular/core';
import { DragonAPIService } from './dragon-api.service';
import { RuleHistory } from '../models/rule-history';
import { APIResponse } from 'src/app/services/api/api.service';

export interface RuleHistoryAPIResponse extends APIResponse {
  history: RuleHistory[];
}

@Injectable({
  providedIn: 'root'
})
export class RuleHistoryService {

  cachedRuleHistory: Record<string, RuleHistory[]> = {};
  private rulesHistoryURL = `${DragonAPIService.baseURL}/rules/history`;

  constructor(
    private api: DragonAPIService,
  ) {}

  getHistory(ruleID: string, { invalidateCache }: {invalidateCache?: boolean}={}): Promise<RuleHistory[]> {
    if (!invalidateCache && this.cachedRuleHistory[ruleID]) {
      return Promise.resolve(this.cachedRuleHistory[ruleID]);
    }
    const url = `${this.rulesHistoryURL}/${ruleID}`;
    return this.api.client.get(url).toPromise()
      .then(response => {
        const { history } = response as RuleHistoryAPIResponse;
        this.cachedRuleHistory[ruleID] = history;
        return history;
      });
  }
}
