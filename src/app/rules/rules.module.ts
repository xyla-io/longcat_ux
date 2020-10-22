import { NgModule, Compiler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, ROUTES, RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

// Vendor
import {
  SuiModule,
} from 'ng2-semantic-ui';
import { AgGridModule } from 'ag-grid-angular';
import { NgxSmartModalModule } from 'ngx-smart-modal';

// Required for Enterprise edition of ag-grid
import 'ag-grid-enterprise'

// Modules
import { SharedModule } from '../shared/shared.module';

// Services
import { AccessGuardService } from '../services/access/access-guard.service';
import { SessionGuardService } from '../services/access/session-guard.service';
import { CompanyResolver } from 'src/app/services/resolvers/company.resolver';
import { AdgroupService } from './services/adgroup.service';
import { CampaignService } from './services/campaign.service';
import { CertificateService } from './services/certificate.service';
import { CredentialService } from './services/credential.service';
import { DragonAPIService } from './services/dragon-api.service';
import { RulesService } from './services/rules.service';
import { RuleHistoryService } from './services/rule-history.service';
import { SuperGuardService } from '../services/access/super-guard.service';

// Utilities
import { environmentBasedRoutes } from '../util/environment-based-routes';

// Components
import { ListRulesComponent } from './components/list-rules/list-rules.component';
import { EditRuleComponent } from './components/edit-rule/edit-rule.component';
import { EditConditionComponent } from './components/edit-condition/edit-condition.component';
import { EditActionComponent } from './components/edit-action/edit-action.component';
import { EditRunIntervalComponent } from './components/edit-run-interval/edit-run-interval.component';
import { LabelMetricComponent } from './components/label-metric/label-metric.component';
import { EditCheckRangeComponent } from './components/edit-check-range/edit-check-range.component';
import { EditTaskComponent } from './components/edit-task/edit-task.component';
import { BadgeRuleNotificationsComponent } from './components/badge-rule-notifications/badge-rule-notifications.component';
import { ListRuleHistoryComponent } from './components/list-rule-history/list-rule-history.component';
import { CloneRuleComponent } from './components/clone-rule/clone-rule.component';
import { NodeRuleComponent } from './components/node-rule/node-rule.component';

// Pipes
import { RuleDescriptionPipe } from './pipes/rule-description.pipe';
import { TaskDescriptionPipe } from './pipes/task-description.pipe';
import { GridModule } from '../grid/grid.module';


export function EnvironmentBasedRouteFactory(compiler: Compiler): Routes {
  return environmentBasedRoutes([
    {
      path: 'manage/rules',
      component: ListRulesComponent,
      // FIXME: add in when adding the access requirements
      canActivate: [SessionGuardService, SuperGuardService, /* AccessGuardService */ ],
      resolve: { company: CompanyResolver, },
      data: {
        companyDependent: true,
        title: 'Manage Rules',
        // FIXME: add in the access requirement
        // access: [
        //   {
        //     targetPath: '_rules',
        //     prefixTargetPathWithCompany: true,
        //     action: 'list',
        //   }
        // ],
      }
    },
  ]);
}


@NgModule({
  entryComponents: [
    ListRulesComponent,
    EditRuleComponent,
    NodeRuleComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([]),
    SharedModule,
    GridModule,
    SuiModule,
    NgxSmartModalModule,
    AgGridModule.withComponents([]),
    ScrollingModule,
  ],
  declarations: [
    ListRulesComponent,
    EditRuleComponent,
    EditConditionComponent,
    EditActionComponent,
    EditRunIntervalComponent,
    LabelMetricComponent,
    EditCheckRangeComponent,
    EditTaskComponent,
    BadgeRuleNotificationsComponent,
    ListRuleHistoryComponent,
    RuleDescriptionPipe,
    TaskDescriptionPipe,
    CloneRuleComponent,
    NodeRuleComponent,
  ],
  providers: [
    CompanyResolver,
    AdgroupService,
    CampaignService,
    CertificateService,
    CredentialService,
    DragonAPIService,
    RulesService,
    RuleHistoryService,
    {
      provide: ROUTES,
      deps: [Compiler],
      multi: true,
      useFactory: EnvironmentBasedRouteFactory,
      useValue: [],
    },
  ]
})
export class RulesModule { }
