import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PerformanceGridComponent, PerformanceGridTemplate } from 'src/app/performance/components/performance-grid/performance-grid.component';
import { ReportElement } from 'src/app/services/api/report-element.service';

@Component({
  selector: 'app-xyla-grid-content',
  templateUrl: './xyla-grid-content.component.html',
  styleUrls: ['./xyla-grid-content.component.scss']
})
export class XylaGridContentComponent implements OnInit {

  @Input() element: ReportElement;
  @Input() reportPath: string;

  @ViewChild(PerformanceGridComponent, { static: false }) private performanceGrid: PerformanceGridComponent;

  constructor() { }

  ngOnInit() {
  }

  onSave() {
    const nodes = {};
    this.performanceGrid.ioGrid.forEachNode(node => {
      if (!node.template) { return; }
      nodes[node.url] = node.template;
    });
    console.log(nodes);
  }

  onGridTemplateUpdate(update: PerformanceGridTemplate) {
    this.element.content.context.reportUpdate.emit({
      xyla: {
        [this.element.content.context.elementUID]: {
          metadata: this.element.content.metadata,
          structure: Object.assign({}, this.element.content.structure, { grid: update }),
        },
      },
    });
  }
}
