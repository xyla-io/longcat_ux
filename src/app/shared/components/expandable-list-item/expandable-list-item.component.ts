import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

export interface ExpandableListItem {
  expandable: boolean;
  itemType: string;
  index: number;
  displayTitle?: string;
  badge?: string;
}

@Component({
  selector: 'app-expandable-list-item',
  templateUrl: './expandable-list-item.component.html',
  styleUrls: ['./expandable-list-item.component.scss']
})
export class ExpandableListItemComponent implements OnInit, OnChanges {

  @Input() item: ExpandableListItem;
  @Input() expanded = false;
  @Output() clickRemove = new EventEmitter<number>();
  @Output() clickExpand = new EventEmitter<number>();

  displayTitle: string;
  hasIndex = false;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.item) {
      this.displayTitle = this.item.displayTitle || 'Add ' + this.item.itemType[0].toUpperCase() + this.item.itemType.slice(1);
      this.hasIndex = typeof(this.item.index) === 'number' && this.item.index > -1;
    }
  }

  onClickRemoveItem(event: MouseEvent) {
    event.stopPropagation();
    this.clickRemove.emit(this.item.index);
  }

  onClickExpandItem(event: any) {
    this.clickExpand.emit(this.item.index);
  }
}
