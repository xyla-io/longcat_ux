import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil} from 'rxjs/operators';

import { NavbarService } from 'src/app/services/api/navbar.service';
import { environment } from 'src/environments/environment'
import { CompanyReport, CompanyReportsService } from "src/app/services/api/company-reports.service";
import { SessionService } from "src/app/services/api/session.service";
import { addCompanyDependentPrefix } from "src/app/util/environment-based-routes";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroyed = new Subject();

  constructor(
    private router: Router,
    private reportsService: CompanyReportsService,
    private navbarService: NavbarService,
    private sessionService: SessionService,
  ) {
  }

  ngOnInit() {
    this.reportsService.reportsObservable
      .pipe(takeUntil(this.destroyed))
      .subscribe(observableResult => {
        let reports = observableResult.result || [];
        this.navigateToFirstReport(reports);
      });

    this.reportsService.refreshReports();
    this.navbarService.refreshNavbar();
  }

  navigateToFirstReport(reports: CompanyReport[]) {
    if (!reports.length) { return }
    const reportIdentifier = this.reportsService.reportIdentifierFromPath(reports[0].path);
    this.router.navigate([
      addCompanyDependentPrefix(`/report/${reportIdentifier}`,
        this.sessionService.currentCompanyIdentifier)
    ]);
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

}
