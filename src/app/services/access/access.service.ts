import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/services/api/user.service';
import { SessionService } from 'src/app/services/api/session.service';
import {
  addCompanyDependentPrefix,
  insertCompanyIntoPath,
} from 'src/app/util/environment-based-routes';
import { DemoGuardService } from 'src/app/services/access/demo-guard.service';
import { environment } from 'src/environments/environment';

export interface AccessRequirement {
  prefixTargetPathWithCompany?: boolean;
  targetPath: string;
  action: string;
};

export interface Link {
  path: string;
  displayName: string;
  iconTag?: string;
  companyDependent?: boolean;
  [x: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AccessService {
  roles: {readonly [x: string]: string} = {
    super: 'super',
  };

  private static pathSeparator: string = '_';

  actions: {readonly [x: string]: string} = {
    view: 'view',
    list: 'list',
    select: 'select',
    create: 'create',
    delete: 'delete',
    edit: 'edit',
    embed: 'embed',
    associate: 'associate',
    dissociate: 'dissociate',
  };

  constructor(
    private sessionService: SessionService,
    private router: Router,
  ) { }

  filterPathsByAccessRequirements(links: Link[], user?: User): Link[] {
    return links.map(link => {
      if (link.companyDependent) {
        link.path = addCompanyDependentPrefix(link.path);
      }
      return link;
    }).filter(link => {
      let routes = this.router.config
        .filter(route => route.path === link.path)
      if (!routes.length) { return false; }
      if (environment.siteName === 'demo') {
        if (routes[0].canActivate && routes[0].canActivate.includes(DemoGuardService)) {
          return false;
        }
      }
      if (!routes[0].data.access) { return true; }
      return this.userMeetsAccessRequirements(routes[0].data.access as AccessRequirement[], user);
    }).map(link => {
      if (link.companyDependent) {
        link.path = insertCompanyIntoPath(link.path, this.sessionService.currentCompanyIdentifier);
      }
      return link;
    });
  }

  userMeetsAccessRequirements(requirements: AccessRequirement[], user?: User,): boolean {
    let companyIdentifier = this.sessionService.currentCompanyIdentifier;
    for (var i in requirements) {
      let requirement = requirements[i];
      if (requirement.prefixTargetPathWithCompany && companyIdentifier === null) { return false; }
      let targetPath = (requirement.prefixTargetPathWithCompany) ? `companies_${AccessService.escapedPathComponent(companyIdentifier)}${requirement.targetPath}` : requirement.targetPath;
      if (!this.userCanAccessPath(targetPath, requirement.action, user)) { return false; }
    }
    return true;
  }

  userCanAccessPath(targetPath: string, action: string, user?: User): boolean {
    if (!user) { return false; }
    if (user.roles && user.roles.indexOf(this.roles.super) !== -1) { return true; }
    for (var key in this.actions) {
      if (this.actions[key] === action) {
        for (var i = 0; i < user.groups.length; i++) {
          let group = user.groups[i];
          for (var j = 0; j < group.grants.length; j++) {
            let permission = group.grants[j];
            if (targetPath.match(permission.targetPathPattern) && action.match(permission.actionPattern)) { return true; }
          }
        }
        let ownRegExp = new RegExp(`^users_${AccessService.regExpEscapedPathComponent(user._id.toString())}_`);
        if (targetPath.match(ownRegExp)) {
          let ownTargetPath = targetPath.replace(ownRegExp, 'own_');
          return this.userCanAccessPath(ownTargetPath, action, user);
        } else {
          return false;
        }
      }
    }
    return false;
  }

  static regExpEscaped(str: string): string {
    return String(str).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
  }

  static pathFromComponents(components: string[]): string {
    return components.map(component => AccessService.escapedPathComponent(component)).join(AccessService.pathSeparator)
  };
  
  static componentsFromPath(path: string): string[] {
    return path.split(AccessService.pathSeparator).map(escapedComponent => AccessService.unescapedPathComponent(escapedComponent));
  };
  
  static escapedPathComponent(component: string): string {
    return component.replace(/-/g, '-2D').replace(/_/g, '-5F');
  };
  
  static regExpEscapedPathComponent(component: string): string {
    return AccessService.regExpEscaped(AccessService.escapedPathComponent(component));
  };
  
 static unescapedPathComponent(component: string): string {
    return component.replace(/-5F/g, '_').replace(/-2D/g, '-');
  };
}
