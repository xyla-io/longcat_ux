import { Component, OnInit, Input } from '@angular/core';

export enum ViewMode {
  Simple = 'simple',
  Full = 'full',
}

@Component({
  selector: 'app-badge-parser-key',
  templateUrl: './badge-parser-key.component.html',
  styleUrls: ['./badge-parser-key.component.scss']
})
export class BadgeParserKeyComponent implements OnInit {
  ViewMode = ViewMode;

  @Input() parserKey: string;
  @Input() viewMode: ViewMode = ViewMode.Full;
  @Input() showInfoIcon = true;

  constructor() { }

  ngOnInit() {
  }

}
