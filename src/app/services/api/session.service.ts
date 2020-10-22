import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService, User } from './user.service';
import { APIService, APIResponse } from './api.service';
import { TrackingService, TrackingEvents } from 'src/app/services/integration/tracking.service';
import { environment } from 'src/environments/environment';
import {
  rerouteForCompany,
  addCompanyDependentPrefix,
  insertCompanyIntoPath,
} from 'src/app/util/environment-based-routes';
import { CompanyLogoService } from 'src/app/services/api/company-logo.service';
import { sortByProp } from 'src/app/util/sort.util';
import { LocalSettings } from 'src/app/util/local-settings';

export interface AcceptInvitationResponse extends APIResponse {
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private _redirectUrl: string = addCompanyDependentPrefix('');
  private _session?: User = undefined;
  private _sessionIsKnown = false;
  private _selectedCompanyIdentifier: string;

  currentCompany$: Subject<string> = new Subject<string>();
  session$: Subject<User> = new Subject<User>();

  constructor(
    private userService: UserService,
    private trackingService: TrackingService,
    private router: Router,
    private api: APIService,
  ) {
    api.errorResponseSubject.subscribe((response: HttpErrorResponse) => {
      if (response.status !== 403) { return; }
      this.redirectUrl = this.router.url;
      this.syncSession().then(session => {
        if (!session) {
          this.redirectToSignIn();
        }
      });
    });
  }

  get redirectUrl(): string {
    if (this.currentUser) {
      const companyIdentifier = this.currentCompanyIdentifier;
      if (companyIdentifier) {
        return insertCompanyIntoPath(this._redirectUrl, companyIdentifier);
      }
    }
    return 'loading/home';
  }

  set redirectUrl(url: string) {
    this._redirectUrl = url;
  }

  get currentUser(): User {
    return this._session;
  }

  get currentUserIsKnown(): boolean {
    return this._sessionIsKnown;
  }

  get currentCompanyIdentifier(): string|null {
    let identifier = environment.siteName;
    if (this._selectedCompanyIdentifier && this._selectedCompanyIdentifier.length) {
      identifier = this._selectedCompanyIdentifier;
    }
    if (UserService.userCanSeeCompany(this.currentUser, identifier)) {
      return identifier;
    }
    return null;
  }

  consumeRedirectUrl(): string {
    const url = this.redirectUrl;
    this.redirectUrl = addCompanyDependentPrefix('');
    return url;
  }

  loadingUrlTreeForUrl(url: string): UrlTree {
    return this.router.parseUrl('/loading' + url);
  }

  signUp(data): Promise<string> {
    return this.userService.createUser(data)
      .then(user => {
        this.trackingService.track(TrackingEvents.Signup);
        this._updateSession(user);
        return this.consumeRedirectUrl();
      });
  }

  signIn(data): Promise<string> {
    return this.userService.signInUser(data)
      .then(user => {
        this.trackingService.track(TrackingEvents.Signin);
        this._updateSession(user);
        return this.consumeRedirectUrl();
      });
  }

  private getInvitationAcceptURL(companyIdentifier: string): string {
    return `${APIService.baseURL}/companies/${companyIdentifier}/invite/accept`;
  }

  acceptInvitation(companyIdentifier: string, token: string): Promise<boolean> {
    return this.api.client
      .post(this.getInvitationAcceptURL(companyIdentifier), { token: token })
      .toPromise()
      .then((response: AcceptInvitationResponse) => {
        if (response.success) {
          this._updateSession(response.user);
        }
        return response.success;
      });
  }

  async syncSession(): Promise<User> {
    return this.userService.getCurrentUser().then(user => {
      if (user === null) {
        if (this._session !== null) {
          this._updateSession(null);
        }
        return null;
      }
      this._updateSession(user);
      return user;
    });
  }

  signOut(shouldRedirectToSignIn: boolean = true): Promise<void> {
    return this.userService.signOut()
      .then(success => {
        LocalSettings.drop();
        this._updateSession(null);
        if (shouldRedirectToSignIn) {
          this.redirectToSignIn();
        }
      });
  }


  deleteAccount(userID: string): Promise<void> {
    return this.userService.deleteAccount(userID)
      .then(success => {
        this._updateSession(null);
        this.redirectToSignIn();
      });
  }

  updateCurrentCompanyIdentifier(identifier: string, requiresReroute: boolean = false) {
    this._selectedCompanyIdentifier = identifier;
    if (requiresReroute) {
      rerouteForCompany(this.router, this._selectedCompanyIdentifier);
    }
    this.currentCompany$.next(identifier);
  }

  private redirectToSignIn() {
    this.router.navigate(['signin']);
  }

  private _updateSession(user?: User): User {
    this._session = user;
    if (this._session) {
      this._session.companies.forEach(co => {
        co.logoURL = CompanyLogoService.getCompanyLogoURL(co.identifier);
      });
      sortByProp(this._session.companies, 'displayName');
    }
    this._sessionIsKnown = true;
    this.updateCurrentCompanyIdentifier(this.currentCompanyIdentifier);
    this.session$.next(user);
    return user;
  }

}
