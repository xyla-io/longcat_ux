import {
  Directive,
  ViewContainerRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  ComponentFactoryResolver,
} from '@angular/core';
import { ReplaySubject } from 'rxjs';
import {
  SidebarContent,
  SidebarContentType,
  SidebarPageComponent,
} from 'src/app/sidebar/factories/sidebar-content.factory';
import {
  EventTemplateEditingValidation,
} from 'src/app/editing/services/editing.service';
import { EnhancedTemplateMaster } from 'src/app/dashboard/interfaces/master';
import { AbstractTemplate } from 'src/app/dashboard/interfaces/template';

@Directive({
  selector: '[appSidebarContent]'
})
export class SidebarContentDirective
implements OnInit, OnChanges, SidebarPageComponent<AbstractTemplate, EnhancedTemplateMaster> {
  @Input() content: SidebarContent;
  @Input() pageNumber: number;
  @Input() inputTemplate: AbstractTemplate;
  @Input() masterTemplate: EnhancedTemplateMaster;
  @Output() templateUpdate = new EventEmitter<AbstractTemplate>();
  @Output() validationChange = new EventEmitter<EventTemplateEditingValidation>();

  constructor(
    public viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.loadComponentPage(this.pageNumber);
  }

  loadComponentPage(pageNumber: number) {
    if (!this.content || !this.inputTemplate) { return; }
    const page = this.content.pages[pageNumber];
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(page.component);
    this.viewContainerRef.clear();
    const componentRef = this.viewContainerRef.createComponent(componentFactory);
    componentRef.instance.inputTemplate = this.inputTemplate;
    componentRef.instance.masterTemplate = this.masterTemplate;
    componentRef.instance.templateUpdate.subscribe(updatedTemplate => {
      this.templateUpdate.emit(updatedTemplate);
    });
    componentRef.instance.validationChange.subscribe(validation => {
      this.validationChange.emit(validation);
    });
  }
}

