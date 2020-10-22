import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { TemplateBigNumber } from 'src/app/dashboard/services/big-number.service';
import { TemplateGroup } from 'src/app/dashboard/interfaces/template';
import { Daterange } from 'src/app/dashboard/interfaces/query';
import { EventTemplateUpdate } from 'src/app/editing/services/editing.service';
import { BlockGroup } from 'src/app/dashboard/interfaces/block';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-group-summary-panel',
  templateUrl: './group-summary-panel.component.html',
  styleUrls: ['./group-summary-panel.component.scss']
})
export class GroupSummaryPanelComponent
implements OnInit, AfterViewInit, BlockGroup<TemplateGroup<TemplateBigNumber>> {
  @Input() group: TemplateGroup<TemplateBigNumber>;
  @Input() dataRefreshing = false;
  @Input() resizePanelTop$: Observable<boolean>;
  @Output() templateUpdate = new EventEmitter<EventTemplateUpdate<TemplateGroup<TemplateBigNumber>>>();

  @ViewChild('groupSummaryFixedElement', { static: false }) fixedElement: ElementRef;

  panelResized = false;
  viewInit$ = new BehaviorSubject<boolean>(false);
  destroyed$ = new Subject();

  constructor(
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    combineLatest([
      this.resizePanelTop$,
      this.viewInit$,
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([shouldResize, viewInit]) => {
        if (viewInit && shouldResize && this.fixedElement) {
          this.resizeFixedPanel();
        }
      });
  }

  ngAfterViewInit() {
    this.viewInit$.next(true);
  }

  resizeFixedPanel() {
    if (this.panelResized) { return; }
    this.panelResized = true;
    const top = Number(window.getComputedStyle(this.fixedElement.nativeElement).top.replace('px', ''));
    this.renderer.setStyle(this.fixedElement.nativeElement, 'top', `${top + 40}px`);
  }

  onDaterangeChange(daterange: Daterange) {
    const outputTemplate = cloneDeep(this.group);
    outputTemplate.queryParameters = this.group.queryParameters || {};
    outputTemplate.queryParameters.interval = daterange;
    this.templateUpdate.emit({ inputTemplate: this.group, outputTemplate });
  }
}
