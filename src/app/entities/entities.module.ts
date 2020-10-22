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
import { AccessGuardService } from 'src/app/services/access/access-guard.service';
import { CompanyResolver } from 'src/app/services/resolvers/company.resolver';

// Components
import { EntityManagerComponent } from './components/entity-manager/entity-manager.component';
import { ListEntitiesComponent } from './components/list-entities/list-entities.component';
import { ListCampaignsComponent } from './components/list-campaigns/list-campaigns.component';
import { ListAdsComponent } from './components/list-ads/list-ads.component';
import { FilterEntitiesComponent } from './components/filter-entities/filter-entities.component';
import { SelectableTableComponent } from './components/selectable-table/selectable-table.component';

// Utilities
import { environmentBasedRoutes } from 'src/app/util/environment-based-routes';

export function EnvironmentBasedRouteFactory(compiler: Compiler): Routes {
  return environmentBasedRoutes([
    {
      path: 'manage/assets',
      component: EntityManagerComponent,
      canActivate: [AccessGuardService],
      resolve: { company: CompanyResolver, },
      data: {
        companyDependent: true,
        title: 'Manage Assets',
        entity: null,
        access: [
          {
            // TODO expand this access requirement list
            // to allow for any of the target paths 
            // necessary under manage/assets
            targetPath: '_tags_campaign',
            prefixTargetPathWithCompany: true,
            action: 'list',
          }
        ],
      }
    }, {
      path: 'manage/assets/creative',
      component: EntityManagerComponent,
      canActivate: [AccessGuardService],
      resolve: { company: CompanyResolver, },
      data: { 
        companyDependent: true,
        title: 'Manage Creatives',
        entity: 'ad',
        access: [
          {
            targetPath: '_tags_ad',
            prefixTargetPathWithCompany: true,
            action: 'list',
          }
        ],
      },
    }, {
      path: 'manage/assets/campaign',
      component: EntityManagerComponent,
      canActivate: [AccessGuardService],
      resolve: { company: CompanyResolver, },
      data: { 
        companyDependent: true,
        title: 'Manage Campaigns',
        entity: 'campaign',
        access: [
          {
            targetPath: '_tags_campaign',
            prefixTargetPathWithCompany: true,
            action: 'list',
          }
        ],
      },
    }
  ]);
}

@NgModule({
  entryComponents: [
    ListEntitiesComponent,
    EntityManagerComponent,
    ListCampaignsComponent,
    ListAdsComponent,
    FilterEntitiesComponent,
    SelectableTableComponent,
  ],
  imports: [
    SuiModule,
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([]),
  ],
  declarations: [
    ListEntitiesComponent,
    EntityManagerComponent,
    ListCampaignsComponent,
    ListAdsComponent,
    FilterEntitiesComponent,
    SelectableTableComponent,
  ],
  exports: [
    EntityManagerComponent,
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
    AccessGuardService,
    CompanyResolver
  ],
})
export class EntitiesModule { }
