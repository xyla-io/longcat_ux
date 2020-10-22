import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { SessionService } from 'src/app/services/api/session.service';
import { EmbedsService } from 'src/app/services/api/embeds.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';

interface DragonSession {
  _id: string,
  local: {
    email: string;
    password: string;
  };
  name: string;
}

interface AuthResponse {
  success: boolean;
  url: string;
  user: DragonSession;
}

@Injectable({
  providedIn: 'root'
})
export class DragonAPIService {

  static readonly baseURL: string = environment.rulesAPIBaseURL;
  client: HttpClient;
  errorResponseSubject: Subject<HttpErrorResponse> = new Subject();
  private _session$: BehaviorSubject<DragonSession|null> = new BehaviorSubject(null);
  get session$(): Observable<DragonSession|null> { return this._session$.asObservable(); }
  get session(): DragonSession|null { return this._session$.value; }

  constructor(
    httpClient: HttpClient,
    private sessionService: SessionService,
    private embedsService: EmbedsService,
    private userAlertService: UserAlertService,
  ) {
    this.client = httpClient;
    this.sessionService.currentCompany$
      .pipe(distinctUntilChanged())
      .subscribe(async companyIdentifier => {
        await this.authenticate(companyIdentifier);
      })
    if (this.sessionService.currentCompanyIdentifier && this.sessionService.currentUser) {
      this.authenticate(this.sessionService.currentCompanyIdentifier);
    }
  }

  private async authenticate(companyIdentifier: string) {
    const { user } = (await this.checkSession()) as { user: DragonSession };
    if (user) { await this.signout(); }
    try {
      const signedURL = await this.getSSOURL(companyIdentifier);
      const response = await this.client.get(signedURL).pipe(map(response => response as AuthResponse)).toPromise();
      this._session$.next(response.user);
    } catch {
      this._session$.next(null);
    }
  }

  private async getSSOURL(companyIdentifier: string) {
    const signedEmbeds = await this.embedsService.signEmbeds({
      datadragon: {
        sso: {
          companyIdentifier,
          apiOnly: true,
        }
      }
    });
    const { signedURL, message } = signedEmbeds.datadragon.sso;
    if (signedURL) {
      return signedURL;
    } else {
      throw new Error(message);
    }
  }

  private checkSession() {
    return this.client.get(`${DragonAPIService.baseURL}/users/session`).toPromise().catch(err => {
      console.error(err);
      this.userAlertService.postAlert({
        alertType: UserAlertType.error,
        header: 'System Error',
        body: 'An error occurred when attempting to connect to the rules engine',
      });
      throw err;
    });
  }

  private async signout() {
    const response = await this.client.delete(`${DragonAPIService.baseURL}/users/session`).toPromise();
    this._session$.next(null);
    return response;
  }
}

