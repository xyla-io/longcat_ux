import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  ElementRef,
  QueryList,
  Directive,
  Input,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ChannelIconService } from 'src/app/services/assets/channel-icon.service';
import { ChannelInfoService } from 'src/app/services/info/channel-info.service';
import {
  DataFeedsService,
  DataFeedsResponse,
  DataFeedTable,
  CoreFeeds,
} from 'src/app/services/api/data-feeds.service';
import { URLProvider } from 'src/app/interfaces/url-provider.interface';
import { DataFeedsAlertService } from 'src/app/services/alerts/data-feeds-alert.service';
import { UploadOption, FileInputEvent } from 'src/app/shared/components/file-upload/file-upload.component'
import { UTCScheduleEntry, DateUtil } from 'src/app/util/date.util';

export interface CoreChannelView {
  displayName: string;
  description: string;
  icon: string;
  displayUpdateTime: string;
}

@Component({
  selector: 'app-data-feeds-inbound',
  templateUrl: './data-feeds-inbound.component.html',
  styleUrls: ['./data-feeds-inbound.component.scss']
})
export class DataFeedsInboundComponent implements OnInit, OnDestroy, URLProvider {
  @Input() companyIdentifier: string;
  @ViewChildren('appendFileInput') appendFileInputs: QueryList<ElementRef>;
  @ViewChildren('replaceFileInput') replaceFileInputs: QueryList<ElementRef>;
  dataFeedsSubscription: Subscription;
  dataFeedTables: DataFeedTable[] = [];
  coreChannels: CoreChannelView[] = [];
  static defaultFetchTimesDisplay = 'Core data fetch is not currently scheduled';
  fetchTimesDisplay: string = DataFeedsInboundComponent.defaultFetchTimesDisplay;
  isLoading: boolean = true;

  uploadWaitingSet: Set<number> = new Set();

  constructor(
    private channelIconService: ChannelIconService,
    private dataFeedsService: DataFeedsService,
    private dataFeedsAlertService: DataFeedsAlertService,
  ) { }

  ngOnInit() {
    this.dataFeedsSubscription = this.dataFeedsService.dataFeedsObservable.subscribe(observableResult => {
      if (!observableResult.result) {
        this.dataFeedTables = [];
        this.coreChannels = [];
        return;
      }
      let dataFeedsResponse = observableResult.result as DataFeedsResponse;
      this.dataFeedTables = dataFeedsResponse.tables;
      if (dataFeedsResponse.core) {
        this.coreChannels = this.channelsFromCoreFeeds(dataFeedsResponse.core);
        if (dataFeedsResponse.core.schedule) {
          this.fetchTimesDisplay = DataFeedsInboundComponent.convertFetchTimes(dataFeedsResponse.core.schedule);
        }
      } 

      this.isLoading = false;
    });
    this.dataFeedsService.refreshDataFeeds();
  }

  ngOnDestroy() {
    this.dataFeedsSubscription.unsubscribe();
  }

  hasNothingToShow() {
    return !this.dataFeedTables.length && !this.coreChannels.length;
  }

  static convertFetchTimes(fetchTimes: UTCScheduleEntry[]): string {
    if (!fetchTimes || !fetchTimes.length) {
      return this.defaultFetchTimesDisplay;
    }
    return [
      'Core data fetch happens daily at',
      fetchTimes
        .map(DateUtil.convertUTCScheduleEntryToFormattedLocal)
        .sort(DateUtil.dailyTimesSorter)
        .join(', '),
      DateUtil.userTimezone(),
    ].join(' ');
  }

  channelsFromCoreFeeds(coreFeeds: CoreFeeds): CoreChannelView[] {
    if (!coreFeeds) { return []; }
    let [config] = Object.keys(coreFeeds.config).map(key => {
      return coreFeeds.config[key];
    });
    let taskTargets = new Set();
    let rawFetchTaskSets = Object.keys(config.task_sets)
      .map(key => config.task_sets[key])
      .filter(taskSet => taskSet.action === 'fetch')
      .filter(taskSet => {
        if (taskTargets.has(taskSet.target)) { return false; }
        taskTargets.add(taskSet.target);
        return true;
      });

    let channels = rawFetchTaskSets.map(taskSet => {
      return {
        displayName: ChannelInfoService.channelNameForSlug(taskSet.target),
        description: ChannelInfoService.channelDescriptionForSlug(taskSet.target),
        icon: ChannelInfoService.channelIconForSlug(taskSet.target),
        displayUpdateTime: coreFeeds.displayLastRunComplete,
      };
    });
    return channels;
  }

  handleFileInputEvent(fileInputEvent: FileInputEvent, dataLot: DataFeedTable, i: number) {
    switch (fileInputEvent.actionKey) {
      case 'append':
        this.mergeTableData(dataLot, fileInputEvent.data, i);
        break;
      case 'replace':
        this.replaceTableData(dataLot, fileInputEvent.data, i);
        break;
    }
  }

  mergeTableData(dataLot: DataFeedTable, fileData: Blob, i: number) {
    this.uploadWaitingSet.add(i);
    this.dataFeedsService.mergeTableData(
      this.companyIdentifier,
      dataLot,
      fileData
    ).then(response => {
      this.dataFeedsAlertService.postMergeUploadSuccessAlert(dataLot.displayName);
      this.uploadWaitingSet.delete(i);
    }).catch(error => {
      this.dataFeedsAlertService.postUploadFailureAlert(dataLot.displayName);
      this.uploadWaitingSet.delete(i);
    });
  }

  replaceTableData(dataLot: DataFeedTable, fileData: Blob, i: number) {
    this.uploadWaitingSet.add(i);
    this.dataFeedsService.replaceTableData(
      this.companyIdentifier,
      dataLot,
      fileData
    ).then(response => {
      this.dataFeedsAlertService.postReplaceUploadSuccessAlert(dataLot.displayName);
      this.uploadWaitingSet.delete(i);
    }).catch(error => {
      this.dataFeedsAlertService.postUploadFailureAlert(dataLot.displayName);
      this.uploadWaitingSet.delete(i);
    });
  }

  /**
   * @implements URLProvider.getURL()
   */
  async getURL(key: string): Promise<string|null> {
    let resource  = this.dataFeedTables.find(table => table.path === key);
    if (!resource) { return null; }
    return this.dataFeedsService
    .getDataFeedTableData(
      this.companyIdentifier,
      resource.tableName
    ).then(response => response.signedURL);
  }

  /**
   * @implements URLProvider.getResourceName()
   */
  getResourceName(key: string): string {
    let resource = this.dataFeedTables.find(table => table.path === key);
    return resource ? resource.displayName.toLowerCase().split(' ').join('_') : 'export';
  }

  /**
   * @implements URLProvider.getDisplayName()
   */
  getDisplayName(key: string): string {
    let resource = this.dataFeedTables.find(table => table.path === key);
    return resource ? resource.displayName : 'Data Export';
  }
}
