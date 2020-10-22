// Angular
import { NgModule, NgModuleFactory, Compiler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule, ROUTES } from '@angular/router';

// Vendor
import { SuiModule } from 'ng2-semantic-ui';

// Imports
import { SharedModule } from 'src/app/shared/shared.module';

// Providers
import { SessionGuardService } from 'src/app/services/access/session-guard.service';
import { CompanyGuardService } from 'src/app/services/access/company-guard.service';

// Components
import { HomeComponent } from './components/home/home.component';
import { NoCompanyComponent } from './components/no-company/no-company.component';
import { LoadingComponent } from './components/loading/loading.component';

// Resolvers
import { CompanyResolver } from 'src/app/services/resolvers/company.resolver';

// Util
import { environmentBasedRoutes } from 'src/app/util/environment-based-routes';

export function EnvironmentBasedRouteFactory(compiler: Compiler): Routes {
  return environmentBasedRoutes([
    {
      path: 'account-pending',
      component: NoCompanyComponent,
      canActivate: [SessionGuardService],
      data: { title: 'Account Pending' }
    },
    {
      path: 'loading',
      component: LoadingComponent,
      data: { title: 'Loading' },
      children: [
        {
          path: '**',
          component: LoadingComponent,
        }
      ],
    },
    {
      path: 'home',
      component: HomeComponent,
      canActivate: [SessionGuardService],
      data: { 
        title: 'XYLA'
      }
    },
    {
      path: '',
      component: LoadingComponent,
      resolve: {
        company: CompanyResolver,
      },
      data: { 
        companyDependent: true,
        title: 'XYLA'
      }
    },
    {
      path: '',
      component: LoadingComponent,
      data: { 
        title: 'XYLA'
      }
    },
    {
      path: '**',
      component: LoadingComponent,
      data: { 
        title: 'XYLA'
      }
    }
  ]);
}

@NgModule({
  entryComponents: [
    HomeComponent,
    NoCompanyComponent,
    LoadingComponent,
  ],
  imports: [
    SuiModule,
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([]),
  ],
  declarations: [
    HomeComponent,
    NoCompanyComponent,
    LoadingComponent,
  ],
  exports: [
    HomeComponent,
    NoCompanyComponent,
    LoadingComponent,
    RouterModule,
  ],
  providers: [
    {
      provide: ROUTES,
      deps: [Compiler],
      multi: true,
      useFactory: EnvironmentBasedRouteFactory,
      useValue: [],
    },
    CompanyGuardService,
    SessionGuardService,
    CompanyResolver,
  ],
})
export class LandingModule { }
