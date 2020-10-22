import { Injectable } from '@angular/core';
import { Subject, Observable, of, from, Subscription } from 'rxjs';
import { map, switchMap, share, catchError } from 'rxjs/operators';

import { SessionService } from './session.service';
import { APIService, APIResponse } from './api.service';
import { DateUtil } from 'src/app/util/date.util';
import { APILoaders, ObservableResult } from 'src/app/util/request-loaders/api-loaders';
import { UserAlertType, UserAlertService } from 'src/app/services/alerts/user-alert.service';

export interface QueryExportResponse extends APIResponse {
  exports: QueryExport[];
}

export interface QueryExportResponse extends APIResponse {
  signedURL: string;
}

export interface QueryExport {
  displayName: string;
  description: string;
  path: string;
  query: SQLQuery;
  creationTime: string;
  lastExportTime: string;
  displayCreationTime?: string;
  displayLastExportTime?: string;
}

export interface SQLQuery {
  query: string;
  description: string;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class QueryExportService {

  private static exportsLoaderKey = 'exports';
  private apiLoaders: APILoaders;

  constructor(
    private api: APIService,
    private sessionService: SessionService,
    private userAlertService: UserAlertService,
  ) {
    this.apiLoaders = new APILoaders(sessionService);

    this.apiLoaders.createSharedObservable<QueryExportResponse>({
      loaderKey: QueryExportService.exportsLoaderKey,
      callFunction: (companyIdentifer) => this.api.client.get(this.companyExportsURL(companyIdentifer)),
      responseHandler: (response) => {
        const queryExportResponse = response as QueryExportResponse;
        queryExportResponse.exports = queryExportResponse.exports.map(queryExport => {
          queryExport.displayLastExportTime = DateUtil.formatDateAndTime(queryExport.lastExportTime);
          queryExport.displayCreationTime = DateUtil.formatDateAndTime(queryExport.creationTime);
          return queryExport;
        });
        return { result: queryExportResponse };
      },
      errorHandler: (error) => {
        this.userAlertService.postAlert({
          alertType: UserAlertType.error,
          header: 'Request Failed',
          body: 'There was a problem retrieving the list of data exports',
          autoCloseSeconds: 8,
        });
        console.error(error);
      }
    });
  }

  get exportsObservable(): Observable<ObservableResult<QueryExportResponse>> {
    return this.apiLoaders.getSharedObservable(QueryExportService.exportsLoaderKey);
  }

  refreshExports(companyIdentifier: string) {
    this.apiLoaders.refreshLoader(QueryExportService.exportsLoaderKey);
  }

  getQueryExportData(exportPath: string): Promise<QueryExportResponse> {
    return this.api.client.get(`${this.exportsURL}/${exportPath}`)
      .toPromise()
      .then(response => {
        return response as QueryExportResponse;
      });
  }

  private companyExportsURL(companyIdentifier: string) {
    return `${APIService.baseURL}/queries/companies/${companyIdentifier}/exports`;
  }

  private get exportsURL() {
    return `${APIService.baseURL}/queries/exports`;
  }
}
