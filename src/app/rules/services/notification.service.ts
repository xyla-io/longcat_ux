import { Injectable } from '@angular/core';
import { DragonAPIService } from './dragon-api.service';
import { APIResponse } from 'src/app/services/api/api.service';

export interface NotificationCount {
  ruleID: string;
  counts: {
    action: number;
    edited: number;
    execute: number;
    failed: number;
    error: number;
  };
}

interface NotificationCountAPIResponse extends APIResponse {
  ruleCounts: NotificationCount[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  static trailingActivityDays = 5;

  private _cachedNotificationCounts: Record<string, NotificationCount> = undefined;
  private notificationsURL = `${DragonAPIService.baseURL}/notifications`;

  constructor(
    private api: DragonAPIService,
  ) { }

  notificationsForRule(ruleID: string) {
    return this._cachedNotificationCounts[ruleID];
  }

  getNofificationCounts(startDate: Date, { invalidateCache }: {invalidateCache?: boolean}={}): Promise<Record<string, NotificationCount>> {
    if (!invalidateCache && this._cachedNotificationCounts) {
      return Promise.resolve(this._cachedNotificationCounts);
    }
    const url = `${this.notificationsURL}/count`;
    return this.api.client.post(url, { startDate }).toPromise()
      .then(response => {
        const { ruleCounts } = response as NotificationCountAPIResponse;
        this._cachedNotificationCounts = ruleCounts.reduce((record, ruleCount) => {
          record[ruleCount.ruleID] = ruleCount;
          return record;
        }, {})
        return this._cachedNotificationCounts;
      });
  }
}
