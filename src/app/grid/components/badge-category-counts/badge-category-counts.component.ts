import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RowNode } from 'ag-grid-community';
import { PlaceholderOps } from 'src/app/grid/interfaces/placeholder';
import { cloneDeep } from 'lodash-es';

export interface BadgeBubble {
  class: string;
  label: string|((count: number, node: RowNode) => string);
  count: (data: any) => boolean;
  isLeftEnd?: boolean;
  isRightEnd?: boolean;
}

@Component({
  selector: 'app-badge-category-counts',
  templateUrl: './badge-category-counts.component.html',
  styleUrls: ['./badge-category-counts.component.scss']
})
export class BadgeCategoryCountsComponent implements OnInit, OnChanges {

  @Input() bubbles: BadgeBubble[];
  @Input() node: RowNode;
  tooltip: string;

  counts = {};

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(c: SimpleChanges) {
    if (!this.bubbles) {
      this.bubbles = [];
      return;
    }
    this.bubbles = cloneDeep(this.bubbles);
    this.bubbles.forEach(bubble => { this.counts[bubble.class] = 0; });
    this.node.allLeafChildren.forEach((child: RowNode) => {
      const data = child.data;
      if (PlaceholderOps.isPlaceholder<any>(data)) { return; }
      this.bubbles.some(bubble => {
        const shouldCount = bubble.count(data);
        if (shouldCount) {
          this.counts[bubble.class] += 1;
        }
        return shouldCount;
      });
    });
    this.bubbles.forEach((bubble, i) => {
      bubble.isLeftEnd = this.isLeftEnd(i);
      bubble.isRightEnd = this.isRightEnd(i);
    })
    this.tooltip = this.bubbles
      .map(bubble => this.makeLabel(this.counts[bubble.class], bubble.label))
      .filter(x => x).join(', ');
  }

  makeLabel(count: number, name: string|((count: number, rowNode: RowNode) => string)): string {
    if (typeof name === 'function') { return name(count, this.node); }
    return count ? `${count} ${name}${count === 1 ? '': 's'}` : '';
  }

  private isLeftEnd(i: number) {
    return this.bubbles.slice(0, i).every(bubble => !this.counts[bubble.class]);
  }

  private isRightEnd(i: number) {
    return this.bubbles.slice(i + 1).every(bubble => !this.counts[bubble.class])
  }
}
