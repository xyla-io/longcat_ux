import { Injectable } from '@angular/core';
import { Subject, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, share, catchError } from 'rxjs/operators';

import { SessionService } from './session.service';
import { APIService, APIResponse } from 'src/app/services/api/api.service';
import { PermissionGroupsService } from 'src/app/services/api/permission-groups.service';
import { User } from './user.service';
import { UserAlertType, UserAlertService } from 'src/app/services/alerts/user-alert.service';
import { APILoaders, ObservableResult } from 'src/app/util/request-loaders/api-loaders';

export interface Company {
  displayName: string;
  identifier: string;
  logoURL?: string;
}

export interface Invitation {
  email: string;
  invitationDate: string;
  token: string;
}

export interface InvitationResponse extends APIResponse {
  link: string;
  token: string;
}

export interface CompanyUsersResponse extends APIResponse {
  users: User[];
  invitations: Invitation[];
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private apiLoaders: APILoaders;
  private static usersLoaderKey: string = 'users';

  constructor(
    private api: APIService,
    private sessionService: SessionService,
    private permissionGroupsService: PermissionGroupsService,
    private userAlertService: UserAlertService,
  ) {
    this.apiLoaders = new APILoaders(sessionService);

    this.apiLoaders.createSharedObservable<CompanyUsersResponse>({
      loaderKey: CompanyService.usersLoaderKey,
      callFunction: (companyIdentifier) => {
        return this.api.client.get(this.getCompanyUsersURL(companyIdentifier));
      },
      responseHandler: (response) => {
        let companyUsers = response as CompanyUsersResponse;
        return {
          isRefreshing: false,
          result: companyUsers,
        };
      },
      errorHandler: (error) => {
        this.userAlertService.postAlert({
          alertType: UserAlertType.error,
          header: 'Request Failed',
          body: 'There was a problem retrieving the list of users',
          autoCloseSeconds: 8,
        });
        console.error(error);
      },
    });
  }

  refreshUsers() {
    this.apiLoaders.refreshLoader(CompanyService.usersLoaderKey);
  }

  get usersObservable(): Observable<ObservableResult<CompanyUsersResponse>> {
    return this.apiLoaders
      .getSharedObservable(CompanyService.usersLoaderKey);
  }

  static get companiesURL(): string {
    return `${APIService.baseURL}/companies`;
  }

  deactivateUserFromCompany(userEmail: string): Promise<APIResponse> {
    const companyIdentifier = this.sessionService.currentCompanyIdentifier;
    return this.api.client
    .patch(`${CompanyService.companiesURL}/${companyIdentifier}/users/deactivate`, {
      userEmail
    })
    .toPromise()
    .then(response => {
      this.refreshUsers();
      let { success, message } = response as APIResponse;
      return { success, message };
    })
    .catch(error => {
      this.refreshUsers();
      throw error;
    });
  }

  addUserToStandardGroup(userEmail: string): Promise<APIResponse> {
    const companyIdentifier = this.sessionService.currentCompanyIdentifier;
    return this.permissionGroupsService.associateUserWithGroup(
      userEmail,
      `companies_${companyIdentifier}_groups_${CompanyService.getDefaultGroupName()}`
    )
    .then(response => {
      this.refreshUsers();
      return response;
    })
    .catch(error => {
      this.refreshUsers();
      throw error;
    });
  }

  inviteUserToCompany(inviteEmail: string): Promise<InvitationResponse> {
    const companyIdentifier = this.sessionService.currentCompanyIdentifier;
    return this.api.client
    .post(`${CompanyService.companiesURL}/${companyIdentifier}/invite`, {
        inviteEmail,
      })
      .toPromise()
      .then(response => {
        this.refreshUsers();
        return response as InvitationResponse;
      })
      .catch(error => {
        this.refreshUsers();
        throw error;
      });
  }

  private getCompanyUsersURL(companyIdentifier: string): string {
    return [CompanyService.companiesURL, companyIdentifier, 'users'].join('/')
  }

  public static getDefaultGroupName(): string {
    return 'tagger';
  }

  public makeInvitationLink(token: string, email: string) {
    const companyIdentifier = this.sessionService.currentCompanyIdentifier;
    return `https://${companyIdentifier}.xyla.io/invitation/${token}?email=${encodeURIComponent(email)}`;
  }
}
