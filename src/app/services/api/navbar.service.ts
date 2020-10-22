import { Injectable } from '@angular/core';
import { APIService, APIResponse } from './api.service';
import { Subject, Observable, of, Subscription } from 'rxjs';
import { map, switchMap, share } from 'rxjs/operators';
import { SessionService } from './session.service';
import { APILoaders, ObservableResult } from 'src/app/util/request-loaders/api-loaders';

export interface NavbarResponse extends APIResponse {
  navbar: Navbar;
}

export interface Navbar {
  nodes: NavbarNode[];
}

export interface NavbarNode {
  identifier: string;
  targets: NavbarNodeChild[];
}

export interface NavbarNodeChild {
  type: string;
  identifier: string;
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  private navbarsURL = `${APIService.baseURL}/navbars`;

  private apiLoaders: APILoaders;
  private static navbarLoaderKey: string = 'navbar';

  constructor(
    private apiService: APIService,
    private sessionService: SessionService,
  ) {
    this.apiLoaders = new APILoaders(sessionService);

    this.apiLoaders.createSharedObservable<NavbarNode[]>({
      loaderKey: NavbarService.navbarLoaderKey,
      callFunction: (companyIdentifier) => {
        return this.apiService.client
        .get(`${this.navbarsURL}/companies/${companyIdentifier}/reports`);
      },
      responseHandler: (response) => {
        return { result: (response as NavbarResponse).navbar.nodes as NavbarNode[] };
      },
      errorHandler: (error) => {
      },
    });
  }

  get reportsNavbarObservable(): Observable<ObservableResult<NavbarNode[]>> {
    return this.apiLoaders.getSharedObservable(NavbarService.navbarLoaderKey);
  }

  refreshNavbar() {
    this.apiLoaders.refreshLoader(NavbarService.navbarLoaderKey);
  }

  static findRootNode(nodes: NavbarNode[]): NavbarNode {
    let referencedIdentifiers = [];
    referencedIdentifiers = nodes.reduce((refs, node) => {
      return refs.concat(node.targets.filter(target => target.type === 'node'));
    }, []);
    let root = nodes.find(node => !referencedIdentifiers.includes(node.identifier));
    return root;
  }
}
