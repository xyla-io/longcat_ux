import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { _ID } from 'src/app/iomap/util/models';
import { Rule } from 'src/app/rules/models/rule';
import { IOMapService } from 'src/app/rules/services/iomap.service';
import { GridGroup } from '../../interfaces/grid-group.abstract';

@Component({
  selector: 'app-node-adgroup',
  templateUrl: './node-adgroup.component.html',
  styleUrls: ['./node-adgroup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeAdgroupComponent extends GridGroup implements OnInit {

  @Input() adgroupID: number;
  adgroupName: string;

  constructor(
    changeDetector: ChangeDetectorRef,
    public ioMapService: IOMapService,
  ) {
    super(changeDetector);
  }

  ngOnInit() {
    super.ngOnInit();
    const childRule = this.node.allLeafChildren[0].data as Rule;
    this.adgroupName = childRule.metadata.adGroupName;
    this.changeDetector.detectChanges();
  }

}
