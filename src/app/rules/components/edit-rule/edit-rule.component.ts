import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
  AfterViewChecked,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Rule, RuleOps, CloneRuleBulkCampaignsInfo, CloneTypeEnum } from '../../models/rule';
import { Options } from '../../../iomap/util/options';
import {
  MetricTypeEnum,
  Task,
  TaskOps,
  ActionEnum,
  GroupOperatorEnum,
  MetricEnum,
  OperatorEnum,
  ConditionGroup,
  TaskSetType
} from '../../models/task';
import { ChannelOps } from 'src/app/iomap/models/channel';
import { Subject, fromEvent } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';
import { SelectionChange } from '../../../shared/components/option-multi-select/option-multi-select.component';
import { RulesService, RulePatch } from '../../services/rules.service';
import { RowNode, GridApi } from 'ag-grid-community';
import { ShowToast, ToastTypeEnum } from 'src/app/shared/components/toast/toast.component';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { CloneRuleInfo } from '../../models/rule';
import { IOMapService } from '../../services/iomap.service';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';

@Component({
  selector: 'app-edit-rule',
  templateUrl: './edit-rule.component.html',
  styleUrls: ['./edit-rule.component.scss'],
})
export class EditRuleComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked, OnChanges {
  MetricTypeEnum = MetricTypeEnum;
  Options = Options;
  RuleOps = RuleOps;
  TaskOps = TaskOps;
  TaskSetType = TaskSetType;
  ChannelOps = ChannelOps;

  public static viewHeight() {
    return 288;

    //// BASIC CODE FOR COMPUTING A VARIABLE HEIGHT BASED ON RULE CONTENT
    // console.log('computing height', rowNode);
    // const rule = rowNode.data as Rule;
    // if (PlaceholderOps.isPlaceholder<Rule>(rule)) { return 60; }
    // const displayableTasks = TaskOps.getDisplayableTasks(rule.tasks);
    // const baseRuleHeight = 120;
    // const baseTaskHeight = 84;
    // const extraConditionHeight = 24;
    // const extraConditions = displayableTasks.reduce((extraConditionCount, task) => {
    //   return extraConditionCount + (task.conditionGroup as ConditionGroup).conditions.length - 1;
    // }, 0);
    // return baseRuleHeight + (displayableTasks.length * baseTaskHeight) + (extraConditions * extraConditionHeight);
  }


  @Input() gridAPI: GridApi;
  @Input() node: RowNode;
  @Input() rule: Rule;
  @Output() collapse = new EventEmitter();
  @ViewChild('wrapper', {static: false}) wrapper: ElementRef;

  scrollHeight$ = new Subject<number>();
  toasts$ = new Subject<ShowToast>();
  destroyed$ = new Subject();
  displayableTasks: Task[];
  editedRule: Rule;
  isDirty = false;
  isSaving = false;
  glowing = false;
  visible = false;
  showingActionButtons = false;
  confirmDeleteModal: NgxSmartModalComponent;
  cloneModal: NgxSmartModalComponent;

  constructor(
    private rulesService: RulesService,
    private ngxSmartModalService: NgxSmartModalService,
    private ioMapService: IOMapService,
    private alertService: UserAlertService,
  ) { }

  ngOnInit() {
    this.scrollHeight$.pipe(
      takeUntil(this.destroyed$),
      distinctUntilChanged(),
    ).subscribe(scrollHeight => {
      // console.log('setting new height', scrollHeight + 20);
      // this.node.setRowHeight(scrollHeight + 20);
      // this.api.redrawRows();
    });
    setTimeout(() => {
      this.showingActionButtons = true;
    }, 200)
    setTimeout(() => {
      this.visible = true;
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.rule) {
      this.resetEditedRule();
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngAfterViewInit() {
    Object.entries({
      mouseover: true,
      mouseout: false
    }).forEach(([eventName, glowingState]) => {
      fromEvent(this.wrapper.nativeElement, eventName)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => { this.glowing = glowingState; })
    })
  }

  ngAfterViewChecked() {
    // const { scrollHeight, clientHeight } = this.container.nativeElement;
    // // console.log('heights', scrollHeight, clientHeight)
    // if (scrollHeight > clientHeight) {
    //   // console.log('has scroll', scrollHeight, clientHeight)
    //   this.scrollHeight$.next(scrollHeight);
    // }
  }

  resetEditedRule(fromRule?: Rule) {
    this.editedRule = cloneDeep(fromRule || this.rule);
    this.displayableTasks = TaskOps.getDisplayableTasks(this.editedRule.tasks);
    this.isDirty = false;
  }

  async onBooleanSelectionChange(changes: SelectionChange<Rule>[]) {
    const rule = this.isDirty ? this.editedRule : {
      id: this.rule._id,
      modified: this.rule.modified,
    };
    changes.forEach(({option, value}) => {
      if (typeof (option as any).set === 'function') {
        (option as any).set(rule, value);
      } else {
        rule[option.key] = value;
      }
    });
    if (this.isDirty) {
      this.resetEditedRule(this.editedRule);
      this.isDirty = true;
      return;
    }
    console.log('patching rule with', rule);
    await this.patchRule(rule as RulePatch);
  }

  async onEnabledToggleChange(isEnabled: boolean) {
    if (this.isDirty) {
      this.editedRule.isEnabled = isEnabled;
      return;
    }
    await this.patchRule( {
      id: this.rule._id,
      isEnabled,
      modified: this.rule.modified,
    })
  }

  trueTaskIndex(forDisplayIndex: number) {
    switch (TaskOps.getTaskSetType(this.editedRule.tasks)) {
      case TaskSetType.CruiseControl:
        return forDisplayIndex ? forDisplayIndex + 1 : 0;
      case TaskSetType.Simple:
      default:
        return forDisplayIndex;
    }
  }

  complementTaskIndex(forDisplayIndex: number) {
    switch (TaskOps.getTaskSetType(this.editedRule.tasks)) {
      case TaskSetType.CruiseControl:
        return forDisplayIndex ? 0 : 2;
      case TaskSetType.Simple:
      default:
        return forDisplayIndex;
    }
  }

  onSelectTaskSetTypeChange(taskSetType: TaskSetType) {
    console.log(taskSetType);
    TaskOps.taskSetTypeOptions[taskSetType].set(this.editedRule);
    this.resetEditedRule(this.editedRule);
    this.isDirty = true;
  }

  onSelectRunIntervalChange(runInterval: string) {
    this.editedRule.runInterval = Number(runInterval);
    this.isDirty = true;
  }

  onSelectCheckRangeChange(checkRange: string) {
    this.editedRule.dataCheckRange = Number(checkRange);
    this.isDirty = true;
  }

  onTaskActionChange(action: ActionEnum, index: number) {
    console.log('task action change', action, index);
    this.editedRule.tasks[this.trueTaskIndex(index)].actions[0].action = action;
    this.isDirty = true;
  }

  onTaskAdjustmentValueChange(adjustmentValue: string, index: number) {
    console.log('task adjustment value change', adjustmentValue, index);
    this.editedRule.tasks[this.trueTaskIndex(index)]
      .actions[0]
      .adjustmentValue = Number(adjustmentValue);
    this.isDirty = true;
  }

  onTaskAdjustmentLimitChange(adjustmentLimit: string, index: number) {
    console.log('task adjustment limit change', adjustmentLimit, index);
    this.editedRule.tasks[this.trueTaskIndex(index)].actions[0].adjustmentLimit = Number(adjustmentLimit);
    this.isDirty = true;
  }

  onTaskConditionGroupOperatorChange(event: {
    operator: GroupOperatorEnum,
    index: number;
  }, taskIndex: number) {
    console.log('task operator change', event.operator, event.index);
    (this.editedRule.tasks[this.trueTaskIndex(taskIndex)]
      .conditionGroup as ConditionGroup)
      .operator = event.operator;
    this.isDirty = true;
  }

  onTaskConditionMetricChange(event: {
    metric: MetricEnum,
    index: number
  }, taskIndex: number) {
    console.log('task metric change', event.metric, event.index);
    (this.editedRule.tasks[this.trueTaskIndex(taskIndex)]
      .conditionGroup as ConditionGroup)
      .conditions[event.index]
      .metric = event.metric;
    if (TaskOps.getTaskSetType(this.editedRule.tasks) === TaskSetType.CruiseControl) {
      (this.editedRule.tasks[this.complementTaskIndex(taskIndex)]
        .conditionGroup as ConditionGroup)
        .conditions[event.index]
        .metric = event.metric;
    }
    this.isDirty = true;
  }

  onTaskConditionOperatorChange(event: {
    operator: OperatorEnum,
    index: number
  }, taskIndex: number) {
    console.log('task operator change', event.operator, event.index);
    (this.editedRule.tasks[this.trueTaskIndex(taskIndex)]
      .conditionGroup as ConditionGroup)
      .conditions[event.index]
      .operator = event.operator;
    if (TaskOps.getTaskSetType(this.editedRule.tasks) === TaskSetType.CruiseControl) {
      (this.editedRule.tasks[this.complementTaskIndex(taskIndex)]
        .conditionGroup as ConditionGroup)
        .conditions[event.index]
        .operator = Options.complement<OperatorEnum>(TaskOps.operatorOptions, event.operator);
    }
    this.isDirty = true;
  }

  onTaskConditionMetricValueChange(event: {
    metricValue: string,
    index: number
  }, taskIndex: number) {
    console.log('task metric value change', event.metricValue, event.index);
    (this.editedRule.tasks[this.trueTaskIndex(taskIndex)]
      .conditionGroup as ConditionGroup)
      .conditions[event.index]
      .metricValue = Number(event.metricValue);
    this.isDirty = true;
  }

  onTaskAddCondition(afterConditionIndex: number, taskIndex: number) {
    console.log('task add condition', afterConditionIndex);
    (this.editedRule.tasks[this.trueTaskIndex(taskIndex)]
      .conditionGroup as ConditionGroup)
      .conditions.splice(
        afterConditionIndex + 1,
        0,
        TaskOps.makeCondition(this.editedRule.tasks[this.trueTaskIndex(taskIndex)])
      )
    this.isDirty = true;
  }

  onTaskDeleteCondition(conditionIndex: number, taskIndex: number) {
    const conditions = (this.editedRule.tasks[this.trueTaskIndex(taskIndex)]
      .conditionGroup as ConditionGroup)
      .conditions;
    if (conditions.length < 2) { return; }
    console.log('task delete condition', conditionIndex);
    conditions.splice(conditionIndex, 1)
    this.isDirty = true;
  }

  onClickCancel() {
    this.resetEditedRule();
  }

  onClickClone(event) {
    this.cloneModal = this.ngxSmartModalService.getModal('cloneModal-' + this.editedRule._id);
    this.cloneModal.open();
  }

  async onClickCloneConfirm(cloneInfo: CloneRuleInfo|CloneRuleBulkCampaignsInfo) {
    this.isSaving = true;
    await (() => {
      switch (cloneInfo.cloneType) {
        case CloneTypeEnum.Single: return this.cloneSingle(cloneInfo);
        case CloneTypeEnum.CampaignPattern: return this.cloneMultiple(cloneInfo);
      }
    })();
    this.cloneModal.close();
    this.isSaving = false;
  }

  async cloneMultiple(cloneInfo: CloneRuleBulkCampaignsInfo) {
    return Promise.all(cloneInfo.campaignIDs.map(campaignID => {
      return this.cloneSingle({
        cloneType: CloneTypeEnum.Single,
        accountPath: cloneInfo.accountPath,
        campaignID,
        adgroupID: undefined,
        shouldEnable: cloneInfo.shouldEnable,
      });
    }));
  }

  async cloneSingle(cloneInfo: CloneRuleInfo) {
    const clone = RuleOps.clone(cloneInfo, this.editedRule, this.ioMapService.entityReport.entityTree);
    console.log('cloning', clone);
    try {
      await this.rulesService.create(clone);
      this.alertService.postAlert({
        alertType: UserAlertType.success,
        header: 'Rule Cloned',
        body: `Rule cloned to ${clone.metadata.campaignName}`,
      });
    } catch (error) {
      console.log('error cloning rule', error);
      this.alertService.postAlert({
        alertType: UserAlertType.error,
        header: 'Problem cloning rule',
        body: 'An error ocurred while attempting to clone the rule',
      });
    }
  }


  onClickDelete(event) {
    if (!this.editedRule.modified) {
      this.deleteRule();
      return;
    }

    this.confirmDeleteModal = this.ngxSmartModalService.getModal('confirmDeleteModal-' + this.editedRule._id);
    this.confirmDeleteModal.open();
  }

  async onClickDeleteConfirm(event) {
    this.isSaving = true;
    this.confirmDeleteModal.close();
    await this.deleteRule();
    this.isSaving = false;
  }

  private async deleteRule() {
    try {
      await this.rulesService.deleteByID(this.editedRule._id);
      this.alertService.postAlert({
        alertType: UserAlertType.warning,
        header: 'Rule Deleted',
        body: `Rule deleted from ${this.editedRule.metadata.campaignName}`,
      });
    } catch (error) {
      this.handleSaveError(error);
    }
  }

  async patchRule(rulePatch: RulePatch) {
    this.isSaving = true;
    try {
      await this.rulesService.patch(rulePatch);
      this.handleSaveSuccess();
    } catch (error) {
      this.handleSaveError(error);
    } finally {
      this.isSaving = false;
    }
  }

  async onClickSave() {
    TaskOps.doHiddenMagicForTaskType(this.editedRule.tasks);
    this.isSaving = true;
    try {
      await this.rulesService.save(this.editedRule);
      this.handleSaveSuccess();
    } catch (error) {
      this.handleSaveError(error);
    } finally {
      this.isSaving = false;
    }
  }

  private handleSaveSuccess() {
    this.toasts$.next({
      message: 'Saved',
      icon: 'check circle icon',
      type: ToastTypeEnum.Success,
    })
  }

  private handleSaveError(error: HttpErrorResponse) {
    if (error.status === 409) {
      this.toasts$.next({
        message: error.error.message,
        icon: 'users',
        type: ToastTypeEnum.Warning,
        timeout: 12000,
      })
    } else {
      this.resetEditedRule();
      this.toasts$.next({
        message: 'Problem saving changes. Please try again later.',
        icon: 'bug',
        type: ToastTypeEnum.Error,
          timeout: 5000,
      })
    }
  }


}
