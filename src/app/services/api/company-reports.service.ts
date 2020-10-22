import { Injectable } from '@angular/core';
import { Subject, Observable, of, Subscription, BehaviorSubject } from 'rxjs';
import { map, switchMap, share } from 'rxjs/operators';
import { APIService, APIResponse } from './api.service';
import { SessionService } from './session.service';
import { AccessService } from 'src/app/services/access/access.service';
import { APILoaders, ObservableResult } from 'src/app/util/request-loaders/api-loaders';
import { DashboardContent } from 'src/app/dashboard/services/dashboard-content.service';
import { EmbedsService, PeriscopeEmbed, ModeEmbed, XylaEmbed } from 'src/app/services/api/embeds.service';

export interface CompanyReportsResponse extends APIResponse {
  reports: CompanyReport[];
}

export interface CompanyReport {
  path: string;
  displayName: string;
  date: Date;
  reportVersion?: number;
  content: ReportContent;
}

export interface ReportContent {
  periscope: {[x: string]: PeriscopeContent};
  mode: {[x: string]: ModeContent};
  xyla: {[x: string]: XylaContent};
  layout: {[x: string]: ReportLayout};
}

export enum LayoutOrientation {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export interface ReportLayout {
  orientation: LayoutOrientation;
  layoutIDs: string[];
}

export type UnionEmbedRecord =
  Record<string, XylaEmbed> |
  Record<string, PeriscopeEmbed> |
  Record<string, ModeEmbed>;

export interface EmbedContext {
  embeds: UnionEmbedRecord;
}

export interface PeriscopeContent {
  embed: PeriscopeEmbed;
  context: EmbedContext;
}

export interface ModeContent {
  embed: ModeEmbed;
  context: EmbedContext;
}

export type XylaContent =
  XylaEmbedContent |
  XylaGridContent |
  DashboardContent;

export interface XylaEmbedContent {
  embed: XylaEmbed;
  context: EmbedContext;
}

export interface XylaGridContent {
  metadata: Record<string, any>;
  structure: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyReportsService {
  private static reportsLoaderKey = 'reports';

  private reportsURL = `${APIService.baseURL}/reports`;
  sessionSubscription: Subscription;

  private apiLoaders: APILoaders;
  private _currentReportPath: string;
  get currentReportPath() {
    return this._currentReportPath;
  }
  localReports: BehaviorSubject<CompanyReport[]> = new BehaviorSubject([]);

  static isXylaEmbedContent(obj: any): obj is XylaEmbedContent {
    return typeof obj.embed === 'object' && EmbedsService.isXylaEmbed(obj.embed);
  }

  constructor(
    private apiService: APIService,
    private sessionService: SessionService,
    private accessService: AccessService
  ) {

    this.apiLoaders = new APILoaders(sessionService);

    this.apiLoaders.createSharedObservable<CompanyReport[]>({
      loaderKey: CompanyReportsService.reportsLoaderKey,
      callFunction: (companyIdentifier) => {
        return this.apiService.client
          .get(`${this.reportsURL}/companies/${companyIdentifier}`);
      },
      responseHandler: response => {
        return {
          result: (response as CompanyReportsResponse).reports
            .map(report => Object.assign(report, {
              date: new Date(report.date)
            })) as CompanyReport[],
        };
      },
      errorHandler: error => {
      },
    });
  }

  get reportsObservable(): Observable<ObservableResult<CompanyReport[]>> {
    return this.apiLoaders.getSharedObservable(CompanyReportsService.reportsLoaderKey).pipe(map(result => {
      const mappedResult = Object.assign({}, result) as ObservableResult<CompanyReport[]>;
      if (!mappedResult.result) { mappedResult.result = []; }
      mappedResult.result = mappedResult.result.concat(this.localReports.value);
      return mappedResult;
    }));
  }

  refreshReports() {
    this.apiLoaders.refreshLoader(CompanyReportsService.reportsLoaderKey);
  }

  setCurrentReportPath(reportPath: string) {
    this._currentReportPath = reportPath;
  }

  reportPathFromIdentifier(reportIdentifier: string): string {
    const companyIdentifier = this.sessionService.currentCompanyIdentifier;
    if (!companyIdentifier) { return null; }
    return AccessService.pathFromComponents(['companies', companyIdentifier, 'reports', reportIdentifier]);
  }

  reportIdentifierFromPath(reportPath: string): string {
    const components = AccessService.componentsFromPath(reportPath);
    return components[3];
  }

  addLocalReport(report: CompanyReport) {
    this.localReports.next(this.localReports.value.concat(report));
  }

  removeLocalReport(reportIdentifier: string) {
    this.localReports.next(this.localReports.value.filter(r => this.reportIdentifierFromPath(r.path) !== reportIdentifier));
  }

  async createReport(report: CompanyReport): Promise<CompanyReport> {
    const companyIdentifier = this.sessionService.currentCompanyIdentifier;
    if (!companyIdentifier) { throw new Error('No company identifier for new report'); }
    const reportIdentifier = this.reportIdentifierFromPath(report.path);
    return this.apiService.client.post(`${this.reportsURL}/companies/${companyIdentifier}/create/${reportIdentifier}`, report)
      .toPromise()
      .then((response: APIResponse) => (response as any).report);
  }

  async updateReport(report: CompanyReport): Promise<CompanyReport> {
    return this.apiService.client.put(`${this.reportsURL}/${report.path}`, report)
      .toPromise()
      .then((response: APIResponse) => (response as any).report);
  }

  async deleteReport(reportPath: string): Promise<void> {
    return this.apiService.client.delete(`${this.reportsURL}/${reportPath}`)
      .toPromise()
      .then((response: APIResponse) => {});
  }

}
