import { Component, OnInit, Input } from '@angular/core';
import { ChannelOps, ChannelEnum } from 'src/app/iomap/models/channel';
import { ChannelIconService } from 'src/app/services/assets/channel-icon.service';

@Component({
  selector: 'app-heading-channel',
  templateUrl: './heading-channel.component.html',
  styleUrls: ['./heading-channel.component.scss']
})
export class HeadingChannelComponent implements OnInit {
  ChannelOps = ChannelOps;
  ChannelIconService = ChannelIconService;

  @Input() channel: ChannelEnum;

  constructor() { }

  ngOnInit() {
  }

}
