import { Component, OnInit, Input } from '@angular/core';
import { ReportElement, ReportElementType } from 'src/app/services/api/report-element.service';
import { ReportLayout, LayoutOrientation } from 'src/app/services/api/company-reports.service';

export interface LayoutElement extends ReportElement {
  type: ReportElementType.Layout;
  layout: ReportLayout;
  children: ReportElement[];
}

@Component({
  selector: 'app-report-layout',
  templateUrl: './report-layout.component.html',
  styleUrls: ['./report-layout.component.css']
})
export class ReportLayoutComponent implements OnInit {
  ReportElementType = ReportElementType;
  LayoutOrientation = LayoutOrientation;

  @Input() element: LayoutElement;
  @Input() reportPath: string;

  constructor() {}

  ngOnInit() {}
}
