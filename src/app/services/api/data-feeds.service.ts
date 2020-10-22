import { Injectable } from '@angular/core';
import { Subject, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, share, catchError } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

import { SessionService } from './session.service';
import { APIService, APIResponse } from './api.service';
import { DateUtil } from 'src/app/util/date.util';
import { APILoaders, ObservableResult } from 'src/app/util/request-loaders/api-loaders';
import { UserAlertType, UserAlertService } from 'src/app/services/alerts/user-alert.service';
import { UTCScheduleEntry } from 'src/app/util/date.util';

export interface DataFeedsResponse extends APIResponse {
  tables: DataFeedTable[];
  core: CoreFeeds;
}

export interface DataFeedExportResponse extends APIResponse {
  signedURL: string;
}

export interface DataFeedUploadResponse extends APIResponse {
  feed: DataFeedTable;
}

export interface DataFeedTable {
  displayName: string;
  description: string;
  path: string;
  tableName: string;
  mergeColumns: string[];
  columnMappings: {};
  creationTime: string;
  modificationTime: string;
  displayCreationTime?: string;
  displayModificationTime?: string;
}

export interface CoreFeedsCompanyMetadata {
  currency: string;
  display_name: string;
}

export interface CoreFeedsProduct {
  display_name: string;
  platform_ids: {
    android?: string;
    ios?: string;
    web?: string;
  }
}

export interface CoreFeedsTaskSet {
  action: string;
  target: string;
  product_identifiers: string[];
  task_types: string[];
}

export interface CoreFeedsConfig {
  company_metada: CoreFeedsCompanyMetadata;
  products: {[x: string]: CoreFeedsProduct};
  task_sets: {[x: string]: CoreFeedsTaskSet};
}

export interface CoreFeeds {
  lastRunComplete: string;
  displayLastRunComplete: string;
  schedule: UTCScheduleEntry[];
  path: string;
  config: {[x: string]: CoreFeedsConfig};
}

@Injectable({
  providedIn: 'root'
})
export class DataFeedsService {

  private apiLoaders: APILoaders;
  private static dataFeedsLoaderKey = 'datafeeds';

  constructor(
    private api: APIService,
    private sessionService: SessionService,
    private userAlertService: UserAlertService,
  ) {
    this.apiLoaders = new APILoaders(sessionService);

    this.apiLoaders.createSharedObservable<DataFeedsResponse>({
      loaderKey: DataFeedsService.dataFeedsLoaderKey,
      callFunction: (companyIdentifer) => this.api.client.get(this.feedsURL(companyIdentifer)),
      responseHandler: (response) => {
        let dataFeedsResponse = response as DataFeedsResponse
        dataFeedsResponse.tables = dataFeedsResponse.tables.map(table => {
          table.displayCreationTime = DateUtil.formatDateAndTime(table.creationTime);
          table.displayModificationTime = DateUtil.formatDateAndTime(table.modificationTime);
          return table;
        });

        if (dataFeedsResponse.core && dataFeedsResponse.core.lastRunComplete) {
          dataFeedsResponse.core.displayLastRunComplete = DateUtil.formatDateAndTime(dataFeedsResponse.core.lastRunComplete);
        }

        return { result: dataFeedsResponse };
      },
      errorHandler: (error) => {
        this.userAlertService.postAlert({
          alertType: UserAlertType.error,
          header: 'Request Failed',
          body: 'There was a problem retrieving the list of data feeds',
          autoCloseSeconds: 8,
        });
        console.error(error);
      },
    });
  }

  refreshDataFeeds() {
    this.apiLoaders.refreshLoader(DataFeedsService.dataFeedsLoaderKey);
  }

  get dataFeedsObservable(): Observable<ObservableResult<APIResponse>> {
    return this.apiLoaders
      .getSharedObservable(DataFeedsService.dataFeedsLoaderKey);
  }

  getDataFeedTableData(companyIdentifier: string, tableName: string): Promise<DataFeedExportResponse> {
    return this.api.client.get(this.feedsURL(companyIdentifier) + `/tables/${tableName}/data`)
      .toPromise()
      .then(response => {
        return response as DataFeedExportResponse;
      })
  }

  private feedsURL(companyIdentifier: string) {
    return `${APIService.baseURL}/companies/${companyIdentifier}/feeds`;
  }

  async mergeTableData(companyIdentifier: string, dataFeedTable: DataFeedTable, data: Blob): Promise<DataFeedUploadResponse> {
    let headers = new HttpHeaders();
    headers.append('Enctype', 'multipart/form-data');
    let formData = new FormData();
    formData.append('options', JSON.stringify({
      merge_column_names: [],
    }));
    formData.append('csv_file', data);
    return this.api.client.patch(
      `${this.feedsURL(companyIdentifier)}/tables/${dataFeedTable.tableName}/merge`,
      formData,
      { headers },
    ).toPromise().then(response => {
      this.apiLoaders.refreshLoader(DataFeedsService.dataFeedsLoaderKey);
      return response as DataFeedUploadResponse;
    });
  }

  async replaceTableData(companyIdentifier: string, dataFeedTable: DataFeedTable, data: Blob): Promise<DataFeedUploadResponse> {
    let headers = new HttpHeaders();
    headers.append('Enctype', 'multipart/form-data');
    let formData = new FormData();
    formData.append('csv_file', data);
    return this.api.client.put(
      `${this.feedsURL(companyIdentifier)}/tables/${dataFeedTable.tableName}/replace`,
      formData,
      { headers }
    ).toPromise().then(response => {
      this.apiLoaders.refreshLoader(DataFeedsService.dataFeedsLoaderKey);
      return response as DataFeedUploadResponse;
    });
  }
}
