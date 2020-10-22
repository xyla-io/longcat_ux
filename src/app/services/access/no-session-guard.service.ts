import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { SessionService } from 'src/app/services/api/session.service';
import { LoadingComponent } from 'src/app/landing/components/loading/loading.component';

@Injectable({
  providedIn: 'root'
})
export class NoSessionGuardService implements CanActivate {

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean|UrlTree {
    if (this.sessionService.currentUserIsKnown && !this.sessionService.currentUser) {
      return true;
    } else if (this.sessionService.currentUserIsKnown && this.sessionService.currentUser) {
      return this.router.parseUrl('home');
    } else {
      let urlTree = this.sessionService.loadingUrlTreeForUrl(state.url);
      urlTree.queryParams['_session'] = 'disallowed';
      return urlTree
    }
  }
}
