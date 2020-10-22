import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { GridGroup } from '../../interfaces/grid-group.abstract';
import { EntityEnum, EntityOps } from 'src/app/iomap/models/entity';

@Component({
  selector: 'app-node-entity-level',
  templateUrl: './node-entity-level.component.html',
  styleUrls: ['./node-entity-level.component.scss']
})
export class NodeEntityLevelComponent extends GridGroup implements OnInit {
  EntityOps = EntityOps;

  @Input() entityLevel: EntityEnum;

  constructor(
    changeDetector: ChangeDetectorRef,
  ) {
    super(changeDetector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
