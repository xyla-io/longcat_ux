import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { RuleOps } from '../../models/rule';
import { Options } from '../../../iomap/util/options';
import { ChannelEnum } from 'src/app/iomap/models/channel';

@Component({
  selector: 'app-edit-check-range',
  templateUrl: './edit-check-range.component.html',
  styleUrls: ['./edit-check-range.component.scss']
})
export class EditCheckRangeComponent implements OnInit {
  Options = Options;
  RuleOps = RuleOps;

  @Input() checkRange: number;
  @Input() channel: ChannelEnum;
  @Output() selectChange = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  onChange(event) {
    this.selectChange.emit(event.target.value);
  }

}
