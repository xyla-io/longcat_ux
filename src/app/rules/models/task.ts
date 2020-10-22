import { OptionConfig, Options } from "../../iomap/util/options";
import { ChannelEnum } from "../../iomap/models/channel";
import { _ID, ObjectRef } from "../../iomap/util/models";
import { Rule } from "./rule";

export enum TaskSetType {
  Simple = 'simple',
  CruiseControl = 'cruiseControl',
}

export enum ActionEnum {
  IncBid = 'inc_bid',
  DecBid = 'dec_bid',
  IncCPAGoal = 'inc_cpa_goal',
  DecCPAGoal = 'dec_cpa_goal',
  IncCPAGoalCampaign = 'inc_cpa_goal_campaign',
  DecCPAGoalCampaign = 'dec_cpa_goal_campaign',
  IncCampaignBudget = 'increase_campaign_budget',
  DecCampaignBudget = 'decrease_campaign_budget',
  PauseKeyword = 'pause_keyword',
  PauseCampaign = 'pause_campaign',
  NoAction = 'no_action',
}

export enum MetricEnum {
  ReAVGCPA = 'reavgCPA',
  ReAVGCPT = 'reavgCPT',
  ReAVGCPM = 'reavgCPM',
  ReAVGTTR = 'reavgTTR',
  ReAVGConverstionRate = 'reavgConversionRate',
  TotalSpend = 'totalSpend',
  TotalImpressions = 'totalImpressions',
  TotalTaps = 'totalTaps',
  TotalConversions = 'totalConversions',
}

export enum MetricTypeEnum {
  Currency = 'currency',
  Percentage = 'percentage',
  Count = 'count',
}

export enum OperatorEnum {
  Equal = 'equal',
  LessThan = 'less',
  GreaterThan = 'greater',
  LessThanOrEqual = 'leq',
  GreaterThanOrEqual = 'geq',
}

export enum GroupOperatorEnum {
  All = 'all',
  Any = 'any',
}

export interface Action {
  _id?: _ID<Action>;
  adjustmentLimit: number;
  adjustmentValue: number;
  action: ActionEnum;
}

export interface Task {
  _id?: _ID<Task>;
  conditionGroup: ObjectRef<ConditionGroup>;
  actions: Action[];
}

export interface ConditionGroup {
  _id?: _ID<ConditionGroup>;
  conditions: Condition[];
  operator: GroupOperatorEnum;
  subgroups: ObjectRef<ConditionGroup>[];
}

export interface Condition {
  _id?: _ID<Condition>;
  metric: MetricEnum;
  metricValue: number;
  operator: OperatorEnum;
}

export interface TaskOptionConfig extends OptionConfig<Task> {
  displayName: string;
  icon: string;
  set: (rule: Rule) => void;
}

export interface ActionOptionConfig extends OptionConfig<Task> {
  displayName: string;
  complement: string;
  params: { adjustmentValue?: MetricTypeEnum, adjustmentLimit?: MetricTypeEnum };
  shorthandDescription: string,
}

export interface MetricOptionConfig extends OptionConfig<Task> {
  displayName: string;
  metricType: MetricTypeEnum;
  channel: ChannelEnum[];
  shorthandDescription?: string;
}

export interface OperatorOptionConfig extends OptionConfig<Task> {
  displayName: string;
  complement: OperatorEnum;
  shorthandDescription?: string;
}

export interface GroupOperatorOptionConfig extends OptionConfig<Task> {
  displayName: string;
  shorthandDescription: string;
}

export class TaskOps {
  static taskSetTypeOptions: Record<string, TaskOptionConfig> = Object.freeze({
    [TaskSetType.Simple]: {
      displayName: 'Custom',
      icon: 'gavel',
      set: (rule: Rule) => {
        console.log('turning off cruise control');
        rule.tasks.length = 1;
      }
    },
    [TaskSetType.CruiseControl]: {
      displayName: 'Cruise',
      icon: 'car',
      set: (rule: Rule) => {
        if (rule.tasks.length === 1) {
          console.log('turning on cruise control');
          const [ task1 ] = rule.tasks;
          (task1.conditionGroup as ConditionGroup).conditions.length = 1;
          const [ condition1 ] = (task1.conditionGroup as ConditionGroup).conditions;
          condition1.operator = OperatorEnum.GreaterThan;
          const [ action1 ] = task1.actions;
          const { metric, metricValue } = condition1;
          const { adjustmentLimit, adjustmentValue, action } = action1;

          const noAction: Action = {
            action: ActionEnum.NoAction,
            adjustmentValue: 0,
            adjustmentLimit: 0,
          };

          const complementAction: Action = {
            action: Options.complement<ActionEnum>(TaskOps.actionOptions, action),
            adjustmentValue,
            adjustmentLimit,
          }

          rule.tasks.push(...[
            {
              actions: [ noAction ],
              conditionGroup: {
                conditions: [
                  {
                    metric,
                    metricValue,
                    operator: OperatorEnum.LessThanOrEqual,
                  },
                  {
                    metric,
                    metricValue,
                    operator: OperatorEnum.GreaterThanOrEqual,
                  },
                ],
                operator: GroupOperatorEnum.All,
                subgroups: [],
              },
            },
            {
              actions: [ complementAction ],
              conditionGroup: {
                conditions: [{
                  metric,
                  metricValue,
                  operator: OperatorEnum.LessThan,
                }],
                operator: GroupOperatorEnum.All,
                subgroups: [],
              },
            },
          ]);
        } else {
          console.log('turning off cruise control');
          rule.tasks.length = 1;
        }
      },
    },
  });
  static actionOptions: Record<string, ActionOptionConfig> = Object.freeze({
    [ActionEnum.IncBid]: {
      displayName: 'Inc. Bid',
      channel: [ ChannelEnum.AppleSearchAds ],
      params: {
        adjustmentValue: MetricTypeEnum.Percentage,
        adjustmentLimit: MetricTypeEnum.Currency,
      },
      complement: ActionEnum.DecBid,
      shorthandDescription: '☝︎ Bid',
    },
    [ActionEnum.DecBid]: {
      displayName: 'Dec. Bid',
      channel: [ ChannelEnum.AppleSearchAds ],
      params: {
        adjustmentValue: MetricTypeEnum.Percentage,
        adjustmentLimit: MetricTypeEnum.Currency,
      },
      complement: ActionEnum.IncBid,
      shorthandDescription: '☟ Bid',
    },
    [ActionEnum.IncCPAGoal]: {
      displayName: 'Inc. CPA Goal',
      channel: [ ChannelEnum.AppleSearchAds ],
      params: {
        adjustmentValue: MetricTypeEnum.Percentage,
        adjustmentLimit: MetricTypeEnum.Currency,
      },
      complement: ActionEnum.DecCPAGoal,
      shorthandDescription: '☝︎ CPA Goal',
    },
    [ActionEnum.DecCPAGoal]: {
      displayName: 'Dec. CPA Goal',
      channel: [ ChannelEnum.AppleSearchAds ],
      params: {
        adjustmentValue: MetricTypeEnum.Percentage,
        adjustmentLimit: MetricTypeEnum.Currency,
      },
      complement: ActionEnum.IncCPAGoal,
      shorthandDescription: '☟ CPA Goal',
    },
    [ActionEnum.IncCPAGoalCampaign]: {
      displayName: 'Inc. Campaign Target CPA',
      channel: [ ChannelEnum.GoogleAds ],
      params: {
        adjustmentValue: MetricTypeEnum.Percentage,
        adjustmentLimit: MetricTypeEnum.Currency,
      },
      complement: ActionEnum.DecCPAGoalCampaign,
      shorthandDescription: '☝︎ Campaign 🎯 CPA',
    },
    [ActionEnum.DecCPAGoalCampaign]: {
      displayName: 'Dec. Campaign Target CPA',
      channel: [ ChannelEnum.GoogleAds ],
      params: {
        adjustmentValue: MetricTypeEnum.Percentage,
        adjustmentLimit: MetricTypeEnum.Currency,
      },
      complement: ActionEnum.IncCPAGoalCampaign,
      shorthandDescription: '☟ Campaign 🎯 CPA',
    },
    [ActionEnum.IncCampaignBudget]: {
      displayName: 'Inc. Campaign Budget',
      channel: [ ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
      params: {
        adjustmentValue: MetricTypeEnum.Currency,
        adjustmentLimit: MetricTypeEnum.Currency,
      },
      complement: ActionEnum.DecCampaignBudget,
      shorthandDescription: '☝︎ Campaign 💰 Budget',
    },
    [ActionEnum.DecCampaignBudget]: {
      displayName: 'Dec. Campaign Budget',
      channel: [ ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
      params: {
        adjustmentValue: MetricTypeEnum.Currency,
        adjustmentLimit: MetricTypeEnum.Currency,
      },
      complement: ActionEnum.IncCampaignBudget,
      shorthandDescription: '☟ Campaign 💰 Budget',
    },
    [ActionEnum.PauseKeyword]: {
      displayName: 'Pause Keyword',
      channel: [ ChannelEnum.AppleSearchAds ],
      params: {},
      complement: ActionEnum.PauseKeyword,
      shorthandDescription: '⏸ Keyword',
    },
    [ActionEnum.PauseCampaign]: {
      displayName: 'Pause Campaign',
      channel: [ ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
      params: {},
      complement: ActionEnum.PauseCampaign,
      shorthandDescription: '⏸ Campaign',
    },
    [ActionEnum.NoAction]: {
      displayName: 'No Action',
      params: {},
      complement: ActionEnum.NoAction,
      shorthandDescription: '∅',
    },
  });

  static metricOptions: Record<string, MetricOptionConfig> = Object.freeze({
    [MetricEnum.TotalSpend]: {
      displayName: 'Spend',
      metricType: MetricTypeEnum.Currency,
      channel: [ ChannelEnum.AppleSearchAds, ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
    },
    [MetricEnum.ReAVGCPA]: {
      displayName: 'CPA',
      metricType: MetricTypeEnum.Currency,
      channel: [ ChannelEnum.AppleSearchAds, ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
    },
    [MetricEnum.ReAVGCPT]: {
      displayName: 'CPT',
      metricType: MetricTypeEnum.Currency,
      channel: [ ChannelEnum.AppleSearchAds, ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
    },
    [MetricEnum.ReAVGCPM]: {
      displayName: 'CPM',
      metricType: MetricTypeEnum.Currency,
      channel: [ ChannelEnum.AppleSearchAds, ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
    },
    [MetricEnum.ReAVGTTR]: {
      displayName: 'TTR',
      metricType: MetricTypeEnum.Percentage,
      channel: [ ChannelEnum.AppleSearchAds, ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
    },
    [MetricEnum.ReAVGConverstionRate]: {
      displayName: 'CR',
      metricType: MetricTypeEnum.Percentage,
      channel: [ ChannelEnum.AppleSearchAds, ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
    },
    [MetricEnum.TotalImpressions]: {
      displayName: 'Impressions',
      metricType: MetricTypeEnum.Count,
      channel: [ ChannelEnum.AppleSearchAds, ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
    },
    [MetricEnum.TotalTaps]: {
      displayName: 'Taps',
      metricType: MetricTypeEnum.Count,
      channel: [ ChannelEnum.AppleSearchAds, ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
    },
    [MetricEnum.TotalConversions]: {
      displayName: 'Conversions',
      metricType: MetricTypeEnum.Count,
      channel: [ ChannelEnum.AppleSearchAds, ChannelEnum.GoogleAds, ChannelEnum.Snapchat ],
    },
  });

  static operatorOptions: Record<string, OperatorOptionConfig> = Object.freeze({
    [OperatorEnum.Equal]: { displayName: '=', complement: OperatorEnum.Equal },
    [OperatorEnum.LessThan]: { displayName: '<', complement: OperatorEnum.GreaterThan },
    [OperatorEnum.GreaterThan]: { displayName: '>', complement: OperatorEnum.LessThan },
    [OperatorEnum.LessThanOrEqual]: { displayName: '≤', complement: OperatorEnum.GreaterThanOrEqual },
    [OperatorEnum.GreaterThanOrEqual]: { displayName: '≥', complement: OperatorEnum.LessThanOrEqual },
  });

  static groupOperatorOptions: Record<string, GroupOperatorOptionConfig> = Object.freeze({
    [GroupOperatorEnum.All]: { displayName: 'and', shorthandDescription: '&' },
    [GroupOperatorEnum.Any]: { displayName: 'or', shorthandDescription: '|' },
  });

  static formatMetric(metricType, metricValue) {
    switch (metricType) {
      case MetricTypeEnum.Currency:
        return `$${metricValue}`;
      case MetricTypeEnum.Percentage:
        return `${metricValue}%`;
      case MetricTypeEnum.Count:
      default:
        return `${metricValue}`;
    }
  }

  static getTaskSetType(tasks: Task[]): TaskSetType {
      if (tasks.length === 3) return TaskSetType.CruiseControl;
      return TaskSetType.Simple;
  }

  static getDisplayableTasks(tasks: Task[]): Task[] {
    switch (this.getTaskSetType(tasks)) {
      case TaskSetType.CruiseControl:
        // Cruise control rules have three tasks, the middle task being the
        // hidden lane that is adjusted automatically for the user
        return [tasks[0], tasks[2]];
      case TaskSetType.Simple:
      default:
        return tasks;
    }
  }

  static doHiddenMagicForTaskType(tasks: Task[]) {
    switch (this.getTaskSetType(tasks)) {
      case TaskSetType.CruiseControl:
        // Adjust the middle task conditions based on the outer tasks
        const { metric, metricValue: metricValue1 } = (tasks[0].conditionGroup as ConditionGroup).conditions[0];
        const { metricValue: metricValue2 } = (tasks[2].conditionGroup as ConditionGroup).conditions[0];
        const hiddenConditions = (tasks[1].conditionGroup as ConditionGroup).conditions;

        hiddenConditions[0].metric = metric;
        hiddenConditions[0].metricValue = metricValue1;
        hiddenConditions[0].operator = OperatorEnum.LessThanOrEqual;

        hiddenConditions[1].metric = metric;
        hiddenConditions[1].metricValue = metricValue2;
        hiddenConditions[1].operator = OperatorEnum.GreaterThanOrEqual;
        console.log('saving cruise control tasks', tasks);
        return;
      case TaskSetType.Simple:
      default:
        return;
    }
  }

  static makeCondition(task?: Task): Condition {
    return {
      metric: MetricEnum.TotalSpend,
      metricValue: 50,
      operator: OperatorEnum.LessThan
    }
  }

  static makeAction(): Action {
    return {
      action: ActionEnum.NoAction,
      adjustmentValue: 20,
      adjustmentLimit: 3.5,
    };
  }
}
