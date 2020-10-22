import { Injectable } from '@angular/core';
import { Campaign } from 'src/app/iomap/models/campaign';
import { DragonAPIService } from './dragon-api.service';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

interface CampaignsAPIResponse {
  campaigns: Campaign[];
}

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  cachedCampaignsByAccount: Record<string, Campaign[]> = {};
  private campaignsURL = `${DragonAPIService.baseURL}/campaigns`;

  constructor(private api: DragonAPIService) {}

  getCampaigns(account: string, { invalidateCache }: {invalidateCache?: boolean}={}): Observable<Campaign[]> {
    if (!invalidateCache && this.cachedCampaignsByAccount[account]) {
      return of(this.cachedCampaignsByAccount[account]);
    }
    const url = `${this.campaignsURL}/${encodeURIComponent(account)}`;
    return this.api.client.get(url)
      .pipe(map(response => (response as CampaignsAPIResponse).campaigns))
      .pipe(tap(campaigns => this.cachedCampaignsByAccount[account] = campaigns));
  }
}