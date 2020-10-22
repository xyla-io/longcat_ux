import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { cloneDeep } from 'lodash-es';
import {
  CompanyReportsService,
  CompanyReport,
  ReportContent,
  ReportLayout } from 'src/app/services/api/company-reports.service';
import { LayoutElement } from '../report-layout/report-layout.component';
import {
  EmbedsService,
  Embeds,
  PeriscopeEmbed,
  ModeEmbed,
  XylaEmbed,
} from 'src/app/services/api/embeds.service';
import { ReportElement, ReportElementType  } from 'src/app/services/api/report-element.service';
import { ErrorService } from 'src/app/services/alerts/error.service';
import { TrackingService, TrackingEvents } from 'src/app/services/integration/tracking.service';
import { CompanyReportUpdate } from '../../models/report';

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.css']
})
export class ViewReportComponent implements OnInit, OnDestroy {
  @Output() reportUpdate = new EventEmitter<CompanyReportUpdate>();

  private destroyed = new Subject();
  reportPath: string;
  report: CompanyReport;
  topLevelLayout: ReportElement;
  refreshTimer: any;

  constructor(
    private reportsService: CompanyReportsService,
    private embedsService: EmbedsService,
    private trackingService: TrackingService,
    private errorService: ErrorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.destroyed))
      .subscribe((params: ParamMap) => {
        const reportIdentifier = params.get('type');
        this.reportPath = this.reportsService.reportPathFromIdentifier(reportIdentifier);
        this.reportsService.setCurrentReportPath(this.reportPath);
        this.reportsService.refreshReports();
      });

    this.reportsService.reportsObservable
      .pipe(takeUntil(this.destroyed))
      .subscribe(observableResult => {
        this.report = (observableResult.result || [])
          .filter(report => report.path === this.reportPath)
          .pop();

        if (!this.report) { return; }

        const embedId = this.extractPeriscopeDashboardIds()[0];

        this.trackingService.track(TrackingEvents.ReportLoaded, {
          path: this.report.path,
          displayName: this.report.displayName,
          identifier: this.reportsService.reportIdentifierFromPath(this.report.path),
          embedId: embedId,
        });

        this.refreshReport();
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private refreshReport() {
    if (!this.refreshTimer) {
      this.refreshTimer = setTimeout(async () => {
        if (!this.report) { return; }
        const content = this.report.content;
        const embeds: Embeds = {
          mode: {},
          periscope: {},
          xyla: {},
        };
        Object.keys(content.periscope).forEach(uid => {
          embeds.periscope[uid] = content.periscope[uid].embed as PeriscopeEmbed;
        });
        Object.keys(content.mode).forEach(uid => {
          embeds.mode[uid] = content.mode[uid].embed as ModeEmbed;
        });
        Object.keys(content.xyla).forEach(uid => {
          const xylaContent = content.xyla[uid];
          if (CompanyReportsService.isXylaEmbedContent(xylaContent)) {
            embeds.xyla[uid] = xylaContent.embed as XylaEmbed;
          }
        });
        try {
          const signedEmbeds = await this.embedsService.signEmbeds(embeds);
          this.generateRenderContent(signedEmbeds);
        } catch (error) {
          this.errorService.presentError(error);
        }
        finally {
          this.refreshTimer = null;
        }
      }, 500);
    }
  }

  private generateRenderContent(embeds: Embeds) {
    const root = this.findRootLayout(this.report.content);
    const layoutHierarchy = this.buildLayout(root, embeds);
    this.topLevelLayout = layoutHierarchy;
  }

  private buildLayout(layout: ReportLayout, embeds: Embeds): LayoutElement {
    const layoutElement: LayoutElement = {
      type: ReportElementType.Layout,
      layout: layout,
      children: [],
    };

    layout.layoutIDs.forEach(targetUid => {
      const foundContent = ['mode', 'periscope', 'xyla'].some(contentType => {
        const foundUid = Object.keys(this.report.content[contentType]).find(uid => uid === targetUid);
        if (!foundUid) { return false; }
        const child: ReportElement = {
          type: (`${contentType}_content`) as ReportElementType,
          content: cloneDeep(Object.assign({}, this.report.content[contentType][foundUid], {
            context: {
              embeds: embeds[contentType],
              elementUID: foundUid,
              reportUpdate: this.reportUpdate,
            },
          })),
        };
        const embed = embeds[contentType][foundUid];
        if (embed) {
          child.embed = embed;
        }
        layoutElement.children.push(child);
        return true;
      });
      if (!foundContent) {
        const childLayout = this.report.content.layout[targetUid];
        layoutElement.children.push(this.buildLayout(childLayout, embeds));
      }
    });
    return layoutElement;
  }

  private findRootLayout(content: ReportContent): ReportLayout {
    const layoutReferencedIDs = [];
    Object.keys(content.layout).forEach(uid => {
      layoutReferencedIDs.push(...content.layout[uid].layoutIDs);
    });
    const root = content.layout[Object.keys(content.layout).find(uid => !layoutReferencedIDs.includes(uid))];
    return root;
  }

  private extractPeriscopeDashboardIds() {
    return Object.keys(this.report.content.periscope).map(key => {
      return this.report.content.periscope[key].embed.dashboardID;
    });
  }
}
