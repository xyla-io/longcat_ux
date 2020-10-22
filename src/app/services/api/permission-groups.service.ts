import { Injectable } from '@angular/core';

import { APIService, APIResponse } from 'src/app/services/api/api.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGroupsService {
  private permissionGroupsURL = `${APIService.baseURL}/permissions/groups`;

  constructor(
    private api: APIService,
  ) { }

  dissociateUserFromGroup(userEmail: string, groupPath: string): Promise<APIResponse> {
    return this.api.client
      .patch(`${this.permissionGroupsURL}/dissociate`, {
        userEmail,
        groupPath,
      })
      .toPromise()
      .then(response => response as APIResponse);
  }

  associateUserWithGroup(userEmail: string, groupPath: string): Promise<APIResponse> {
    return this.api.client
      .patch(`${this.permissionGroupsURL}/associate`, {
        userEmail,
        groupPath,
      })
      .toPromise()
      .then(response => response as APIResponse);
  }
}
