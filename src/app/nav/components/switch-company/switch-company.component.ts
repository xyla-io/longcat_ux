import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SessionService } from 'src/app/services/api/session.service';
import { User } from 'src/app/services/api/user.service';
import { Company, CompanyService } from 'src/app/services/api/company.service';
import { APIService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-switch-company',
  templateUrl: './switch-company.component.html',
  styleUrls: ['./switch-company.component.css']
})
export class SwitchCompanyComponent implements OnInit, OnDestroy {

  companies: Company[] = [];
  selectedCompany?: Company;
  private destroyed = new Subject();

  constructor(
    private sessionService: SessionService
  ) { }

  ngOnInit() {
    this.sessionService.session$
      .pipe(takeUntil(this.destroyed))
      .subscribe(user => this.refreshCompanyOptions(user));

    this.sessionService.currentCompany$
      .pipe(takeUntil(this.destroyed))
      .subscribe(companyIdentifier => this.setSelectedCompany(companyIdentifier));

    this.refreshCompanyOptions(this.sessionService.currentUser);
  }

  refreshCompanyOptions(user?: User) {
    this.companies = (user) ? user.companies : [];
    this.setSelectedCompany(this.sessionService.currentCompanyIdentifier);
  }

  setSelectedCompany(companyIdentifier: string) {
    let filteredCompanies = this.companies.filter(company => company.identifier === companyIdentifier);
    this.selectedCompany = filteredCompanies.length ? filteredCompanies[0] : null;
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  onCompanyClicked(company: Company) {
    this.sessionService.updateCurrentCompanyIdentifier(company.identifier, true);
  }
}
