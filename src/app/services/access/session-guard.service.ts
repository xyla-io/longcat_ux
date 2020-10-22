import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionService } from 'src/app/services/api/session.service';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  UrlTree,
} from '@angular/router';
import { UserService } from 'src/app/services/api/user.service';

@Injectable({
  providedIn: 'root'
})
export class SessionGuardService implements CanActivate {

  constructor(
    private sessionService: SessionService,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean|UrlTree {
    if (this.sessionService.currentUser) { return true; }
    this.sessionService.redirectUrl = state.url;
    let urlTree = this.sessionService.loadingUrlTreeForUrl(state.url);
    urlTree.queryParams['_session'] = 'required';
    return urlTree;
  }
}
