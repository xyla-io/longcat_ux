import { Injectable } from '@angular/core';
import { WindowRef } from 'src/app/services/app/window.service';
import { User } from 'src/app/services/api/user.service';


export enum TrackingEvents {
  // Basic
  Signup = 'signup',
  Signin = 'signin',

  // Tagging
  TagsMetadataPageLoaded = 'tags_metadata_page_loaded',
  TagParsersPageLoaded = 'tags_parsers_page_loaded',
  TagParsersParserCreated = 'tags_parsers_parser_created',
  TagParsersManuallyDefined = 'tags_parsers_manually_defined',
  TagParsersSampleEntered = 'tags_parsers_sample_entered',

  // Reporting
  ReportLoaded = 'report_loaded',
}

interface MixPanel {
  identify(userId: string): void,
  track(event: string, info?: object): void,
  people: {
    set(info: object): void,
    unset(): void,
    set_once(info: object): void,
    increment(key: string, increase: number): void,
    increment(items: object): void,
  }
}

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  sessionIdentified: boolean = false;
  mixpanel: MixPanel;

  constructor(
    private window: WindowRef
  ) {
    if ((this.window.nativeWindow as any).mixpanel) {
      this.mixpanel = ((this.window.nativeWindow as any).mixpanel as MixPanel);
    }
  }

  identify(user: User) {
    if (!this.mixpanel) { return; }
    if (this.sessionIdentified) { return; }
    this.sessionIdentified = true;
    this.mixpanel.identify(user._id);
    const userInfo = {
      email: user.email,
      name: user.name,
      roles: user.roles,
      companies: user.companies.map(company => company.identifier),
      groups: user.groups.map(group => group.path),
    }
    this.mixpanel.people.set(userInfo);
  }
  track(event: string, info?: object): void {
    if (!this.mixpanel) { return; }
    this.mixpanel.track(event, info);
  }
}
