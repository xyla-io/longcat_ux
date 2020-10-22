import { Component,  Input, ChangeDetectorRef } from '@angular/core';
import { GridGroup } from '../../interfaces/grid-group.abstract';
import { ParserOps, IOParser } from 'src/app/tags/models/parser';
import { ViewMode } from 'src/app/shared/components/badge-parser-key/badge-parser-key.component';
import { TagParserService } from 'src/app/tags/services/tag-parser.service';
import { SidebarService } from 'src/app/sidebar/services/sidebar.service';
import { SidebarContentType } from 'src/app/sidebar/factories/sidebar-content.factory';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { takeWhile, takeUntil } from 'rxjs/operators';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';
import { EntityOps, EntityEnum } from 'src/app/iomap/models/entity';
import { ChannelEnum } from 'src/app/iomap/models/channel';
import { GridApi } from 'ag-grid-community';
import { NodeType } from 'src/app/util/reports/almacen-entity-report';
import { ParserNode, ParserNodeOps } from '../../node-ops/parser.node';

@Component({
  selector: 'app-node-tag-group',
  templateUrl: './node-tag-group.component.html',
  styleUrls: ['./node-tag-group.component.scss']
})
export class NodeTagGroupComponent extends GridGroup {
  ParserOps = ParserOps;
  EntityOps = EntityOps;
  ViewMode = ViewMode;

  @Input() parserName: string;
  data: ParserNode;
  isDeleting = false;
  parsers: IOParser[];
  confirmDeleteModal: NgxSmartModalComponent;

  get delimiter() {
    return this.data.key_map.construct.delimiter.replace('str.', '');
  }

  get entityLevel(): EntityEnum|'' {
    if (this.data.entityLevel) { return this.data.entityLevel; }
    if (!this.parserName) { return ''; }
    return ParserOps.sequenceParserEntityLevel(this.data);
  }

  get parserKey() {
    if (!this.parserName) { return ''; }
    return ParserOps.sequenceParserKey(this.data);
  }

  constructor(
    changeDetector: ChangeDetectorRef,
    private tagParserService: TagParserService,
    private sidebarService: SidebarService,
    private ngxSmartModalService: NgxSmartModalService,
    private userAlertService: UserAlertService,
  ) {
    super(changeDetector);
  }

  async ngOnInit() {
    super.ngOnInit();
    this.data = this.node.allLeafChildren[0].data as ParserNode;

    this.context.events.parsers$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((parsers) => {
        this.parsers = parsers;
      })

    this.tagParserService.parserMutation$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(parser => {
        if (!ParserOps.isTagParserName(parser.name)) { return; }
        if (parser.name === this.parserName) {
          this.refreshParseResults();
        }
      })

    try { this.changeDetector.detectChanges(); } catch {}
  }

  async onExpandedChanged(expanded: boolean) {
    if (expanded && this.parserName) {
      await this.refreshParseResults();
    }
  }

  async refreshParseResults() {
    const entityNodes = this.node.allLeafChildren
      .filter(node => node.data.nodeType === NodeType.ChannelEntity)
    const names = entityNodes.map(node => node.data.name);
    const parseResults = await this.tagParserService.parseNames(this.parserName, names);
    const updatedNodes = entityNodes.map(node => ({
      ...node.data,
      tags: parseResults.name_tags[node.data.name] || {},
    }));
    ((this.node as any).gridApi as GridApi).applyTransaction({
      update: updatedNodes,
    });
  }

  onClickOpenConfiguration(event: MouseEvent, parsers: IOParser[]) {
    event.stopPropagation();
    // Flash the sidebar by quickly hiding and showing
    this.sidebarService.hideSidebar();
    setTimeout(() => this.sidebarService.requestSidebar({
      contentType: SidebarContentType.EditTagParser,
      inputTemplate: ParserNodeOps.makeTemplateFromParser(parsers, this.data),
    }), 40);
  }

  async onClickDelete(event: MouseEvent, parsers: IOParser[]) {
    event.stopPropagation();
    this.confirmDeleteModal = this.ngxSmartModalService.getModal('confirmDeleteModal');
    this.confirmDeleteModal.removeData();
    this.confirmDeleteModal.setData({ channel: this.channel, parserKey: this.parserKey }, true);
    this.confirmDeleteModal.closable = true;
    this.confirmDeleteModal.escapable = true;
    this.confirmDeleteModal.dismissable = true;
    this.confirmDeleteModal.open();
    this.confirmDeleteModal.onDataAdded.pipe(
      takeWhile(data => !data.confirm, true),
      takeUntil(this.confirmDeleteModal.onDismiss),
      takeUntil(this.confirmDeleteModal.onEscape),
      takeUntil(this.confirmDeleteModal.onClose),
      takeUntil(this.destroyed$),
    ).subscribe(data => {
      if (data.confirm === true) {
        this.confirmDeleteModal.closable = false;
        this.confirmDeleteModal.escapable = false;
        this.confirmDeleteModal.dismissable = false;
        this.confirmDeleteModal.setData({ saving: true }, true);
        this.onClickDeleteConfirm();
      }
    });
  }

  async onClickDeleteConfirm() {
    this.isDeleting = true;
    this.sidebarService.hideSidebar();
    try {
      await this.tagParserService.deleteTagParser(this.data);
    } catch (error) {
      console.error(error);
      this.userAlertService.postAlert({
        alertType: UserAlertType.error,
        header: 'System Error',
        body: 'An error ocurred while attempting to delete the parser',
      })
    }
    this.confirmDeleteModal.close();
  }

}