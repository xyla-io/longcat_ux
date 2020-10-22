import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Rule, RuleOps } from '../../models/rule';
import { TaskOps, ConditionGroup } from '../../models/task';
import { RowNode, GridApi } from 'ag-grid-community';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { EditRuleComponent } from '../edit-rule/edit-rule.component';
import { RulesService, RulePatch } from '../../services/rules.service';
import { NotificationService, NotificationCount } from '../../services/notification.service';
import { CollapsibleGridLeaf, ViewModeEnum } from 'src/app/grid/interfaces/grid-leaf.interface';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-node-rule',
  templateUrl: './node-rule.component.html',
  styleUrls: ['./node-rule.component.scss'],
})
export class NodeRuleComponent extends CollapsibleGridLeaf<Rule, Record<string, any>> implements OnInit, OnChanges, OnDestroy {
  RuleOps = RuleOps;
  TaskOps = TaskOps;

  static viewHeight() { return 60; }
  static get defaultViewMode() { return ViewModeEnum.Collapsed }

  @Input() data$: Observable<Rule>;
  @Input() gridAPI: GridApi;
  @Input() set node(node) {
    this._node = node;
    this.viewMode$.next((node as any).viewMode);
  }

  protected _node: RowNode;
  get node() { return this._node; }
  data: Rule;
  editedData: Rule;
  notifications: NotificationCount;
  viewMode$ = new BehaviorSubject((this.node as any || {}).viewMode || NodeRuleComponent.defaultViewMode);
  destroyed$ = new Subject();


  get isCollapsed() {
    return this.viewMode$.value === ViewModeEnum.Collapsed;
  }

  get isExpanded() {
    return this.viewMode$.value === ViewModeEnum.Expanded;
  }

  get trailingActivityDays() {
    return NotificationService.trailingActivityDays;
  }

  conditionGroup(group) {
    return (group as ConditionGroup);
  }
  
  constructor(
    private rulesService: RulesService,
    private notificationService: NotificationService,
    changeDetector: ChangeDetectorRef,
  ) {
    super(changeDetector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.viewMode$.subscribe((mode => {
      (this.node as any).viewMode = mode;
      switch (mode) {
        case ViewModeEnum.Collapsed:
          this.node.setRowHeight(NodeRuleComponent.viewHeight());
          break;
        case ViewModeEnum.Expanded:
          this.node.setRowHeight(EditRuleComponent.viewHeight());
          break;
      }
      // Without the setTimeout(), ag-grid will complain about redrawing
      // during an active draw
      setTimeout(() => this.gridAPI.onRowHeightChanged());
    }));
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.data$ && this.data$) {
      this.data$
        .pipe(takeUntil(this.destroyed$))
        .subscribe(data => {
          this.onReceiveData(data);
        });
    }
  }

  onReceiveData(rule: Rule) {
    super.onReceiveData(rule);
    if (this.editedData) {
      if ((this.node as any).viewMode) {
        this.viewMode$.next((this.node as any).viewMode)
      } else if (this.editedData.modified) {
        this.viewMode$.next(NodeRuleComponent.defaultViewMode);
      } else {
        this.viewMode$.next(ViewModeEnum.Expanded);
      }
      this.notifications = this.notificationService.notificationsForRule(this.editedData._id);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onClickExpandCollapse() {
    if (this.isCollapsed) {
      this.viewMode$.next(ViewModeEnum.Expanded)
    } else {
      this.viewMode$.next(ViewModeEnum.Collapsed)
    }
  }

  async onEnabledToggleChange(isEnabled: boolean) {
    await this.patchRule( {
      id: this.editedData._id,
      isEnabled,
      modified: this.editedData.modified,
    })
  }

  async patchRule(rulePatch: RulePatch) {
    try {
      await this.rulesService.patch(rulePatch);
    } catch (error) {
      // TODO show alert
      console.error(error);
    }
  }


}
