import { NgModule, Compiler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ROUTES, Routes } from '@angular/router';

// Components
import { PerformanceGridComponent } from './components/performance-grid/performance-grid.component';

// Services
import { CompanyResolver } from '../services/resolvers/company.resolver';

// Modules
import { GridModule } from '../grid/grid.module';

import { environmentBasedRoutes } from '../util/environment-based-routes';
import { SessionGuardService } from '../services/access/session-guard.service';
import { SuperGuardService } from '../services/access/super-guard.service';
import { PerformanceGridSettingsComponent } from './components/performance-grid-settings/performance-grid-settings.component';
import { SharedModule } from '../shared/shared.module';
import { PerformanceNodeSettingsComponent } from './components/performance-node-settings/performance-node-settings.component';
import { EditingModule } from '../editing/editing.module';
import { NbLayoutModule } from '@nebular/theme';
import { NodeChartComponent } from './components/node-chart/node-chart.component';

export function EnvironmentBasedRouteFactory(compiler: Compiler): Routes {
  return environmentBasedRoutes([
    // {
    //   path: 'explore',
    //   component: PerformanceGridComponent,
    //   canActivate: [SessionGuardService, SuperGuardService, /* AccessGuardService */ ],
    //   resolve: { company: CompanyResolver, },
    //   data: {
    //     companyDependent: true,
    //     title: 'Explore',
    //   },
    // },
  ]);
}

@NgModule({
  entryComponents: [
    PerformanceGridComponent,
    NodeChartComponent,
  ],
  declarations: [
    PerformanceGridComponent,
    PerformanceGridSettingsComponent,
    PerformanceNodeSettingsComponent,
    NodeChartComponent,
  ],
  imports: [
    NbLayoutModule,
    CommonModule,
    SharedModule,
    EditingModule,
    GridModule,
  ],
  providers: [
    CompanyResolver,
    {
      provide: ROUTES,
      deps: [Compiler],
      multi: true,
      useFactory: EnvironmentBasedRouteFactory,
      useValue: [],
    },
  ],
  exports: [
    PerformanceGridComponent,
  ],
})
export class PerformanceModule { }
