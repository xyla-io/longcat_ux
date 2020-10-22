import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { IOMapService } from '../../services/iomap.service';
import { ChannelOps, ChannelEnum } from 'src/app/iomap/models/channel';
import { Options, OptionConfig } from '../../../iomap/util/options';
import { IOEntityReport } from 'src/app/util/reports/io-entity-report';
import { CloneRuleInfo, CloneRuleBulkCampaignsInfo, CloneTypeEnum } from '../../models/rule';
import { PatternOps, PatternPosition } from 'src/app/util/pattern-matching';

@Component({
  selector: 'app-clone-rule',
  templateUrl: './clone-rule.component.html',
  styleUrls: ['./clone-rule.component.scss']
})
export class CloneRuleComponent implements OnInit {
  Options = Options;
  ChannelOps = ChannelOps;
  CloneTypeEnum = CloneTypeEnum;

  @Input() initialCloneInfo: CloneRuleInfo;
  @Output() cancel = new EventEmitter();
  @Output() clone = new EventEmitter<CloneRuleInfo|CloneRuleBulkCampaignsInfo>();

  entityReport: IOEntityReport;

  cloneInfo: CloneRuleInfo;
  channelSelection: ChannelEnum;
  accountPathSelection: string;
  campaignIDSelection: string | number;
  adgroupIDSelection: string | number;

  accountOptions: Record<string, OptionConfig<any>>;
  campaignOptions: Record<string, OptionConfig<any>>;
  adgroupOptions: Record<string, OptionConfig<any>>;

  shouldEnable: boolean = true;

  cloneTypeOptions: Record<CloneTypeEnum, { displayName: string }> = {
    [CloneTypeEnum.Single]: {
      displayName: 'Single',
    },
    [CloneTypeEnum.CampaignPattern]: {
      displayName: 'Campaign Pattern Match',
    },
  };
  cloneTypeSelection = CloneTypeEnum.Single;
  patternPositionOptions = PatternOps.patternPositionOptions;
  patternPositionSelection = PatternPosition.Prefix;
  patternMatchedCampaigns: string[] = [];
  firstPatternInput: string = '';
  secondPatternInput: string = '';
  showMatches = false;

  constructor(
    private ioMapService: IOMapService,
  ) { }

  ngOnInit() {
    this.entityReport = this.ioMapService.entityReport;
    if (!this.entityReport) { this.cancel.emit(); return; }

    this.cloneInfo = { ...this.initialCloneInfo };
    const accountEntity = this.entityReport.entityTree[this.cloneInfo.accountPath];
    this.channelSelection = accountEntity ? accountEntity.channel : ChannelEnum.AppleSearchAds;
    this.updateAccountOptions(this.cloneInfo);
  }

  updateAccountOptions(cloneInfo?: CloneRuleInfo) {
    const accountEntries = Object.entries(this.entityReport.entityTree);
    this.accountOptions = accountEntries.reduce((options, [k, v]) => {
      if (v.channel === this.channelSelection) {
        options[k] = { displayName: v.accountName, key: k };
      }
      return options;
    }, {});
    if (cloneInfo && cloneInfo.accountPath && this.accountOptions[cloneInfo.accountPath]) {
      this.accountPathSelection = cloneInfo.accountPath;
    } else {
      this.accountPathSelection = Object.keys(this.accountOptions)[0];
    }

    if (this.accountPathSelection) {
      this.updateCampaignOptions(cloneInfo);
    } else {
      this.campaignOptions = {};
      this.campaignIDSelection = undefined;
      this.adgroupOptions = {};
      this.adgroupIDSelection = undefined;
    }
  }

  updateCampaignOptions(cloneInfo?: CloneRuleInfo) {
    const campaignEntries = Object.entries(this.entityReport.entityTree[this.accountPathSelection].children);
    this.campaignOptions = campaignEntries.reduce((options, [k, v]) => {
      options[k] = { displayName: v.name, key: k };
      return options;
    }, {});
    if (cloneInfo && cloneInfo.campaignID && this.campaignOptions[cloneInfo.campaignID]) {
      this.campaignIDSelection = cloneInfo.campaignID
    } else {
      this.campaignIDSelection = Object.keys(this.campaignOptions)[0];
    }
    if (this.campaignIDSelection) {
      this.updateAdgroupOptions(cloneInfo);
    } else {
      this.adgroupOptions = {};
      this.adgroupIDSelection = undefined;
    }
  }

  updateAdgroupOptions(cloneInfo?: CloneRuleInfo) {
    const adgroupEntries = Object.entries(this.entityReport.entityTree[this.accountPathSelection].children[this.campaignIDSelection].children);
    this.adgroupOptions = adgroupEntries.reduce((options, [k, v]) => {
      options[k] = { displayName: v.name, key: k };
      return options;
    }, {
      '-1': { displayName: 'All', key: '-1' },
    });
    if (cloneInfo && cloneInfo.adgroupID && this.adgroupOptions[cloneInfo.adgroupID]) {
      this.adgroupIDSelection = cloneInfo.adgroupID
    } else {
      this.adgroupIDSelection = Object.keys(this.adgroupOptions)[0];
    }
  }

  onChannelSelectionChange(channel: ChannelEnum) {
    this.channelSelection = channel;
    this.updateAccountOptions();
    if (this.cloneTypeSelection === CloneTypeEnum.CampaignPattern) {
      this.setMatchedCampaigns();
    }
  }

  onAccountSelectionChange(accountPath: string) {
    this.accountPathSelection = accountPath;
    this.updateCampaignOptions()
    if (this.cloneTypeSelection === CloneTypeEnum.CampaignPattern) {
      this.setMatchedCampaigns();
    }
  }

  onCampaignSelectionChange(campaignID: string) {
    this.campaignIDSelection = campaignID;
    this.updateAdgroupOptions()
  }

  onAdgroupSelectionChange(adgroupID: string) {
    this.adgroupIDSelection = adgroupID;
  }

  onCloneTypeSelectionChange(cloneType: CloneTypeEnum) {
    this.cloneTypeSelection = cloneType;
    if (this.cloneTypeSelection === CloneTypeEnum.CampaignPattern) {
      this.setMatchedCampaigns();
    }
  }

  onPatternPositionChange(patternPosition: PatternPosition) {
    this.patternPositionSelection = patternPosition;
    this.setMatchedCampaigns();
  }

  setMatchedCampaigns() {
    this.patternMatchedCampaigns = Object.values(this.campaignOptions)
      .filter(campaign => {
        return PatternOps.patternPositionOptions[this.patternPositionSelection].isMatch(this.firstPatternInput, campaign.displayName);
      })
      .filter(campaign => {
        return campaign.displayName.includes(this.secondPatternInput);
      })
      .map(campaign => campaign.key);
  }

  onFirstPatternInputChange(event: any) {
    this.firstPatternInput = event.target.value;
    this.setMatchedCampaigns();
  }

  onSecondPatternInputChange(event: any) {
    this.secondPatternInput = event.target.value;
    this.setMatchedCampaigns();
  }


  onClickConfirm() {
    switch (this.cloneTypeSelection) {
      case CloneTypeEnum.Single:
        this.clone.emit({
          cloneType: CloneTypeEnum.Single,
          accountPath: this.accountPathSelection,
          campaignID: this.campaignIDSelection,
          adgroupID: this.adgroupIDSelection == '-1' ? undefined : this.adgroupIDSelection,
          shouldEnable: this.shouldEnable,
        })
        break;
      case CloneTypeEnum.CampaignPattern:
        this.clone.emit({
          cloneType: CloneTypeEnum.CampaignPattern,
          accountPath: this.accountPathSelection,
          campaignIDs: this.patternMatchedCampaigns,
          shouldEnable: this.shouldEnable,
        })
        break;
    }
  }

  getCloneCount() {
    if (this.cloneTypeSelection === CloneTypeEnum.Single) { return 1; }
    return this.patternMatchedCampaigns.length;
  }

  getMatchLabel() {
    return `${this.patternMatchedCampaigns.length} Campaign${this.patternMatchedCampaigns.length === 1 ? '' : 's'}`;
  }

  getMatchNames() {
    return this.patternMatchedCampaigns
        .map(id => this.campaignOptions[id])
        .filter(Boolean)
        .map(o => o.displayName)
  }

  onClickMatchLabel() {
    this.showMatches = !this.showMatches;
  }

  onEnabledChange(event) {
    this.shouldEnable = event.target.checked;
  }

  canSubmit() {
    const basicCriteria = this.accountPathSelection && this.campaignIDSelection;
    if (!basicCriteria) { return false; }
    if (this.cloneTypeSelection === CloneTypeEnum.CampaignPattern) {
      return this.patternMatchedCampaigns.length > 0;
    }
    return true;
  }
}
