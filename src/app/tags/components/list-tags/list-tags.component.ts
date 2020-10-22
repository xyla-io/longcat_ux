import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { GridApi, GridOptions, RowNode } from 'ag-grid-community';
import { Placeholder } from 'src/app/grid/interfaces/placeholder';
import { GridDefaults, GridSorting, GridOps } from 'src/app/util/grid';
import { AgGridAngular } from 'ag-grid-angular';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { SidebarContentType } from 'src/app/sidebar/factories/sidebar-content.factory';
import { SidebarService } from 'src/app/sidebar/services/sidebar.service';
import { takeUntil,} from 'rxjs/operators';
import { ChannelEnum, ChannelOps } from 'src/app/iomap/models/channel';
import { IOMapService } from 'src/app/rules/services/iomap.service';
import { NodeSwitchComponent } from 'src/app/grid/components/node-switch/node-switch.component';
import { TagParserService } from '../../services/tag-parser.service';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { IOParser, ParserOps, CreateParserEvent } from '../../models/parser';
import { EventTemplateUpdate } from 'src/app/editing/services/editing.service';
import { EntityEnum, EntityOps } from 'src/app/iomap/models/entity';
import { SessionService } from 'src/app/services/api/session.service';
import { TrackingService, TrackingEvents } from 'src/app/services/integration/tracking.service';
import { EntityService } from 'src/app/services/api/entity.service';
import { AlmacenEntityNodeWithNamingConvention } from 'src/app/util/reports/almacen-entity-report';
import { NodeTaggableEntityComponent } from '../node-taggable-entity/node-taggable-entity.component';
import { BadgeBubble } from 'src/app/grid/components/badge-category-counts/badge-category-counts.component';
import { EntityNameGroupingService } from '../../services/entity-name-grouping.service';
import { ParserNodeOps, TemplateTagParser, ParserNode } from 'src/app/grid/node-ops/parser.node';

type TagSet = any;

enum LoadingMessages {
  None = '',
  LoadingEntities = 'Loading Campaigns, Ad Groups, and Ads from Channels',
  RegroupingEntities = 'Updating Naming Convention Groupings',
}

interface GroupNodeConfig {
  showAddNode: boolean;
  onAddNode?: (fromNode: RowNode) => void;
}

interface ListTagsContextEvents {
  canDelete$: Subject<boolean>,
  parsers$: Subject<IOParser[]>,
}

interface ListTagsContext {
  bubbles: BadgeBubble[];
  leafComponent: any;
  events: ListTagsContextEvents;
  groupNodes: Record<string, GroupNodeConfig>;
}

@Component({
  selector: 'app-list-tags',
  templateUrl: './list-tags.component.html',
  styleUrls: ['./list-tags.component.scss']
})
export class ListTagsComponent implements OnInit, OnDestroy {
  SidebarContentType = SidebarContentType;
  LoadingMessages = LoadingMessages;

  private destroyed$ = new Subject();
  private gridAPI: GridApi;
  loadingMessage = LoadingMessages.LoadingEntities;
  tagsets: (TagSet|Placeholder<TagSet>)[];
  createParserModal: NgxSmartModalComponent;
  createParserChannel: ChannelEnum;
  creatingParser = false;
  parsers: IOParser[];
  companyIdentifier: string;
  groupsToRefresh: { channel: ChannelEnum, entityLevel: EntityEnum }[] = [];

  // AgGrid Sidebar
  // gridSideBar = [];
  gridSideBar = GridDefaults.defaultGridSidebar;
  // Xyla Sidebar
  sidebarContentType: SidebarContentType = SidebarContentType.Hidden;
  sidebarUpdateConfirmation$ = new Subject();


  static bubbles: BadgeBubble[] = [
    {
      class: 'light-purple',
      label: (count: number, node: RowNode) => {
        if (!count) { return ''; }
        const child = node.allLeafChildren[0];
        if (!child) { return ''; }
        const { data } = child;
        const { channel, entityLevel: entity } = data;
        return `${count} Auto-Tagged ${ChannelOps.getEntityDisplayName({
          channel, entity, plural: true,
        })}`;
      },
      count: (data) => !!data.parserName,
    },
    {
      class: 'gray',
      label: (count: number, node: RowNode) => {
        if (!count) { return ''; }
        const child = node.allLeafChildren[0];
        if (!child) { return ''; }
        const { data } = child;
        const { channel, entityLevel: entity } = data;
        return `${count} Untagged ${ChannelOps.getEntityDisplayName({
          channel, entity, plural: true,
        })}`;
    },
      count: (data) => !data.parserName,
    },
  ];

  context: ListTagsContext = {
    bubbles: ListTagsComponent.bubbles,
    leafComponent: NodeTaggableEntityComponent,
    events: {
      canDelete$: new BehaviorSubject<boolean>(false),
      parsers$: new BehaviorSubject<IOParser[]>([]),
    },
    groupNodes: {
      channel: {
        showAddNode: true,
        onAddNode: (fromNode: RowNode) => {
          this.createParserChannel = fromNode.allLeafChildren[0].data.channel;
          this.createParserModal = this.ngxSmartModalService.getModal('createParserModal');
          this.createParserModal.open();
        },
      },
      entityLevel: {
        showAddNode: false,
      },
      parserName: {
        showAddNode: false,
      },
    },
  };


  gridOptions: GridOptions = {
    context: this.context,
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
    postSort: (rowNodes: RowNode[]) => {
      const getParserChild = (node) => {
        if (!node.group) { return undefined; }
        if (node.field !== 'parserName') { return undefined; }
        const [child] = node.allLeafChildren;
        if (!child) { return undefined; }
        if (!child.data.entityLevel) { return undefined; }
        return child.data;
      };

      rowNodes.sort((nodeA, nodeB) => {
        const parserA = getParserChild(nodeA);
        if (!parserA) { return 0; }
        const parserB = getParserChild(nodeB);
        if (!parserB) { return 0; }
        // Put entities without naming convention at the bottom of the group
        if (!parserA.parserName) { return 1; }
        if (!parserB.parserName) { return -1; }
        // Sort naming conventions by parser name
        return parserA.parserName < parserB.parserName ? -1 : 1;
      });
    },

    /** Full-width rows */
    isFullWidthCell: GridOps.isFullWidthCell,
    getRowHeight: GridDefaults.makeDefaultRowHeightFunction(ListTagsComponent.computeEditTagsComponentHeight),
    fullWidthCellRenderer: 'nodeSwitchComponent',
    frameworkComponents: {
      nodeSwitchComponent: NodeSwitchComponent,
      loaderComponent: LoaderComponent,
    },
  };

  // columnDefs = GridDefaults.makeDefaultColumnDefinitions(this.iomapService).concat(
  columnDefs = GridDefaults.makeAlmacenColumnDefinitions().concat(
    [
      {
        field: 'entityLevel',
        filterValueGetter: ({data}) => {
          if (!data.entityLevel || !data.channel)  { return null; }
          return ChannelOps.getEntityDisplayName({
          entity: data.entityLevel,
          channel: data.channel,
        })
        },
        rowGroup: true,
      },
      {
        field: 'parserName',
        headerName: 'Naming Convention',
        filterValueGetter: ({ data }) => data.parserName ? ParserOps.sequenceParserKey(data.parserName) : '(No Naming Convention)',
        rowGroup: true,
      }
    ]
  );

  rowData = Object.values(ChannelEnum).map(channel => {
    return {
      _id: GridOps.channelGroupId(channel),
      channel,
      isPlaceholder: true,
    }
  });

  constructor(
    private sidebarService: SidebarService,
    private tagParserService: TagParserService,
    private ngxSmartModalService: NgxSmartModalService,
    private sessionService: SessionService,
    private entityService: EntityService,
    private entityNameGroupingService: EntityNameGroupingService,
    private trackingService: TrackingService,
  ) { }

  /*-----------------
   * Lifecycle Hooks
   *-----------------*/
  async ngOnInit() {

    this.tagParserService.parserDeletion$.pipe(
      takeUntil(this.destroyed$),
    ).subscribe(parserName => {
      if (!ParserOps.isTagParserName(parserName)) { return; }
      this.enqueueSequenceParserRefresh(parserName);
      setTimeout(() =>this.tagParserService.refreshTagParsers());
      setTimeout(async () => { try { await this.tagParserService.runStandard() } catch(e) { console.error(e); }});
    });

    this.tagParserService.parserMutation$.pipe(
      takeUntil(this.destroyed$),
    ).subscribe(mutatedParser => {
      if (!ParserOps.isTagParserName(mutatedParser.name)) { return; }
      this.enqueueSequenceParserRefresh(mutatedParser.name);
      setTimeout(() => this.tagParserService.refreshTagParsers());
      setTimeout(async () => { try { await this.tagParserService.runStandard() } catch(e) { console.error(e); }});
    });

    this.sidebarService.contentType$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(contentType => {
        this.sidebarContentType = contentType;
        this.nextCanDelete(contentType === SidebarContentType.Hidden)
      });

    this.tagParserService.tagParsers$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        this.parsers = result.result;
        this.context.events.parsers$.next(result.result)
        this.updateParsersInGrid(this.parsers || []);
        this.handleSequenceParserRefreshes();
      })

    this.sessionService.currentCompany$.subscribe(company => {
      if (this.companyIdentifier && company !== this.companyIdentifier) {
        this.loadingMessage = LoadingMessages.LoadingEntities;
        this.parsers = [];
        this.context.events.canDelete$.next(false);
        this.updateEntitiesInGrid([], true);
        this.updateParsersInGrid(this.parsers);
        this.gridAPI && this.gridAPI.showLoadingOverlay();
        this.trackPageLoad(this.companyIdentifier);
      }
      this.companyIdentifier = company;
    });

    this.entityService.entities$.subscribe(async ({ result: url }) => {
      this.context.events.canDelete$.next(false);
      if (!url) {
        this.updateEntitiesInGrid([], true);
        return;
      }
      await this.entityNameGroupingService.loadEntityReport(url);
      await this.entityNameGroupingService.parseNames(this.companyIdentifier, (nodes, companyIdentifier) => {
        if (this.companyIdentifier === companyIdentifier) {
          this.updateEntitiesInGrid(nodes);
          return false;
        }
        return true;
      }, () => {
        this.loadingMessage = LoadingMessages.None;
        this.nextCanDelete(true);
      });
    })

    this.companyIdentifier = this.sessionService.currentCompanyIdentifier;
    this.entityService.refreshEntities();
    this.tagParserService.refreshTagParsers();
    this.trackPageLoad(this.companyIdentifier);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.sidebarService.hideSidebar();
  }


  nextCanDelete(canDelete: boolean) {
    if (canDelete) {
      if (
        this.sidebarContentType === SidebarContentType.Hidden
        && this.loadingMessage === LoadingMessages.None
      ) {
        this.context.events.canDelete$.next(canDelete);
        return;
      }
    } 
    this.context.events.canDelete$.next(false);
  }

  /*-----------------
   * Update Methods
   *-----------------*/
  updateParsersInGrid(parsers: IOParser[] = []) {
    if (!this.gridAPI) { return; }
    const parserNodes = ParserNodeOps.makeNodesForTagParsers(parsers);
    GridOps.updateNodesWithTransaction<ParserNode>({
      gridAPI: this.gridAPI,
      nodeData: parserNodes,
      getNodeURL: (node) => ParserNodeOps.parserGroupIdFromNode(node),
      isSibling: ParserNodeOps.isSibling,
      clearSiblings: true,
      idProperty: '_id',
    });
  }

  updateEntitiesInGrid(nodes: AlmacenEntityNodeWithNamingConvention[], clearSiblings = false) {
    if (!this.gridAPI) { return; }
    GridOps.updateNodesWithTransaction<AlmacenEntityNodeWithNamingConvention>({
      gridAPI: this.gridAPI,
      nodeData: nodes,
      getNodeURL: (nodeDatum) => nodeDatum._id,
      isSibling: clearSiblings ? (node: RowNode) => typeof node.id === 'string' && node.id.startsWith('channel_entity://') : undefined,
      clearSiblings,
      idProperty: '_id',
    });
  }

  enqueueSequenceParserRefresh(parserName: string) {
    const channel = ParserOps.sequenceParserChannel(parserName);
    const entityLevel = ParserOps.sequenceParserEntityLevel(parserName);
    this.groupsToRefresh.push({ channel, entityLevel});
  }

  async handleSequenceParserRefreshes() {
    if (this.loadingMessage === LoadingMessages.None) {
      this.loadingMessage = LoadingMessages.RegroupingEntities;
      this.nextCanDelete(false);
    }
    for await (let group of this.groupsToRefresh) {
      await this.entityNameGroupingService.parseNamesForEntityLevel(this.companyIdentifier, group.channel, group.entityLevel, (nodes, companyIdentifier) => {
        if (companyIdentifier === this.companyIdentifier) {
          this.updateEntitiesInGrid(nodes);
          return false;
        }
        return true;
      })
    }
    if (this.loadingMessage === LoadingMessages.RegroupingEntities) {
      this.loadingMessage = LoadingMessages.None;
    }
    this.nextCanDelete(true);
    this.groupsToRefresh = [];
  }

  /*----------------
   * Event Handlers
   *----------------*/
  onGridReady(params: AgGridAngular) {
    this.gridAPI = params.api;
    this.gridAPI.sizeColumnsToFit();
    this.gridAPI.showLoadingOverlay();
    this.updateParsersInGrid(this.parsers || []);
  }

  async onTemplateUpdate({ inputTemplate, outputTemplate }: EventTemplateUpdate<TemplateTagParser>) {
    try {
      await this.tagParserService.updateTagParser(outputTemplate.structure);
      this.sidebarUpdateConfirmation$.next({ success: true, info: 'Tags applied' });
      this.sidebarService.hideSidebar();
    } catch (e) {
      this.sidebarUpdateConfirmation$.next({ success: false, info: 'Error occurred' });
    } 
  }

  async onContinueCreatingParser(event: CreateParserEvent) {
    this.creatingParser = true;
    await this.tagParserService.createTagParser(event);
    this.createParserModal.close();
    this.createParserModal = undefined;
    this.sidebarService.requestSidebar({
      contentType: SidebarContentType.EditTagParser,
      inputTemplate: ParserNodeOps.makeTemplateFromCreateParserEvent(event),
    });
    this.trackParserCreated(this.companyIdentifier);
    this.creatingParser = false;
  }

  /*----------------------
   * User Tracking Events
   *----------------------*/
  trackParserCreated(companyIdentifier: string) {
    if (!companyIdentifier) { return; }
    this.trackingService.track(TrackingEvents.TagParsersParserCreated, {
      company: companyIdentifier,
    });
  }

  trackPageLoad(companyIdentifier: string) {
    if (!companyIdentifier) { return; }
    this.trackingService.track(TrackingEvents.TagParsersPageLoaded, {
      company: companyIdentifier,
    });
  }

  /*-----------------------
   * Grid Height Functions
   *-----------------------*/
  static computeEditTagsComponentHeight(rowNode) {
    if (rowNode.data.isPlaceholder) { return 1; } // Height of 0 can crash ag-grid
    return 40;
  }


}