import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { RuleOps } from '../../models/rule';
import { Options } from '../../../iomap/util/options';
import { ChannelEnum } from 'src/app/iomap/models/channel';

@Component({
  selector: 'app-edit-run-interval',
  templateUrl: './edit-run-interval.component.html',
  styleUrls: ['./edit-run-interval.component.scss']
})
export class EditRunIntervalComponent implements OnInit {
  Options = Options;
  RuleOps = RuleOps;

  @Input() runInterval: number;
  @Input() channel: ChannelEnum;
  @Output() selectChange = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  onSelectChange(event) {
    console.log(event);
    this.selectChange.emit(event.target.value);
  }

}
