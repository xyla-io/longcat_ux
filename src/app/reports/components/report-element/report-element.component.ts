import { Component, OnInit, Input } from '@angular/core';
import { ReportElement, ReportElementType } from 'src/app/services/api/report-element.service';

@Component({
  selector: 'app-report-element',
  templateUrl: './report-element.component.html',
  styleUrls: ['./report-element.component.css']
})
export class ReportElementComponent implements OnInit {
  ReportElementType = ReportElementType;

  @Input() element: ReportElement;
  @Input() reportPath: string;

  constructor() {}

  ngOnInit() {}
}
