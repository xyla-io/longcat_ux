// Angular
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Vendor
import { SuiModule } from 'ng2-semantic-ui';

// Components
import { PartnerWelcomeComponent } from './components/partner-welcome/partner-welcome.component';
import { SwitchCompanyComponent } from './components/switch-company/switch-company.component';
import { NavReportsComponent } from './components/nav-reports/nav-reports.component';
import { NavSubmenuComponent } from './components/nav-submenu/nav-submenu.component';
import { NavBreadcrumbsSubmenuComponent } from './components/nav-breadcrumbs-submenu/nav-breadcrumbs-submenu.component';
import { EditingModule } from 'src/app/editing/editing.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    EditingModule,
  ],
  declarations: [
    PartnerWelcomeComponent,
    SwitchCompanyComponent,
    NavReportsComponent,
    NavSubmenuComponent,
    NavBreadcrumbsSubmenuComponent,
  ],
  exports: [
    PartnerWelcomeComponent,
    NavReportsComponent,
    SwitchCompanyComponent,
  ]
})
export class NavModule { }
