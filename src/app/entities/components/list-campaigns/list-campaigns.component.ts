import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  EventEmitter,
} from '@angular/core';
import { Observable, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FilterDataProvider, PresetFilter } from 'src/app/interfaces/filter-data-provider.interface';
import { ColumnTemplate, TableRow } from 'src/app/interfaces/table.interface';
import { APIQueryResult } from 'src/app/services/api/api.service';
import { TaggingService, TaggingEntity } from 'src/app/services/api/tagging.service';
import { ChannelIconService } from 'src/app/services/assets/channel-icon.service';
import { ObservableResult } from 'src/app/util/request-loaders/api-loaders';

@Component({
  selector: 'app-list-campaigns',
  templateUrl: './list-campaigns.component.html',
  styleUrls: ['./list-campaigns.component.scss']
})
export class ListCampaignsComponent implements OnInit, OnDestroy, FilterDataProvider {
  @Input() entityObservable: Observable<ObservableResult<APIQueryResult>>;
  @Input() entity: TaggingEntity;

  destroyed = new Subject();
  entitySubscription: Subscription;
  entities: APIQueryResult;
  isLoadingEntities = true;
  changeFilterEventEmitter: EventEmitter<string> = new EventEmitter();
  _defaultFilterKey = 'all';

  columnTemplates: ColumnTemplate[] = [
    {
      name: 'channel',
      header: 'Channel',
      data_columns: [ 'channel' ],
      sort_column: 'channel',
      view: {
        type: 'icon',
        converter: ChannelIconService.iconForChannel,
        width: 'one',
      }
    },
    {
      name: 'app',
      header: 'App',
      data_columns: [ 'product_name' ],
      sort_column: 'product_name',
      view: {
        type: 'text',
        width: 'one',
      },
    },
    {
      name: 'platform',
      header: 'Platform',
      data_columns: [ 'product_platform' ],
      sort_column: 'product_platform',
      view: {
        type: 'text',
        width: 'one',
      },
    },
    {
      name: 'campaign',
      header: 'Campaign',
      data_columns: [ 'campaign_name', 'campaign_id' ],
      sort_column: 'campaign_name',
      view: {
        type: 'subscript',
        width: 'five',
      },
    },
    {
      name: 'lastActiveDate',
      header: 'Last Active',
      data_columns: [ 'last_active_date' ],
      sort_column: 'last_active_date',
      view: {
        type: 'text',
        width: 'one',
      }
    },
    {
      name: 'tag',
      header: 'Tag',
      data_columns: [ 'campaign_tag' ],
      sort_column: 'campaign_tag',
      view: {
        type: 'tag',
        width: 'two',
      },
    },
    {
      name: 'subtag',
      header: 'Subtag',
      data_columns: [ 'campaign_subtag' ],
      sort_column: 'campaign_subtag',
      view: {
        type: 'tag',
        width: 'two',
      },
    },
  ];


  constructor(
    private taggingService: TaggingService,
  ) {}

  ngOnInit() {
    this.entitySubscription = this.entityObservable
      .pipe(takeUntil(this.destroyed))
      .subscribe(observableResult => {
        if (observableResult.isRefreshing) {
          this.isLoadingEntities = true;
          this.entities = {
            row_count: 0,
            column_names: [],
            rows: [],
          };
          return;
        }
        const entities = observableResult.result as APIQueryResult;
        if (entities) {
          const tagColIndex = entities.column_names.indexOf('campaign_tag');
          const allTagged = entities.rows.every(row => {
            return !!row[tagColIndex];
          });
          if (allTagged) {
            this.setDefaultFilterKey(this.presetFilterMap.all.key);
          } else {
            this.setDefaultFilterKey(this.presetFilterMap.untagged.key);
          }

          this.isLoadingEntities = false;
          this.entities = entities;
        }
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  onTag(event) {
    if (!event.tag) { return; }
    const tagEntities = this.entitiesForRowIndices(event.rowIndices);
    this.taggingService.tagEntities(
      'campaign',
      tagEntities,
      event.tag,
    );
  }

  onSubtag(event) {
    if (!event.subtag) { return; }
    const tagEntities = this.entitiesForRowIndices(event.rowIndices);
    this.taggingService.subtagEntities(
      'campaign',
      tagEntities,
      event.subtag,
    );
  }

  onRemoveTag(event) {
    const untagEntities = this.entitiesForRowIndices(event.rowIndices);
    this.taggingService.untagEntities(
      'campaign',
      untagEntities,
    );
  }

  entitiesForRowIndices(rowIndices) {
    const tagEntities = rowIndices.map(rowIndex => {
      const row = this.entities.rows[rowIndex];
      return this.entities.column_names.reduce((obj, col, colIndex) => {
        obj[col] = row[colIndex];
        return obj;
      }, {});
    });
    return tagEntities;
  }

  private setDefaultFilterKey(key: string) {
    this._defaultFilterKey = key;
    this.changeFilterEventEmitter.emit(this._defaultFilterKey);
  }

  // Interface: FilterDataProvider
  get presetFilterMap(): {[x: string]: PresetFilter} {
    return {
      untagged: {
        key: 'untagged',
        displayName: 'Untagged',
        apply: (rows: TableRow[]): TableRow[] => {
          return rows.filter(row => !row.values['campaign_tag']);
        },
      },
      all: {
        key: 'all',
        displayName: 'All',
        apply: (rows: TableRow[]): TableRow[] => {
          return rows;
        },
      },
    };
  }

  get orderedFilterKeys(): string[] {
    return [
      this.presetFilterMap.untagged.key,
      this.presetFilterMap.all.key,
    ];
  }

  get defaultFilterKey(): string {
    return this._defaultFilterKey;
  }

}
