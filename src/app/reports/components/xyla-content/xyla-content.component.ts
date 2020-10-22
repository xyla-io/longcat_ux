import {
  Component,
  OnInit,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  Input,
  Renderer2,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { Subject, ReplaySubject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';
import { TemplateBreakdownTable } from 'src/app/dashboard/services/breakdown-table.service';
import {
  TemplateType,
  TemplateGroup,
  BlockTemplate,
} from 'src/app/dashboard/interfaces/template';
import {
  EventTemplateUpdate,
  EventTemplateUpdateApplied,
} from 'src/app/editing/services/editing.service';
import { DashboardContent, DashboardContentService } from 'src/app/dashboard/services/dashboard-content.service';
import { ReportElement } from 'src/app/services/api/report-element.service';
import { SidebarContentType } from 'src/app/sidebar/factories/sidebar-content.factory';
import { SidebarService } from 'src/app/sidebar/services/sidebar.service';
import { MasterTemplateService } from 'src/app/dashboard/services/master-template.service';
import { EnhancedTemplateMaster } from 'src/app/dashboard/interfaces/master';
import { TemplateService } from 'src/app/dashboard/services/template.service';
import { compareObjects } from 'src/app/util/hash.util';
import { RowFilterOps } from 'src/app/dashboard/workers/util/row-filter';
import { hasChoicesCrate, hasValueSelectionCrate } from 'src/app/dashboard/interfaces/filter';


export interface XylaElement extends ReportElement {
  content: DashboardContent;
}

@Component({
  selector: 'app-xyla-content',
  templateUrl: './xyla-content.component.html',
  styleUrls: ['./xyla-content.component.scss'],
})
export class XylaContentComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  SidebarContentType = SidebarContentType;

  @Input() element: XylaElement;
  @Input() reportPath: string;

  sidebarContentType: SidebarContentType = SidebarContentType.Hidden;
  sidebarUpdateConfirmation$: ReplaySubject<EventTemplateUpdateApplied> = new ReplaySubject();
  destroyed$ = new Subject();
  dashboardContent: DashboardContent;
  // TODO: make this a set
  templateDataRefreshingMap = {};
  floatingMenuCollapsed = false;

  get showDashboardOptions() { return this.showDashboardOptions$.value; }
  @ViewChildren('dashboardColumn') columns: QueryList<ElementRef>;
  masterTemplate: EnhancedTemplateMaster;
  showDashboardOptions$ = new BehaviorSubject(false);

  constructor(
    private dashboardContentService: DashboardContentService,
    private masterTemplateService: MasterTemplateService,
    private sidebarService: SidebarService,
    private templateService: TemplateService,
    private renderer: Renderer2,
  ) { }

  async ngOnInit() {
    this.sidebarService.contentType$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(contentType => {
        this.sidebarContentType = contentType;
      });

    this.masterTemplateService.masterTemplateUpdate$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(updatedMaster => {
        if (!TemplateService.isSameTemplate(updatedMaster, this.masterTemplate)) { return; }
        if (compareObjects(updatedMaster, this.masterTemplate)) { return; }
        this.reloadDashboardContent();
      });
  }

  async ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.sidebarService.hideSidebar();
  }

  async ngOnChanges() {
    await this.reloadDashboardContent();
  }

  ngAfterViewInit() {
    combineLatest([
      this.showDashboardOptions$,
      this.columns.changes,
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([showDashboardOptions, columns]) => {
        if (showDashboardOptions) {
          columns.forEach(column => {
            this.renderer.setStyle(column.nativeElement, 'padding-top', `${40}px`);
          });
        }
      });
  }

  async reloadDashboardContent() {
    this.dashboardContent = await this.dashboardContentService.initDashboardContent(
      this.reportPath,
      this.element.content
    );
    this.masterTemplate = await this.masterTemplateService.getMasterTemplate(this.dashboardContent.structure.groups.summaryPanel);
    this.showDashboardOptions$.next(this.determineIfShouldShowDashboardOptions());
  }

  determineIfShouldShowDashboardOptions() {
    const rowFilterSet = this.templateService.getRowFilterSet(this.masterTemplate);
    return RowFilterOps.shouldShowProductNameFilter(rowFilterSet);
  }

  async onTemplateUpdate(eventTemplateUpdate: EventTemplateUpdate<BlockTemplate>) {
    const templateType = eventTemplateUpdate.outputTemplate.metadata.templateType;

    this.templateDataRefreshingMap[eventTemplateUpdate.inputTemplate.path] = true;
    this.sidebarService.updateInputTemplate(eventTemplateUpdate.outputTemplate);

    await this.dashboardContentService.postTemplateUpdate(
      this.reportPath,
      eventTemplateUpdate,
    );

    const handler = new Map<string, Function>([
      [TemplateType.BreakdownTable, this.onTemplateBreakdownTableUpdated],
      [TemplateType.Group, this.onTemplateGroupUpdate],
    ]).get(templateType);
    if (handler) {
      handler.call(this,
        eventTemplateUpdate.inputTemplate,
        eventTemplateUpdate.outputTemplate
      );
    }

    this.templateDataRefreshingMap[eventTemplateUpdate.inputTemplate.path] = false;

    this.sidebarUpdateConfirmation$.next({
      success: true,
      info: 'View updated',
    });
  }

  onTemplateGroupUpdate(inputTemplate: TemplateGroup<BlockTemplate>, outputTemplate: TemplateGroup<BlockTemplate>) {
    const { groups } = this.dashboardContent.structure;
    const { groupKey } = inputTemplate.metadata.more;
    groups[groupKey] = cloneDeep(outputTemplate);
  }

  onTemplateBreakdownTableUpdated(inputTemplate: TemplateBreakdownTable, outputTemplate: TemplateBreakdownTable) {
    const { templates } = this.dashboardContent.structure.decks.breakdownTable.structure;
    const index = templates.findIndex(template => {
      return template.metadata.identifier === inputTemplate.metadata.identifier;
    });
    templates[index] = outputTemplate;
  }

  async onClickEditSummary() {
    this.sidebarService.requestSidebar({
      contentType: SidebarContentType.EditSummaryPanel,
      inputTemplate: this.dashboardContent.structure.groups.summaryPanel,
    });
  }

  onClickCollapse() {
    this.floatingMenuCollapsed = !this.floatingMenuCollapsed;
  }
}
