// Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

// Vendor
import { SuiModule } from 'ng2-semantic-ui';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import {
  NbThemeModule,
  NbSidebarModule,
  NbMenuModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

// Components
import { AppComponent } from './app.component';

// Services
import { APIService } from './services/api/api.service';
import { UserService } from './services/api/user.service';
import { SessionService } from './services/api/session.service';
import { ErrorService } from './services/alerts/error.service';
import { CompanyReportsService } from './services/api/company-reports.service';
import { TaggingService } from './services/api/tagging.service';
import { CompanyService } from './services/api/company.service';
import { PermissionGroupsService } from './services/api/permission-groups.service';
import { LoadingService } from './services/app/loading.service';
import { WindowRef } from './services/app/window.service';
import { QueryResultsService } from './services/downloads/query-results.service';
import { AccessService } from './services/access/access.service';
import { TrackingService } from './services/integration/tracking.service';
import { AbdetectService } from './services/integration/abdetect.service';

// Directives
import { IframeTrackerDirective } from './directives/iframe-tracker.directive';

// Resolvers
import { LogRouteResolver } from 'src/app/services/resolvers/log-route.resolver';

// Interceptors
import { APIInterceptor } from 'src/app/services/interceptors/api.interceptor';

// Modules
import { AuthenticationModule } from 'src/app/authentication/authentication.module';
import { EntitiesModule } from 'src/app/entities/entities.module';
import { AdminModule } from 'src/app/admin/admin.module';
import { DatafeedsModule } from 'src/app/datafeeds/datafeeds.module';
import { ReportsModule } from 'src/app/reports/reports.module';
import { NavModule } from 'src/app/nav/nav.module';
import { LandingModule } from 'src/app/landing/landing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SuperModule } from 'src/app/super/super.module';
import { DashboardModule } from 'src/app/dashboard/dashboard.module';
import { RulesModule } from './rules/rules.module';
import { TagsModule } from './tags/tags.module';
import { PerformanceModule } from './performance/performance.module';

@NgModule({
  declarations: [
    AppComponent,
    IframeTrackerDirective,
  ],
  imports: [
    SuiModule,
    NgxSmartModalModule.forRoot(),
    NbThemeModule.forRoot(),
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbEvaIconsModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AuthenticationModule,
    EntitiesModule,
    AdminModule,
    DatafeedsModule,
    ReportsModule,
    NavModule,
    SuperModule,
    DashboardModule,
    RulesModule,
    TagsModule,
    PerformanceModule,
    // Landing module must be after all
    // modules that export routes since it
    // defines the wildcard route.
    LandingModule,
    SharedModule,
    RouterModule.forRoot(
      [],
      { enableTracing: false } // <-- debugging purposes only
    ),
  ],
  providers: [
    TrackingService,
    AbdetectService,
    APIService,
    SessionService,
    UserService,
    ErrorService,
    CompanyReportsService,
    AccessService,
    TaggingService,
    CompanyService,
    PermissionGroupsService,
    LoadingService,
    WindowRef,
    QueryResultsService,
    LogRouteResolver,
    { provide: HTTP_INTERCEPTORS, useClass: APIInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
