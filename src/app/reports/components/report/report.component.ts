import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SaveStatus } from 'src/app/editing/components/save-control/save-control.component';
import { CompanyReport, CompanyReportsService } from 'src/app/services/api/company-reports.service';
import { SessionService } from 'src/app/services/api/session.service';
import { applyReportUpdate, CompanyReportState, CompanyReportUpdate, newExploreReport } from '../../models/report';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, OnDestroy {
  SaveStatus = SaveStatus;
  
  private destroyed = new Subject();
  reportPath: string;
  reports: CompanyReport[] = [];
  reportStates: CompanyReportState[] = [];
  reportState: CompanyReportState;

  constructor(
    public sessionService: SessionService,
    private reportsService: CompanyReportsService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.destroyed))
      .subscribe((params: ParamMap) => {
        const reportIdentifier = params.get('type');
        this.reportPath = this.reportsService.reportPathFromIdentifier(reportIdentifier);
        this.updateReports();
      });

    this.reportsService.reportsObservable
      .pipe(takeUntil(this.destroyed))
      .subscribe(observableResult => {
        this.reports = observableResult.result || [];
        this.updateReports();
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  updateReports() {
    this.reportStates = this.reports.filter(r => r.reportVersion > 1).sort((a, b) => b.date.getTime() - a.date.getTime()).map(r => ({
      report: r,
      status: this.reportsService.localReports.value.includes(r) ? SaveStatus.New : SaveStatus.Clean,
    }));
    this.reportState = this.reportStates.filter(s => s.report.path === this.reportPath).pop();
  }

  onNewTabClick(event: any) {
    this.newReport();
  }

  newReport() {
    const companyIdentifier = this.sessionService.currentCompanyIdentifier;
    if (!companyIdentifier) { return; }
    const now = new Date();
    const reportIdentifier = uuid();
    const report =  newExploreReport(companyIdentifier, reportIdentifier, now);
    this.reportsService.addLocalReport(report);
    this.router.navigate(['../' + reportIdentifier], {relativeTo: this.route});
  }

  onTabClick(state: CompanyReportState) {
    this.router.navigate(['../' + this.reportsService.reportIdentifierFromPath(state.report.path)], {relativeTo: this.route});
  }

  onReportUpdate(update: CompanyReportUpdate) {
    console.log('report update', update);
    applyReportUpdate(this.reportState.report, update);
    if (this.reportState.status === SaveStatus.Clean) {
      this.reportState.status = SaveStatus.Dirty;
    }
    console.log('updated report', this.reportState.report);
  }

  onTitleChange(title: string) {
    if (title === this.reportState.report.displayName) { return; }
    this.reportState.report.displayName = title;
    if (this.reportState.status === SaveStatus.Clean) {
      this.reportState.status = SaveStatus.Dirty;
    }
  }

  async onSave() {
    switch (this.reportState.status) {
      case SaveStatus.New:
        await this.reportsService.createReport(this.reportState.report);
        this.reportsService.removeLocalReport(this.reportsService.reportIdentifierFromPath(this.reportState.report.path));
        break;
      case SaveStatus.Dirty:
        await this.reportsService.updateReport(this.reportState.report);
        break;
      default: return;
    }
    this.reportState.status = SaveStatus.Clean;
  }

  async onCancel() {
    this.reportsService.refreshReports();
  }

  async onDelete() {
    if (this.reportState.status === SaveStatus.New) {
      this.reportsService.removeLocalReport(this.reportsService.reportIdentifierFromPath(this.reportState.report.path));
    } else {
      await this.reportsService.deleteReport(this.reportState.report.path);
    }
    this.reports = this.reports.filter(r => r.path !== this.reportState.report.path);
    this.reportStates = this.reportStates.filter(r => r.report.path !== this.reportState.report.path);
    this.reportState = this.reportStates.slice().shift();
    if (this.reportStates.length) {
      this.router.navigate(['../' + this.reportsService.reportIdentifierFromPath(this.reportStates[0].report.path)], {relativeTo: this.route});
    } else {
      this.newReport();
    }
  }
}
