import { Injectable } from '@angular/core';
import { APIService, APIResponse } from './api.service';
import { Company } from './company.service';

export interface CreateUserResponse extends APIResponse {
  user?: User;
}

export interface SignInResponse extends APIResponse {
  user?: User;
}

export interface CurrentSessionResponse extends APIResponse {
  user?: User;
}

export interface ResetPasswordParameters {
  userID: string,
  token: string,
  password: string,
  confirmedPassword: string,
}

export interface APIMessage {
  success: boolean;
  title: string;
  message: string;
}

export interface Permission {
  displayName: string;
  shortDisplayName: string;
  path: string;
  targetPathPattern: string;
  actionPattern: string;
}

export interface PermissionGroup {
  displayName: string;
  shortDisplayName: string;
  path: string;
  grants: Permission[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  companies: Company[];
  roles?: string[];
  groups: PermissionGroup[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersURL = `${APIService.baseURL}/users`;

  constructor(private api: APIService) {}

  createUser(signUpData): Promise<User> {
    return this.api.client
      .post(`${this.usersURL}/signup`, signUpData)
      .toPromise()
      .then(response => (response as CreateUserResponse).user)
  }

  signInUser(signInData): Promise<User> {
    return this.api.client
      .post(`${this.usersURL}/signin`, signInData)
      .toPromise()
      .then(response => (response as SignInResponse).user)
  }

  getCurrentUser(): Promise<User> {
    return this.api.client
      .get(`${this.usersURL}/session`)
      .toPromise()
      .then(response => (response as CurrentSessionResponse).user);
  }

  signOut(): Promise<boolean> {
    return this.api.client
      .delete(`${this.usersURL}/session`)
      .toPromise()
      .then(response => (response as APIResponse).success)
  }

  forgotPassword(email: string): Promise<APIMessage> {
    return this.api.client
      .post(`${this.usersURL}/forgot-password`, { email: email, site : this.api.siteName })
      .toPromise()
      .then(response => response as APIMessage)
  }

  resetPassword(parameters: ResetPasswordParameters): Promise<APIMessage> {
    return this.api.client
      .post(`${this.usersURL}/reset-password`, parameters)
      .toPromise()
      .then(response => response as APIMessage)
  }

  deleteAccount(userID): Promise<boolean> {
    return this.api.client
      .delete(`${this.usersURL}/${userID}`)
      .toPromise()
      .then(response => (response as APIResponse).success)
  }

  static userCanSeeCompany(user: User, companyIdentifier: string) {
    return user && user.companies.some(co => co.identifier === companyIdentifier);
  }
}
