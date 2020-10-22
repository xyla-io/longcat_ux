import { Component, OnInit, OnDestroy } from '@angular/core';
import { RulesService } from '../../services/rules.service';
import { Rule, RuleOps, } from '../../models/rule';
import { Placeholder, PlaceholderOps } from 'src/app/grid/interfaces/placeholder';
import { Credential } from 'src/app/iomap/models/credential';
import { AgGridAngular } from 'ag-grid-angular';
import { NodeSwitchComponent } from 'src/app/grid/components/node-switch/node-switch.component';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { DragonAPIService } from '../../services/dragon-api.service';
import { CredentialService } from '../../services/credential.service';
import { CertificateService } from '../../services/certificate.service';
import { AdgroupService } from '../../services/adgroup.service';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { GridApi, ColumnApi, GridOptions, RowNode } from 'ag-grid-community';
import { IOMapService, CacheOptions } from '../../services/iomap.service';
import { IOEntityReport } from 'src/app/util/reports/io-entity-report';
import { SessionService } from 'src/app/services/api/session.service';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';
import { EditRuleComponent } from '../edit-rule/edit-rule.component';
import { NodeRuleComponent } from '../node-rule/node-rule.component';
import { NotificationService } from '../../services/notification.service';
import { GridDefaults, GridSorting, GridOps } from 'src/app/util/grid';
import { BadgeBubble } from '../../../grid/components/badge-category-counts/badge-category-counts.component';
import { ViewModeEnum } from 'src/app/grid/interfaces/grid-leaf.interface';

@Component({
  selector: 'app-list-rules',
  templateUrl: './list-rules.component.html',
  styleUrls: ['./list-rules.component.scss']
})
export class ListRulesComponent implements OnInit, OnDestroy {

  rules: (Rule|Placeholder<Rule>)[];
  private destroyed$ = new Subject();
  private gridAPI: GridApi;
  private gridColumnAPI: ColumnApi;
  loadingNewEntities = true;
  iomapSubscription: Subscription;
  sideBar = GridDefaults.defaultGridSidebar;

  static bubbles: BadgeBubble[] = [
    {
      class: 'light-purple',
      label: 'active rule',
      count: (rule) => rule.isEnabled && rule.shouldPerformAction,
    },
    {
      class: 'orange',
      label: 'dry run rule',
      count: (rule) => rule.isEnabled && !rule.shouldPerformAction,
    },
    {
      class: 'yellow',
      label: 'new rule',
      count: (rule) => !rule.isEnabled && !rule.modified,
    },
    {
      class: 'gray',
      label: 'inactive rule',
      count: (rule) => !rule.isEnabled && rule.modified,
    },
  ];

  gridOptions: GridOptions = {
    getRowNodeId: (data) => data._id,
    enableCellChangeFlash: true,
    animateRows: false,
    loadingOverlayComponent: 'loaderComponent',
    loadingOverlayComponentParams: { size: 34 },
    suppressContextMenu: true,
    defaultColDef: GridDefaults.defaultColDef,
    headerHeight: 0,

    /** Grouping */
    groupUseEntireRow: true,
    rememberGroupStateWhenNewData: true,
    rowGroupPanelShow: 'never', // 'never'|'always'|'onlyWhenGrouping'
    groupDefaultExpanded: 1,
    defaultGroupSortComparator: GridSorting.defaultGroupSortComparator,

    /** Sorting */
    postSort: GridSorting.defaultPostSort,

    /** Full-width rows */
    isFullWidthCell: GridOps.isFullWidthCell,
    getRowHeight: GridDefaults.makeDefaultRowHeightFunction(ListRulesComponent.computeEditRuleComponentHeight),
    fullWidthCellRenderer: 'nodeSwitchComponent',
    frameworkComponents: {
      nodeSwitchComponent: NodeSwitchComponent,
      loaderComponent: LoaderComponent,
    },
    context: {
      bubbles: ListRulesComponent.bubbles,
      leafComponent: NodeRuleComponent,
      groupNodes: {
        channel: { showAddNode: false },
        account: { showAddNode: false },
        campaignID: {
          showAddNode: true,
          onAddNode: async (fromNode: RowNode) => {
            this.createNewRule(fromNode, true);
          },
         },
        adgroupID: {
          showAddNode: true,
          onAddNode: async (fromNode: RowNode) => {
            this.createNewRule(fromNode);
          }
         },
      }
    },
  };

  columnDefs = GridDefaults.makeIOMapColumnDefinitions(this.iomapService).concat(
    [
      {
        headerName: 'Show Rules Only',
        filterValueGetter: (params) => params.data.isPlaceholder ? 'Show All Entities' : 'Show Rules',
        field: 'isPlaceholder',
      }
    ]
  );

  constructor(
    public rulesService: RulesService,
    public notificationService: NotificationService,
    public dragonAPI: DragonAPIService,
    public credentialService: CredentialService,
    public certificateService: CertificateService,
    public iomapService: IOMapService,
    public adgroupService: AdgroupService,
    public sessionService: SessionService,
    private alertService: UserAlertService,
  ) { }


  ngOnInit() {
    this.rulesService.ruleMutation$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mutatedRule) => {
        this.gridAPI.applyTransaction({ update: [ mutatedRule ] });
      });

    this.rulesService.ruleDeletion$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((deletedRuleID) => {
        this.gridAPI.applyTransaction({ remove: [ { _id: deletedRuleID }] });
      });

    this.rulesService.ruleCreation$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((createdRule) => {
        this.gridAPI.applyTransaction({ add: [ createdRule ] });
      });

    this.credentialService.credentials$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async credentialsResult => {
        if (this.iomapSubscription) {
          this.iomapSubscription.unsubscribe();
        }
        const accounts = credentialsResult.result;
        this.gridAPI && this.gridAPI.showLoadingOverlay();
        if (!accounts) {
          this.gridAPI && this.gridAPI.setRowData([]);
          this.loadingNewEntities = false;
          return;
        }
        this.loadingNewEntities = true;
        const rules = await this.loadRules();
        const oneDay = 1000 * 60 * 60 * 24; 
        const makeCacheExpire = (days) => (new Date()).getTime() + (oneDay * days);
        this.loadEntityReport(accounts, {
          cacheexpire: makeCacheExpire(28),
        }, (cachedReport) => {
          const cachedPlaceholderRules = PlaceholderOps.placeholdersFromReport<Rule>(cachedReport);
          this.gridAPI.setRowData(rules);
          this.gridAPI.applyTransaction({ add: cachedPlaceholderRules });
          this.loadEntityReport(accounts, { 
            cachetime: new Date().getTime(),
            cacheexpire: makeCacheExpire(28),
          },(report) => {
            const placeholderRules = PlaceholderOps.placeholdersFromReport(report);
            this.gridAPI.applyTransaction({ remove: cachedPlaceholderRules });
            this.gridAPI.applyTransaction({ add: placeholderRules });
            this.loadingNewEntities = false;
          });
        });
      });

    this.dragonAPI.session$.subscribe(session => {
      if (session) {
        this.credentialService.refreshCredentials();
      }
    });
  }

  loadEntityReport(accounts: Credential[], cacheOptions: CacheOptions, cb: (report: IOEntityReport) => void) {
    if (this.iomapSubscription) {
      this.iomapSubscription.unsubscribe();
    }
    this.iomapSubscription = this.iomapService.getEntityReport(accounts, cacheOptions)
      .pipe(takeUntil(this.destroyed$))
      .pipe(catchError(e => {
        return of(null);
      }))
      .subscribe((report: IOEntityReport|null) => {
        if (!report) {
          this.loadingNewEntities = false;
          return;
        }
        cb(report)
      });
  }
    
  async loadRules() {
    try {
      const trailingNotificationDays = NotificationService.trailingActivityDays;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - trailingNotificationDays)
      await this.notificationService.getNofificationCounts(startDate, { invalidateCache: true });
      const rules = await this.rulesService.getRules();
      return rules;
    } catch (e) {
      this.postRuleLoadError();
      return [];
    }
  }

  async createNewRule(fromNode: RowNode, campaignLevel=false) {
    const sibling = fromNode.allLeafChildren[0].data as Rule|Placeholder<Rule>;
    const newRule = RuleOps.make({
      channel: sibling.channel,
      account: sibling.account,
      campaignID: sibling.campaignID,
      adgroupID: campaignLevel ? undefined : sibling.adgroupID,
      orgID: sibling.orgID,
      userID: this.dragonAPI.session._id,
      metadata: sibling.metadata,
    })
    console.log(newRule);
    try {
      await this.rulesService.create(newRule);
      fromNode.setExpanded(true);
    } catch (error) {
      console.log('error creating rule', error)
      this.alertService.postAlert({
        alertType: UserAlertType.error,
        header: 'Problem creating rule',
        body: 'An error ocurred while attempting to create a rule',
      })
    }
  }

  postRuleLoadError() {
    this.alertService.postAlert({
      alertType: UserAlertType.error,
      header: 'Problem loading rules',
      body: 'An error occurred when trying to load rules.'
    });
  }

  postReportLoadError() {
    this.alertService.postAlert({
      alertType: UserAlertType.error,
      header: 'Problem loading account information',
      body: 'A server error occurred when trying to load your account information.'
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onGridReady(params: AgGridAngular) {
    this.gridAPI = params.api;
    this.gridColumnAPI = params.columnApi;
    this.gridAPI.sizeColumnsToFit();
    this.gridAPI.showLoadingOverlay();
  }

  static computeEditRuleComponentHeight(rowNode) {
    if (rowNode.data.isPlaceholder) { return 1; } // Height of 0 can crash ag-grid

    const defaultViewMode = !rowNode.data.modified ? ViewModeEnum.Expanded : NodeRuleComponent.defaultViewMode;
    const viewMode = rowNode.viewMode ? rowNode.viewMode : defaultViewMode;

    switch (viewMode) {
      case ViewModeEnum.Collapsed:
        return NodeRuleComponent.viewHeight();
      case ViewModeEnum.Expanded:
      default:
        return EditRuleComponent.viewHeight();
    }
  }

}
