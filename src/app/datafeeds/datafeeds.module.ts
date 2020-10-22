// Angular
import { NgModule, NgModuleFactory, Compiler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ROUTES } from '@angular/router';

// Vendor
import { SuiModule } from 'ng2-semantic-ui';

// Imports
import { SharedModule } from 'src/app/shared/shared.module';

// Providers
import { SessionGuardService } from 'src/app/services/access/session-guard.service';
import { CompanyResolver } from 'src/app/services/resolvers/company.resolver';
import { ChannelInfoService } from 'src/app/services/info/channel-info.service';

// Components
import { DataFeedsTabBarComponent } from './components/data-feeds-tab-bar/data-feeds-tab-bar.component';
import { DataFeedsInboundComponent } from './components/data-feeds-inbound/data-feeds-inbound.component';
import { DataFeedsOutboundComponent } from './components/data-feeds-outbound/data-feeds-outbound.component';

// Utilities
import { environmentBasedRoutes } from 'src/app/util/environment-based-routes';

export function EnvironmentBasedRouteFactory(compiler: Compiler): Routes {
  return environmentBasedRoutes([
    {
      path: 'manage/datafeeds',
      component: DataFeedsTabBarComponent,
      canActivate: [SessionGuardService],
      resolve: { company: CompanyResolver, },
      data: { 
        companyDependent: true,
        title: 'Manage Data Feeds',
        access: [
          {
            targetPath: '_feeds',
            prefixTargetPathWithCompany: true,
            action: 'view',
          }
        ],
      },
    },
  ]);
}

@NgModule({
  entryComponents: [
    DataFeedsTabBarComponent,
    DataFeedsInboundComponent,
    DataFeedsOutboundComponent,
  ],
  imports: [
    SuiModule,
    FormsModule,
    SharedModule,
    CommonModule,
    RouterModule.forChild([]),
  ],
  declarations: [
    DataFeedsTabBarComponent,
    DataFeedsInboundComponent,
    DataFeedsOutboundComponent,
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
    CompanyResolver,
    ChannelInfoService,
  ],
  exports: [
    DataFeedsTabBarComponent,
    RouterModule,
  ],
})
export class DatafeedsModule { }
