import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlmacenEntityNode } from 'src/app/util/reports/almacen-entity-report';
import { CollapsibleGridLeaf, ViewModeEnum } from 'src/app/grid/interfaces/grid-leaf.interface';

@Component({
  selector: 'app-node-taggable-entity',
  templateUrl: './node-taggable-entity.component.html',
  styleUrls: ['./node-taggable-entity.component.scss']
})
export class NodeTaggableEntityComponent extends CollapsibleGridLeaf<AlmacenEntityNode, Record<string, any>> implements OnInit {
  static viewHeight() { return 80; }
  static get defaultViewMode() { return ViewModeEnum.Collapsed; }

  viewMode$ = new BehaviorSubject((this.node as any || {}).viewMode || NodeTaggableEntityComponent.defaultViewMode);

  constructor(
    public changeDetector: ChangeDetectorRef,
  ) {
    super(changeDetector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  tagKeyComparator = (a: string, b: string): number => {
    const sortingArr = Object.keys(this.data.tags);
    return sortingArr.indexOf(a) - sortingArr.indexOf(b);
  }



}
