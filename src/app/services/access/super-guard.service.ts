import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionService } from 'src/app/services/api/session.service';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  UrlTree,
} from '@angular/router';
import { UserService } from 'src/app/services/api/user.service';

@Injectable({
  providedIn: 'root'
})
export class SuperGuardService implements CanActivate {

  constructor(
    private sessionService: SessionService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean|UrlTree {
    if (this.sessionService.currentUser) {
      if (this.sessionService.currentUser.roles.includes('super')) {
        return true;
      }
    } 
    this.sessionService.redirectUrl = state.url;
    let urlTree = this.sessionService.loadingUrlTreeForUrl(state.url);
    urlTree.queryParams['_session'] = 'required';
    return urlTree;
  }
}
