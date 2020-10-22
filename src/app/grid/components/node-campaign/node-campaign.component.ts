import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { _ID } from 'src/app/iomap/util/models';
import { RowNode } from 'ag-grid-community';
import { Rule, RuleOps } from 'src/app/rules/models/rule';
import { DragonAPIService } from 'src/app/rules/services/dragon-api.service';
import { RulesService } from 'src/app/rules/services/rules.service';
import { IOMapService } from 'src/app/rules/services/iomap.service';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';
import { Placeholder } from 'src/app/grid/interfaces/placeholder';
import { BadgeBubble } from 'src/app/grid/components/badge-category-counts/badge-category-counts.component';
import { GridGroup } from '../../interfaces/grid-group.abstract';

@Component({
  selector: 'app-node-campaign',
  templateUrl: './node-campaign.component.html',
  styleUrls: ['./node-campaign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeCampaignComponent extends GridGroup implements OnInit {

  @Input() campaignID: number;
  campaignName: string;

  constructor(
    changeDetector: ChangeDetectorRef,
    private dragonAPI: DragonAPIService,
    private rulesService: RulesService,
    public ioMapService: IOMapService,
    private alertService: UserAlertService,
  ) {
    super(changeDetector);
  }

  ngOnInit() {
    super.ngOnInit();
    const childRule = this.node.allLeafChildren[0].data as Rule;
    this.campaignName = childRule.metadata.campaignName;
    this.changeDetector.detectChanges();
  }

}
