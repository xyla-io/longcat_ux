import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { AccessService } from 'src/app/services/access/access.service';
import { SessionService } from 'src/app/services/api/session.service';

@Injectable({
  providedIn: 'root'
})
export class AccessGuardService implements CanActivate {

  constructor(
    private accessService: AccessService,
    private sessionService: SessionService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean|UrlTree {
    if (!route.data.access) { return false; }
    let session = this.sessionService.currentUser;
    if (session) {
      return this.accessService.userMeetsAccessRequirements(route.data.access, session);
    } else {
      this.sessionService.redirectUrl = state.url;
      let urlTree = this.sessionService.loadingUrlTreeForUrl(state.url);
      urlTree.queryParams['_session'] = 'required';
      return urlTree;
    }
  }
}
