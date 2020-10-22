import { Injectable } from '@angular/core';
import { APILoaders, ObservableResult } from 'src/app/util/request-loaders/api-loaders';
import { APIService, APIResponse } from 'src/app/services/api/api.service';
import { SessionService } from 'src/app/services/api/session.service';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
interface PerformanceAPIResponse extends APIResponse {
  signedURL: string
}
@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private apiLoaders: APILoaders;
  private static performanceLoaderKey = 'Performance';
  get performance$(): Observable<ObservableResult<string>> {
    return this.apiLoaders.getSharedObservable(PerformanceService.performanceLoaderKey);
  }
  constructor(
    private api: APIService,
    private sessionService: SessionService,
    private userAlertSerice: UserAlertService,
  ) {
    this.apiLoaders = new APILoaders(this.sessionService);
    this.apiLoaders.createSharedObservable<string>({
      loaderKey: PerformanceService.performanceLoaderKey,
      callFunction: (companyIdentifier) => this.api.client.get(PerformanceService.performanceURL(companyIdentifier)),
      responseHandler: (response: PerformanceAPIResponse) => {
        return { result: response.signedURL };
      },
      errorHandler: (httpError: HttpErrorResponse) => {
        console.error(httpError);
        this.userAlertSerice.postAlert({
          alertType: UserAlertType.error,
          header: 'Problem retrieving performance data',
          body: 'An error occurred'
        })
        return null;
      },
    });
  }
  refreshPerformance() {
    this.apiLoaders.refreshLoader(PerformanceService.performanceLoaderKey);
  }
  private static performanceURL(companyIdentifier: string) {
    return `${APIService.baseURL}/companies/${companyIdentifier}/tags/performance`;
  }
}