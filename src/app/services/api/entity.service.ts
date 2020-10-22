import { Injectable } from '@angular/core';
import { APILoaders, ObservableResult } from 'src/app/util/request-loaders/api-loaders';
import { Observable } from 'rxjs';
import { APIService, APIResponse } from './api.service';
import { SessionService } from './session.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserAlertService, UserAlertType } from '../alerts/user-alert.service';

interface EntitiesAPIResponse extends APIResponse {
  signedURL: string
}

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  private apiLoaders: APILoaders;
  private static entitiesLoaderKey = 'entities';

  get entities$(): Observable<ObservableResult<string>> {
    return this.apiLoaders.getSharedObservable(EntityService.entitiesLoaderKey);
  }

  constructor(
    private api: APIService,
    private sessionService: SessionService,
    private userAlertSerice: UserAlertService,
  ) {
    this.apiLoaders = new APILoaders(this.sessionService);
    this.apiLoaders.createSharedObservable<string>({
      loaderKey: EntityService.entitiesLoaderKey,
      callFunction: (companyIdentifier) => this.api.client.get(EntityService.entitiesURL(companyIdentifier)),
      responseHandler: (response: EntitiesAPIResponse) => {
        return { result: response.signedURL };
      },
      errorHandler: (httpError: HttpErrorResponse) => {
        console.error(httpError);
        this.userAlertSerice.postAlert({
          alertType: UserAlertType.error,
          header: 'Problem retrieving entities',
          body: 'An error occurred when retrieving entities'
        })
      },
    })
  }

  refreshEntities() {
    this.apiLoaders.refreshLoader(EntityService.entitiesLoaderKey);
  }

  private static entitiesURL(companyIdentifier: string) {
    return `${APIService.baseURL}/companies/${companyIdentifier}/entities`;
  }
}

