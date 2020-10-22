import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpHeaders, HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { APIService } from 'src/app/services/api/api.service';

@Injectable()
export class APIInterceptor implements HttpInterceptor {

  constructor(
    private longcatAPIService: APIService,
    private dragonAPIService: APIService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith(environment.apiBaseURL)) {
      return this.handleInterceptedLongcatAPIRequest(req, next);
    } else if (req.url.startsWith(environment.rulesAPIBaseURL)) {
      return this.handleInterceptedDragonAPIRequest(req, next);
    }
    return next.handle(req);
  }

  handleInterceptedLongcatAPIRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({ withCredentials: true });
    return next.handle(req).pipe(tap(
      event => {},
      error => this.longcatAPIService.errorResponseSubject.next(error),
    ));
  }

  handleInterceptedDragonAPIRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let apiParams = {}
    if (environment.rulesAPIKey !== null) {
      apiParams = {apikey: environment.rulesAPIKey};
    }
    req = req.clone({ withCredentials: true, setParams: apiParams });
    return next.handle(req).pipe(tap(
      event => {},
      error => this.dragonAPIService.errorResponseSubject.next(error),
    ));
  }
}
