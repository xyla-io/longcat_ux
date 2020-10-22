import { Injectable } from '@angular/core';
import { DragonAPIService } from './dragon-api.service';
import { tap, map } from 'rxjs/operators';
import { Adgroup } from '../../iomap/models/adgroup';
import { Observable, of } from 'rxjs';

interface AdgroupsAPIResponse {
  adgroups: Adgroup[];
}

@Injectable({
  providedIn: 'root'
})
export class AdgroupService {

  cachedAccounts: Record<string, Record<string, Adgroup[]>> = {};
  private adgroupsURL = `${DragonAPIService.baseURL}/adgroups`;

  constructor(private api: DragonAPIService) {}

  getAdgroups(account: string, orgID: number|string, campaignID: number|string, { invalidateCache }: {
    invalidateCache?: boolean
  }={}): Observable<Adgroup[]> {
    const cachedCampaigns = this.cachedAccounts[orgID];
    if (!invalidateCache && cachedCampaigns) {
      if (cachedCampaigns[campaignID]) {
        return of(cachedCampaigns[campaignID]);
      }
    }

    const url = `${this.adgroupsURL}/${encodeURIComponent(account)}/${orgID}/${campaignID}`;
    return this.api.client.get(url)
      .pipe(map(response => (response as AdgroupsAPIResponse).adgroups))
      .pipe(tap(adgroups => {
        this.cachedAccounts[orgID] = this.cachedAccounts[orgID] || {};
        this.cachedAccounts[orgID][campaignID] = adgroups;
      }));
  }
}
