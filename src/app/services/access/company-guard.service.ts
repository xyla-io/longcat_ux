import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { SessionService } from 'src/app/services/api/session.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyGuardService implements CanActivate {

  constructor(
    private sessionService: SessionService, 
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean|UrlTree {
    if (this.sessionService.currentCompanyIdentifier) { return true; }
    return this.router.parseUrl('/account-pending');
  }
}
