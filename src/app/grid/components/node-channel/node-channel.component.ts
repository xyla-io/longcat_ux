import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { ChannelEnum, ChannelOps } from 'src/app/iomap/models/channel';
import { ChannelIconService } from 'src/app/services/assets/channel-icon.service';
import { GridGroup } from '../../interfaces/grid-group.abstract';

@Component({
  selector: 'app-node-channel',
  templateUrl: './node-channel.component.html',
  styleUrls: ['./node-channel.component.scss']
})
export class NodeChannelComponent extends GridGroup implements OnInit {
  ChannelEnum = ChannelEnum;
  ChannelIconService = ChannelIconService;
  ChannelOps = ChannelOps;

  @Input() channel: ChannelEnum;
  
  constructor(
    changeDetector: ChangeDetectorRef,
  ) {
    super(changeDetector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
