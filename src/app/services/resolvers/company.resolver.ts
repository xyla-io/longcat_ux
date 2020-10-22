import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { SessionService } from 'src/app/services/api/session.service';
import { getCompanyIdentifierFromRoute } from 'src/app/util/environment-based-routes';

@Injectable()
export class CompanyResolver implements Resolve<any> {
  constructor(
    private sessionService: SessionService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    let companyIdentifier = getCompanyIdentifierFromRoute(route);
    if (companyIdentifier) {
      if (companyIdentifier !== this.sessionService.currentCompanyIdentifier) {
        this.sessionService.updateCurrentCompanyIdentifier(companyIdentifier);
      }
      return { companyIdentifier };
    }
    return {};
  }
}
