// Angular
import { NgModule, NgModuleFactory, Compiler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes, ROUTES } from '@angular/router';

// Vendor
import { SuiModule, SuiPopupModule } from 'ng2-semantic-ui';
import {
  NbLayoutModule,
  NbSidebarModule,
  NbSpinnerModule,
  NbStepperModule,
  NbCardModule,
  NbButtonModule,
  NbIconModule,
} from '@nebular/theme';

// Imports
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardModule } from 'src/app/dashboard/dashboard.module';
import { SidebarModule } from 'src/app/sidebar/sidebar.module';

// Providers
import { SessionGuardService } from 'src/app/services/access/session-guard.service';
import { CompanyGuardService } from 'src/app/services/access/company-guard.service';
import { SuperGuardService } from 'src/app/services/access/super-guard.service';
import { CompanyResolver } from 'src/app/services/resolvers/company.resolver';

// Components
import { ViewReportComponent } from './components/view-report/view-report.component';
import { ReportElementComponent } from './components/report-element/report-element.component';
import { ModeContentComponent } from './components/mode-content/mode-content.component';
import { PeriscopeContentComponent } from './components/periscope-content/periscope-content.component';
import { ReportLayoutComponent } from './components/report-layout/report-layout.component';
import { XylaContentComponent } from './components/xyla-content/xyla-content.component';

// Pipes
import { BypassSecurityURLPipe } from './pipes/bypass-security-url.pipe';

// Utilities
import { environmentBasedRoutes } from 'src/app/util/environment-based-routes';
import { XylaGridContentComponent } from './components/xyla-grid-content/xyla-grid-content.component';
import { PerformanceModule } from '../performance/performance.module';
import { XylaSwitchContentComponent } from './components/xyla-switch-content/xyla-switch-content.component';
import { ReportComponent } from './components/report/report.component';
import { EditingModule } from '../editing/editing.module';

export function EnvironmentBasedRouteFactory(compiler: Compiler): Routes {
  return environmentBasedRoutes([
    {
      path: 'report/:type',
      component: ReportComponent,
      canActivate: [SessionGuardService, CompanyGuardService],
      resolve: { company: CompanyResolver, },
      data: {
        companyDependent: true,
        title: 'Report',
      }
    },
  ]);
}

@NgModule({
  entryComponents: [
    ReportComponent,
  ],
  imports: [
    SuiModule,
    SuiPopupModule,
    NbLayoutModule,
    NbSidebarModule,
    NbSpinnerModule,
    NbStepperModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    CommonModule,
    FormsModule,
    SharedModule,
    DashboardModule,
    SidebarModule,
    RouterModule.forChild([]),
    PerformanceModule,
    EditingModule,
  ],
  declarations: [
    BypassSecurityURLPipe,
    ViewReportComponent,
    ReportElementComponent,
    ModeContentComponent,
    PeriscopeContentComponent,
    ReportLayoutComponent,
    XylaContentComponent,
    XylaGridContentComponent,
    XylaSwitchContentComponent,
    ReportComponent,
  ],
  providers: [
    {
      provide: ROUTES,
      deps: [Compiler],
      multi: true,
      useFactory: EnvironmentBasedRouteFactory,
      useValue: [],
    },
    SessionGuardService,
    CompanyGuardService,
    SuperGuardService,
    CompanyResolver,
  ],
  exports: [
    ReportComponent,
    RouterModule,
  ],
})
export class ReportsModule { }
