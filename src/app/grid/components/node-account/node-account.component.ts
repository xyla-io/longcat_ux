import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { RowNode } from 'ag-grid-community';
import { Rule } from 'src/app/rules/models/rule';
import { BadgeBubble } from 'src/app/grid/components/badge-category-counts/badge-category-counts.component';
import { GridGroup } from '../../interfaces/grid-group.abstract';

@Component({
  selector: 'app-node-account',
  templateUrl: './node-account.component.html',
  styleUrls: ['./node-account.component.scss']
})
export class NodeAccountComponent extends GridGroup implements OnInit {
  @Input() accountPath: string;

  accountDisplayName: string;

  constructor(
    changeDetector: ChangeDetectorRef,
  ) {
    super(changeDetector);
  }

  ngOnInit() {
    super.ngOnInit();
    const childRule = this.node.allLeafChildren[0].data as Rule;
    this.accountDisplayName = childRule.metadata.accountName;
  }

}
