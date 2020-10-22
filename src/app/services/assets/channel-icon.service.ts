import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChannelIconService {
  static channelIconsMap = {
    'apple': 'channel-apple',
    'apple_search_ads': 'channel-apple',
    'facebook': 'channel-facebook',
    'google': 'channel-google',
    'google_ads': 'channel-google',
    'snapchat': 'channel-snapchat',
    'tiktok': 'channel-tiktok',
    'appsflyer': 'mmp-appsflyer',
    'adjust': 'mmp-adjust'
  };

  constructor() { }

  static iconForChannel(channel: string) {
    let lowerChannel = channel.toLowerCase();
    let iconName = ChannelIconService.channelIconsMap[lowerChannel]
    if (iconName === undefined) { return undefined; }
    return `assets/${iconName}.png`
  }
}
