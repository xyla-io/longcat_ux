import { RowNode } from "ag-grid-community";
import { EventEmitter, OnInit, ChangeDetectorRef, Input, Output, OnDestroy } from "@angular/core";
import { BadgeBubble } from "../components/badge-category-counts/badge-category-counts.component";
import { Subject, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ChannelEnum } from "src/app/iomap/models/channel";

export abstract class GridGroup implements OnInit, OnDestroy {
  @Input() node: RowNode;
  @Input() channel: ChannelEnum;
  @Input() context: any;
  @Input() bubbles: BadgeBubble[];
  @Input() showAddNode: boolean;
  @Output() addNode = new EventEmitter<MouseEvent>();
  @Input() gridEvents$: Observable<any>;

  isHovering: boolean;
  destroyed$ = new Subject();

  constructor(
    protected changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.node.onMouseEnter = () => { this.isHovering = true; this.changeDetector.detectChanges(); }
    this.node.onMouseLeave = () => { this.isHovering = false; this.changeDetector.detectChanges(); }
    this.gridEvents$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(event => {
        switch (event.type) {
          case RowNode.EVENT_EXPANDED_CHANGED: this.onExpandedChanged(event.node.expanded); break;
        }
      })
    ;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  async onExpandedChanged(expanded: boolean) {
    // Implement in subclasses
  }

  onClickAddNode(event: MouseEvent) {
    event.stopPropagation();
    this.addNode.emit(event);
  }
}