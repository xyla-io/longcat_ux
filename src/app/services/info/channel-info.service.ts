import { Injectable } from '@angular/core';

import { ChannelIconService } from 'src/app/services/assets/channel-icon.service'

@Injectable({
  providedIn: 'root'
})
export class ChannelInfoService {

  constructor() { }

  static channelNameForSlug(slug): string {
    return {
      appsflyer: 'AppsFlyer',
      appsflyer_data_locker: 'AppsFlyer Data Locker',
      adjust: 'Adjust',
      apple_search_ads: 'Apple Search Ads',
      facebook: 'Facebook',
      google_adwords: 'Google AdWords',
      google_ads: 'Google Ads',
      snapchat: 'Snapchat',
      tiktok: 'TikTok',
    }[slug] || slug;
  }

  static channelDescriptionForSlug(slug): string {
    return {
      appsflyer: '',
      appsflyer_data_locker: '',
      adjust: '',
      apple_search_ads: '',
      facebook: '',
      google_adwords: '',
      google_ads: '',
      snapchat: '',
      tiktok: '',
    }[slug] || '';
  }

  static channelIconForSlug(slug): string {
    return ChannelIconService.iconForChannel(
      ChannelInfoService.channelBrandForSlug(slug)
    );
  }

  static channelBrandForSlug(slug): string {
    return {
      appsflyer: 'appsflyer',
      appsflyer_data_locker: 'appsflyer',
      adjust: 'adjust',
      apple_search_ads: 'apple',
      facebook: 'facebook',
      google_adwords: 'google',
      google_ads: 'google',
      snapchat: 'snapchat',
      tiktok: 'tiktok',
    }[slug] || slug;
  }
}
