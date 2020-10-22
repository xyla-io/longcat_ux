import { Component, Input, OnInit } from '@angular/core';
import { ReportElement } from 'src/app/services/api/report-element.service';

@Component({
  selector: 'app-xyla-switch-content',
  templateUrl: './xyla-switch-content.component.html',
  styleUrls: ['./xyla-switch-content.component.scss']
})
export class XylaSwitchContentComponent implements OnInit {

  @Input() element: ReportElement;
  @Input() reportPath: string;

  constructor() { }

  ngOnInit() {
  }

}
