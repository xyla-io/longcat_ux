import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { FilterDataProvider, PresetFilter } from 'src/app/interfaces/filter-data-provider.interface';
import { SelectionState, ColumnTemplate, TableRow } from 'src/app/interfaces/table.interface';
import { APIQueryResult } from 'src/app/services/api/api.service';
import { TaggingEntity } from 'src/app/services/api/tagging.service';

export interface RawAdData {
  channel: string;
  ad_id: string;
  adset_id: string;
  campaign_id: string;
  company_display_name: string;
  app_display_name: string;
  campaign_name: string;
  adset_name: string;
  ad_name: string;
  ad_type: string;
  first_impression_date: string;
  campaign_objective: string;
  last_creative_thumbnail_url: string;
  campaign_tag: string;
  campaign_subtag: string;
  adset_tag: string;
  adset_subtag: string;
  ad_tag: string;
  ad_subtag: string;
}

@Component({
  selector: 'app-list-ads',
  templateUrl: './list-ads.component.html',
  styleUrls: ['./list-ads.component.css']
})
export class ListAdsComponent implements OnInit, OnDestroy, FilterDataProvider {
  @Input('entityObservable') entityObservable: Observable<APIQueryResult>;
  @Input('entity') entity: TaggingEntity;

  entitySubscription: Subscription;
  entities: APIQueryResult;
  isLoadingEntities: boolean = true;

  columnTemplates: ColumnTemplate[] = [
    {
      name: 'thumbnail',
      header: '',
      data_columns: [ 'last_creative_thumbnail_url' ],
      sort_column: 'last_creative_thumbnail_url',
      view: {
        type: 'icon',
        converter: (value) => { return 'assets/xyla_favicon.png' },
        width: 'one',
      }
    },
    {
      name: 'channel',
      header: 'Channel',
      data_columns: [ 'channel' ],
      sort_column: 'channel',
      view: {
        type: 'icon',
        converter: ListAdsComponent.getChannelIconPath,
        width: 'one',
      }
    },
    {
      name: 'app',
      header: 'App',
      data_columns: [ 'app_display_name' ],
      sort_column: 'app_display_name',
      view: {
        type: 'text',
        width: 'two',
      }
    },
    {
      name: 'creative',
      header: 'Creative',
      data_columns: [ 'ad_name', 'ad_id' ],
      sort_column: 'ad_name',
      view: {
        type: 'subscript',
        width: 'four',
      }
    },
    {
      name: 'tag',
      header: 'Tag',
      data_columns: [ 'ad_tag' ],
      sort_column: 'ad_tag',
      view: {
        type: 'tag',
        width: 'two',
      },
    },
    {
      name: 'subtag',
      header: 'Subtag',
      data_columns: [ 'ad_subtag' ],
      sort_column: 'ad_subtag',
      view: {
        type: 'tag',
        width: 'two',
      },
    }
  ];

  // TODO refactor into service
  static getChannelIconPath(channel: string): string {
    switch (channel.toLowerCase()) {
      case 'apple': return 'assets/channel-apple.png';
      case 'google': return 'assets/channel-google.png';
      case 'facebook': return 'assets/channel-facebook.png';
      case 'snapchat': return 'assets/channel-snapchat.png';
      default: return 'assets/channel-other.png';
    }
  }

  constructor() { }

  ngOnInit() {
    this.entitySubscription = this.entityObservable.subscribe(entities => {
      this.isLoadingEntities = false;
      if (entities) {
        this.entities = entities;
      } else {
        // TODO no rows!
      }
    });
  }

  ngOnDestroy() {
    if (this.entitySubscription) {
      this.entitySubscription.unsubscribe();
    }
  }

  // Interface: FilterDataProvider
  get presetFilterMap(): {[x: string]: PresetFilter} {
    return {
      untagged: {
        key: 'untagged',
        displayName: 'Untagged Creatives',
        apply: (rows: TableRow[]): TableRow[] => {
          return rows.filter(row => row.values['campaign_tag'] === null);
        },
      },
      all: {
        key: 'all',
        displayName: 'All Creatives',
        apply: (rows: TableRow[]): TableRow[] => {
          return rows;
        },
      },
      selected: {
        key: 'selected',
        displayName: 'Selected Creatives',
        apply: (rows: TableRow[]): TableRow[] => {
          return rows.filter(row => row.isSelected);
        },
      },
    };
  }

  
  get orderedFilterKeys(): string[] {
    return [
      this.presetFilterMap.untagged.key,
      this.presetFilterMap.all.key,
      this.presetFilterMap.selected.key,
    ]
  };

  get defaultFilterKey(): string {
    return this.presetFilterMap.untagged.key;
  }
}
