import {
  Component,
  OnInit,
  OnDestroy,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ComponentFactoryResolver,
} from '@angular/core';
import { combineLatest, ReplaySubject, Subscription, Subject } from 'rxjs';
import { withLatestFrom, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';
import { EnhancedTemplateMaster, StructureMaster } from 'src/app/dashboard/interfaces/master';
import {
  EventTemplateUpdate,
  EventTemplateUpdateApplied,
} from 'src/app/editing/services/editing.service';
import { SidebarContentDirective } from 'src/app/sidebar/directives/sidebar-content.directive';
import {
  SidebarContent,
  SidebarContentType,
  SidebarContentFactory,
  SidebarDisplayType,
} from 'src/app/sidebar/factories/sidebar-content.factory';
import {
  EventTemplateEditingValidation,
} from 'src/app/editing/services/editing.service';
import { AbstractTemplate } from 'src/app/dashboard/interfaces/template';
import { SidebarService } from 'src/app/sidebar/services/sidebar.service';

@Component({
  selector: 'app-sidebar-content',
  templateUrl: './sidebar-content.component.html',
  styleUrls: ['./sidebar-content.component.scss'],
})
export class SidebarContentComponent implements OnInit, OnDestroy {
  // Used in the template
  SidebarDisplayType = SidebarDisplayType;

  @Input() updateConfirmation$: ReplaySubject<EventTemplateUpdateApplied>;
  @Output() templateUpdate = new EventEmitter<EventTemplateUpdate<AbstractTemplate>>();
  @ViewChild(SidebarContentDirective, { static: true }) contentHost: SidebarContentDirective;

  destroyed$ = new Subject();
  inputTemplate: AbstractTemplate;
  // updatedTemplate: stored here in the parent that tracks changes from the child
  updatedTemplate: AbstractTemplate;
  // intermediateTemplate: passed to the child to make changes to.
  // we don't update intermediateTemplate so that we don't cause the child
  // to re-render when they push an update up to us
  intermediateTemplate: AbstractTemplate;
  masterTemplate: EnhancedTemplateMaster;
  contentType: SidebarContentType;
  content: SidebarContent;
  contentPageNumber: number;
  updateConfirmationSubscription: Subscription;
  pagesValid: boolean[];
  pageValidation: boolean;
  validationMessage: string;
  saveButtonText: string;
  nextButtonText: string;
  isDirty = false;
  isSaving = false;

  constructor(
    private sidebarService: SidebarService,
  ) { }

  ngOnInit() {
    this.sidebarService.refreshSidebar$.pipe(withLatestFrom(
      combineLatest(
        this.sidebarService.contentType$,
        this.sidebarService.inputTemplate$,
        this.sidebarService.masterTemplate$
      )
    ))
    .pipe(takeUntil(this.destroyed$))
    .subscribe(([refresh, [contentType, inputTemplate, masterTemplate]]) => {
      if (!refresh) { return; }
      const prevContentType = this.contentType;
      this.contentType = contentType;
      this.inputTemplate = inputTemplate;
      this.masterTemplate = masterTemplate;

      this.intermediateTemplate = cloneDeep(this.inputTemplate);
      this.updatedTemplate = cloneDeep(this.inputTemplate);
      if (prevContentType !== this.contentType) {
        this.initSidebarState();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  initSidebarState() {
    this.pageValidation = true;
    this.setContentPageNumber(0);
    if (this.updateConfirmationSubscription) {
      this.updateConfirmationSubscription.unsubscribe();
      this.updateConfirmationSubscription = null;
    }
    if (this.contentType === SidebarContentType.Hidden) {
      this.pagesValid = null;
      return;
    }
    this.content = SidebarContentFactory.create(this.contentType);
    this.pagesValid = this.content.pages.map(_ => null);
    this.updateButtonText();
    this.isDirty = false;
    this.isSaving = false;
    this.updateConfirmationSubscription = this.updateConfirmation$.subscribe(confirmation => {
      this.isDirty = false;
      if (this.isSaving && this.content.displayType === SidebarDisplayType.Steps) {
        if (this.contentPageNumber < this.content.pages.length - 1) {
          this.setContentPageNumber(this.contentPageNumber + 1);
        }
      }
      this.isSaving = false;
    });
  }

  onTemplateUpdate(template: AbstractTemplate) {
    this.updatedTemplate = cloneDeep(template);
    this.isDirty = true;
  }

  onPageValidationChange(validation: EventTemplateEditingValidation) {
    this.pagesValid[this.contentPageNumber] = validation.isValid;
    this.pageValidation = validation.isValid;
    if (validation.isValid) {
      this.validationMessage = null;
    } else {
      this.validationMessage = validation.message;
    }
  }

  onClickNext(event: any) {
    if (this.isDirty) {
      this.emitTemplateUpdate();
    } else {
      if (this.contentPageNumber < this.content.pages.length - 1) {
        this.setContentPageNumber(this.contentPageNumber + 1);
      }
    }
  }

  onClickSave(event: any) {
    this.emitTemplateUpdate();
  }

  setContentPageNumber(pageNumber: number) {
    if (this.pageValidation === false) {
      return;
    }
    this.contentPageNumber = pageNumber;
    this.intermediateTemplate = cloneDeep(this.updatedTemplate);
    this.updateButtonText();
  }

  updateButtonText() {
    if (!this.content) {
      this.saveButtonText = '';
      this.nextButtonText = '';
      return;
    }
    if (this.content.displayType === SidebarDisplayType.Steps) {
      if (this.contentPageNumber < this.content.pages.length - 1) {
        this.nextButtonText = 'Next: ' + this.content.pages[this.contentPageNumber + 1].peekText;
        this.saveButtonText = '';
        return;
      }
    }
    this.nextButtonText = '';
    this.saveButtonText = this.content.displayObjective;
  }

  emitTemplateUpdate() {
    if (this.isSaving) { return; }
    this.isSaving = true;
    this.intermediateTemplate = cloneDeep(this.updatedTemplate);
    this.templateUpdate.emit({
      inputTemplate: this.inputTemplate,
      outputTemplate: this.intermediateTemplate,
    });
  }

  onClickStep(stepNumber: number) {
    this.setContentPageNumber(stepNumber);
  }

  onClickClose(event: any) {
    this.sidebarService.hideSidebar();
  }
}
