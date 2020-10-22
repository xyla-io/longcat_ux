import { Injectable } from '@angular/core';
import { Subject, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, share, catchError } from 'rxjs/operators';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { APIService, APIQueryResult, APIResponse } from './api.service';
import { SessionService } from './session.service';
import { ErrorService } from 'src/app/services/alerts/error.service';
import { APILoaders, ObservableResult } from 'src/app/util/request-loaders/api-loaders';
import { QueryResultUtil } from 'src/app/util/query-result.util';

export interface TaggingEntity {
  name: string;
  displayName: string;
  pluralDisplayName: string;
}

export interface CSVTagsExportResponse extends APIResponse {
  signedURL: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaggingService {
  sessionSubscription: Subscription;

  entities: {[name: string]: TaggingEntity} = {
    'campaign': {
      name: 'campaign',
      displayName: 'Campaign',
      pluralDisplayName: 'Campaigns',
    },
    'ad': {
      name: 'ad',
      displayName: 'Creative',
      pluralDisplayName: 'Creatives',
    },
  };

  private apiLoaders: APILoaders;

  constructor(
    private apiService: APIService,
    private sessionService: SessionService,
    private errorService: ErrorService,
  ) {

    this.apiLoaders = new APILoaders(sessionService);
    Object.keys(this.entities).forEach(entityKey => {
      this.apiLoaders.createSharedObservable<APIQueryResult>({
        loaderKey: entityKey,
        callFunction: (companyIdentifier) => {
          return this.apiService.client.get([this.tagsURL(companyIdentifier), entityKey].join('/'));
        },
        responseHandler: (response) => {
          let modifiedResult = QueryResultUtil.replaceEmptyValuesInColumn(response as APIQueryResult, 'product_name', 'Unknown');
          modifiedResult = QueryResultUtil.replaceEmptyValuesInColumn(response as APIQueryResult, 'product_platform', 'N/A');

          return {
            result: modifiedResult,
          };
        },
        errorHandler: (httpError: HttpErrorResponse) => {
          return {
            result: {
              row_count: 0,
              column_names: [],
              rows: [],
            }
          };
        }
      });
    });
  }

  getEntityObservable(entityName: string): Observable<ObservableResult<APIQueryResult>> {
    return this.apiLoaders
    .getSharedObservable(entityName);
  }

  refreshEntities(entityName: string) {
    this.apiLoaders.refreshLoader(entityName);
  }

  subtagEntities(entityName: string, entities: any[], subtag: string) {
    let companyIdentifier = this.sessionService.currentCompanyIdentifier;
    let body = { subtag };
    body[`${entityName}s`] = entities.map(entity => { 
      let requestEntity = {app: entity.product_name, channel: entity.channel};
      requestEntity[`${entityName}_id`] = entity[`${entityName}_id`];
      return requestEntity;
    });
    let tagsURL = this.tagsURL(companyIdentifier);

    this.apiService.client
      .patch(`${tagsURL}/${entityName}/subtag`, body)
      .toPromise()
      .then(() => this.refreshEntities(entityName))
      .catch(error => this.errorService.presentError(error));
  }

  tagEntities(entityName: string, entities: any[], tag: string) {
    let companyIdentifier = this.sessionService.currentCompanyIdentifier;
    let body = { tag };
    body[`${entityName}s`] = entities.map(entity => { 
      let requestEntity = {app: entity.product_name, channel: entity.channel};
      requestEntity[`${entityName}_id`] = entity[`${entityName}_id`];
      return requestEntity;
    });
    let tagsURL = this.tagsURL(companyIdentifier);

    this.apiService.client
      .patch(`${tagsURL}/${entityName}/primary`, body)
      .toPromise()
      .then(() => this.refreshEntities(entityName))
      .catch(error => this.errorService.presentError(error));
  }

  untagEntities(entityName: string, entities: any[]) {
    let companyIdentifier = this.sessionService.currentCompanyIdentifier;
    let body = {};
    body[`${entityName}s`] = entities.map(entity => { 
      let requestEntity = {channel: entity.channel};
      requestEntity[`${entityName}_id`] = entity[`${entityName}_id`];
      return requestEntity;
    });
    let tagsURL = this.tagsURL(companyIdentifier);
    if (tagsURL === null) { 
      this.errorService.presentError({message: 'No current company.'});
      return; 
    }
    this.apiService.client
      .patch(`${tagsURL}/${entityName}/delete`, body)
      .toPromise()
      .then(() => this.refreshEntities(entityName))
      .catch(error => this.errorService.presentError(error));
  }

  mergeCSVTags(entityName: string, data: Blob): Promise<APIResponse> {
    let companyIdentifier = this.sessionService.currentCompanyIdentifier;
    let headers = new HttpHeaders();
    headers.append('Enctype', 'multipart/form-data');
    let formData = new FormData();
    formData.append('csv_file', data);
    return this.apiService.client
      .patch(
        `${this.tagsURL(companyIdentifier)}/${entityName}/csv/merge`,
        formData,
        { headers },
      ).toPromise().then(response => response as APIResponse);
  }

  getCSVTags(entityName: string): Promise<CSVTagsExportResponse> {
    let companyIdentifier = this.sessionService.currentCompanyIdentifier;
    return this.apiService.client
      .get(`${this.tagsURL(companyIdentifier)}/${entityName}/csv`)
      .toPromise()
      .then(response => response as CSVTagsExportResponse)
  }

  private tagsURL(companyIdentifier: string): string {
    return `${APIService.baseURL}/companies/${companyIdentifier}/tags`;
  }
}

