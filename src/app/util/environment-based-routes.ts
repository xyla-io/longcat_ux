import { ActivatedRouteSnapshot, Routes, Router } from '@angular/router';

import { environment } from 'src/environments/environment';
import { LogRouteResolver } from 'src/app/services/resolvers/log-route.resolver';

const companyDependentPrefix = 'company/:identifier/';

export function environmentBasedRoutes(routes: Routes): Routes {
  let newRoutes = routes;
  if (environment.companySwitchingEnabled) {
    newRoutes = routes.map(route => {
      if (route.data && route.data.companyDependent) {
        route.path = addCompanyDependentPrefix(route.path);
        if (route.path === companyDependentPrefix) {
          route.path = route.path.slice(0, route.path.length - 1);
        }
      }
      return route;
    });
  }
  if (!environment.production
    && environment.debugOptions
    && environment.debugOptions.routeLogging) {
    newRoutes = routes.map(route => {
      if (route.resolve) {
        route.resolve['logRoute'] = LogRouteResolver;
      }
      route.resolve = { logRoute: LogRouteResolver };
      return route;
    });
  }
  return newRoutes;
}

export function addCompanyDependentPrefix(urlPath: string, companyIdentifier?: string) {
  if (!environment.companySwitchingEnabled) { return urlPath; }
  urlPath = `${companyDependentPrefix}${urlPath}`;
  if (!companyIdentifier) { return urlPath; }
  return insertCompanyIntoPath(urlPath, companyIdentifier);
}

export function removeCompanyDependentPrefixFromUrl(url: string) {
  if (!environment.companySwitchingEnabled) { return url; }
  const urlPathComponents = url.split('/');
  if (urlPathComponents.length >= 4 && urlPathComponents[1] === 'company') {
    urlPathComponents.splice(1, 2);
  }
  return urlPathComponents.join('/');
}

export function insertCompanyIntoPath(path: string, companyIdentifier: string): string {
  if (environment.companySwitchingEnabled) {
    return path.replace(':identifier', companyIdentifier);
  }
  return path;
}

export function rerouteForCompany(router: Router, companyIdentifier: string) {
  if (!environment.companySwitchingEnabled) {
    return;
  }
  const urlTree = router.parseUrl(router.url);
  const urlSegments = urlTree.root.children.primary.segments;
  if (urlSegments.length < 2) { return; }
  if (urlSegments[0].path === 'company') {
    urlSegments[1].path = companyIdentifier;
  }
  if (urlSegments.length > 2 && ['report'].includes(urlSegments[2].path)) {
    urlTree.root.children.primary.segments = urlSegments.slice(0, 2);
  }
  router.navigateByUrl(urlTree);
}

export function isCompanyDependentRoute(route: ActivatedRouteSnapshot): boolean {
  return (route.url.length > 1 && route.url[0].path === 'company');
}

export function getCompanyIdentifierFromRoute(route: ActivatedRouteSnapshot): string|null {
  if (isCompanyDependentRoute(route)) {
    return route.url[1].path;
  }
  return null;
}
