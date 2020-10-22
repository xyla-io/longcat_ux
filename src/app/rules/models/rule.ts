import { Task, OperatorEnum, GroupOperatorEnum, MetricEnum, ConditionGroup, TaskOps } from "./task";
import { ChannelEnum } from "../../iomap/models/channel";
import { OptionConfig } from "../../iomap/util/options";
import { _ID, ObjectRef } from "../../iomap/util/models";
import { RuleDescriptionPipe } from "../pipes/rule-description.pipe";
import { IOEntityReport, EntityTree } from "src/app/util/reports/io-entity-report";

export enum RuleGranularityEnum {
  Hourly = 'HOURLY',
  Weekly = 'WEEKLY',
}

export interface RuleMetadata {
  _id?: _ID<RuleMetadata>;
  accountName: string;
  campaignName: string;
  actionDescription: string;
  description: string;
  title?: string|null;
  adGroupName: string;
}

export interface RuleOptions {
  dynamic_window?: boolean;
}

export interface Rule {
  _id?: _ID<Rule>;
  user: ObjectRef<any>;
  dataCheckRange: number;
  granularity: RuleGranularityEnum;
  metadata: RuleMetadata;
  channel: ChannelEnum;
  account: string;
  orgID: number|string;
  campaignID: number|string;
  adgroupID: number|string;
  options: RuleOptions;
  safeMode: boolean;
  shouldMonitor: boolean;
  shouldPerformAction: boolean;
  shouldSendEmail: boolean;
  tasks: Task[];
  runInterval: number;
  isEnabled: boolean;
  lastTriggered?: Date;
  lastRun?: Date;
  modified: Date;
  created: Date;
}

const oneHourMillis = 3600000;

export interface MakeRuleMetadata extends Partial<RuleMetadata>{
  accountName: string;
  campaignName: string;
  adGroupName: string;
}

export interface MakeRule {
  channel: ChannelEnum;
  account: string;
  userID: string;
  campaignID: number|string;
  adgroupID: number|string;
  orgID: number|string;
  metadata: MakeRuleMetadata;
}

export enum CloneTypeEnum {
  Single = 'single',
  CampaignPattern = 'campaign_pattern',
}

export interface CloneRuleInfo {
  cloneType: CloneTypeEnum.Single;
  accountPath: string;
  campaignID: string|number;
  adgroupID: string|number;
  shouldEnable: boolean;
}

export interface CloneRuleBulkCampaignsInfo {
  cloneType: CloneTypeEnum.CampaignPattern;
  accountPath: string;
  campaignIDs: string[];
  shouldEnable: boolean;
}


export class RuleOps {
  static dataCheckRangeOptions: Record<number|string, OptionConfig<Rule>> = Object.freeze({
    [oneHourMillis]: { displayName: '1 hour'  },
    [oneHourMillis * 4]: { displayName: '4 hours' },
    [oneHourMillis * 12]: { displayName: '12 hours' },
    [oneHourMillis * 24]: { displayName: 'one day' },
    [oneHourMillis * 24 * 2]: { displayName: 'two days' },
    [oneHourMillis * 24 * 7]: { displayName: 'one week' },
    [oneHourMillis * 24 * 30]: { displayName: '30 days', channel: [ ChannelEnum.GoogleAds ] },
  });

  static runIntervalOptions: Record<number|string, OptionConfig<Rule>> = Object.freeze({
    [oneHourMillis]: { displayName: 'every hour'},
    [oneHourMillis * 4]: { displayName: 'every 4 hours' },
    [oneHourMillis * 8]: { displayName: 'every 8 hours' },
    [oneHourMillis * 12]: { displayName: 'every 12 hours' },
    [oneHourMillis * 24]: { displayName: 'once a day' },
    [oneHourMillis * 24 * 7]: { displayName: 'once a week' },
  });

  /**
   * booleanRuleOptions are required to have either a key or a get/set function pair
   */
  static booleanRuleOptions: Record<string, OptionConfig<Rule>> = Object.freeze({
    safeMode: { key: 'safeMode', displayName: 'Use UAC Best Practices', channel: [ ChannelEnum.GoogleAds ] },
    dynamicWindow: {
      get: (rule: Rule) => !!rule.options.dynamic_window,
      set: (rule: Rule, value: boolean) => {
        if (!rule.options) { rule.options = {}; }
        rule.options.dynamic_window = value;
      },
      displayName: 'Use Dynamic Look-Back',
      channel: [ ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
    },
    shouldSendEmail: { key: 'shouldSendEmail', displayName: 'Send Email' },
    shouldPerformAction: { key: 'shouldPerformAction', displayInverted: true, displayName: 'Dry Run' },
    shouldMonitor: { key: 'shouldMonitor', displayName: 'Debug Mode' },
  });

  static make(partial: MakeRule): Rule {
    const creationDate = new Date();
    return {
      isEnabled: false,
      user: partial.userID,
      channel: partial.channel,
      account: partial.account,
      campaignID: partial.campaignID,
      adgroupID: partial.adgroupID,
      orgID: partial.orgID,
      runInterval: oneHourMillis,
      dataCheckRange: oneHourMillis * 24,
      granularity: RuleGranularityEnum.Hourly,
      shouldPerformAction: true,
      shouldSendEmail: false,
      shouldMonitor: false,
      safeMode: true,
      created: creationDate,
      modified: null,
      tasks: [{
        actions: [TaskOps.makeAction()],
        conditionGroup: {
          subgroups: [],
          operator: GroupOperatorEnum.All,
          conditions: [{
            metric: MetricEnum.ReAVGCPA,
            metricValue: 3.5,
            operator: OperatorEnum.LessThan,
          }]
        },
      }],
      metadata: {
        ...partial.metadata,
        actionDescription: '',
        description: '',
      },
      options: {},
    };

  }

  static clone(cloneInfo: CloneRuleInfo, existingRule: Rule, entityTree: EntityTree): Rule {
    const clone = {
      ...existingRule,
      campaignID: cloneInfo.campaignID,
      adgroupID: cloneInfo.adgroupID,
      account: cloneInfo.accountPath,
      orgID: entityTree[cloneInfo.accountPath].id,
      channel: entityTree[cloneInfo.accountPath].channel,
      isEnabled: cloneInfo.shouldEnable,
      modified: null,
    };
    delete clone._id;
    delete clone.lastTriggered;
    delete clone.lastRun;
    delete clone.created;
    const { channel } = entityTree[cloneInfo.accountPath];
    clone.tasks = clone.tasks.map(task => {
      return {
        ...task,
        conditionGroup: {
          ...(task.conditionGroup as ConditionGroup),
          conditions: (task.conditionGroup as ConditionGroup).conditions.map(condition => {
            const channelFilters = TaskOps.metricOptions[condition.metric].channel;
            if (channelFilters && !channelFilters.includes(channel)) {
              return {
                ...condition,
                metric: MetricEnum.TotalSpend,
              }
            }
            return condition;
          }),
        },
        actions: task.actions.map(action => {
          const channelFilters =  TaskOps.actionOptions[action.action].channel;
          if (channelFilters && !channelFilters.includes(channel)) {
            return TaskOps.makeAction();
          }
          return action;
        }),
      };
    })
    return clone;
  }

  static prepareForSave(rule: Rule, report: IOEntityReport) {
    const accountEntity = report.entityTree[rule.account];
    const campaignEntity = accountEntity ? accountEntity.children[rule.campaignID] : undefined;
    const adgroupEntity = campaignEntity ? campaignEntity.children[rule.adgroupID] : undefined;

    let adgroupName;
    if (campaignEntity && adgroupEntity) {
      adgroupName = adgroupEntity.name;
    } else if (campaignEntity) {
      adgroupName = 'All';
    } else {
      adgroupName = rule.metadata.adGroupName;
    }

    rule.metadata.accountName = accountEntity ? accountEntity.accountName : rule.metadata.accountName;
    rule.metadata.campaignName = campaignEntity ? campaignEntity.name : rule.metadata.campaignName;
    rule.metadata.adGroupName = adgroupName;
    rule.metadata.description = '',
    // Do this last
    rule.metadata.actionDescription = new RuleDescriptionPipe().transform(rule);
  }

}
