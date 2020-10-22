// Angular
import { NgModule, NgModuleFactory, Compiler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ROUTES } from '@angular/router';

// Vendor
import { SuiModule } from 'ng2-semantic-ui';

// Providers
import { AccessGuardService } from 'src/app/services/access/access-guard.service';
import { DemoGuardService } from 'src/app/services/access/demo-guard.service';
import { CompanyResolver } from 'src/app/services/resolvers/company.resolver';

// Components
import { ListUsersComponent } from './components/list-users/list-users.component';

// Utilities
import { environmentBasedRoutes } from 'src/app/util/environment-based-routes';

export function EnvironmentBasedRouteFactory(compiler: Compiler): Routes {
  return environmentBasedRoutes([
    {
      path: 'manage/users',
      component: ListUsersComponent,
      canActivate: [AccessGuardService, DemoGuardService],
      resolve: { company: CompanyResolver, },
      data: {
        companyDependent: true,
        title: 'Manage Users',
        access: [
          {
            targetPath: '_users',
            prefixTargetPathWithCompany: true,
            action: 'list',
          }
        ],
      }
    },
  ]);
}

@NgModule({
  entryComponents: [
    ListUsersComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SuiModule,
    RouterModule.forChild([]),
  ],
  declarations: [
    ListUsersComponent,
  ],
  providers: [
    {
      provide: ROUTES,
      deps: [Compiler],
      multi: true,
      useFactory: EnvironmentBasedRouteFactory,
      useValue: [],
    },
    CompanyResolver,
    AccessGuardService,
    DemoGuardService,
  ],
  exports: [
    ListUsersComponent,
    RouterModule,
  ],
})
export class AdminModule { }
