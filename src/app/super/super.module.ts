// Angular
import { NgModule, NgModuleFactory, Compiler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ROUTES } from '@angular/router';

// Vendor
import { SuiModule } from 'ng2-semantic-ui';

// Providers
import { SuperGuardService } from 'src/app/services/access/super-guard.service';
import { MaintenanceService } from 'src/app/services/api/maintenance.service';
import { CompanyResolver } from 'src/app/services/resolvers/company.resolver';

// Components
import { MicraJobsComponent } from './components/micra-jobs/micra-jobs.component';
import { ActivityComponent } from './components/activity/activity.component';

// Utilities
import { environmentBasedRoutes } from 'src/app/util/environment-based-routes';

export function EnvironmentBasedRouteFactory(compiler: Compiler): Routes {
  return environmentBasedRoutes([
    {
      path: 'super/micra-jobs',
      component: MicraJobsComponent,
      canActivate: [SuperGuardService],
    },
    {
      path: 'super/activity',
      component: ActivityComponent,
      canActivate: [SuperGuardService],
    },
  ]);
}

@NgModule({
  entryComponents: [
    MicraJobsComponent,
    ActivityComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SuiModule,
    RouterModule.forChild([]),
  ],
  declarations: [
    MicraJobsComponent,
    ActivityComponent,
  ],
  providers: [
    {
      provide: ROUTES,
      deps: [Compiler],
      multi: true,
      useFactory: EnvironmentBasedRouteFactory,
      useValue: [],
    },
    SuperGuardService,
    CompanyResolver,
    MaintenanceService,
  ],
  exports: [
    MicraJobsComponent,
    RouterModule,
  ],
})
export class SuperModule { }
