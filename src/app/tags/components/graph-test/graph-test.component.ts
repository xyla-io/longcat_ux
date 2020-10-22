import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Grapher, TracesFormatEnum } from 'development_packages/xylo/src/browser';
import { PerformanceService } from 'src/app/services/api/performance.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ObjectReport } from 'src/app/util/reports/object-report';

@Component({
  selector: 'app-graph-test',
  templateUrl: './graph-test.component.html',
  styleUrls: ['./graph-test.component.scss']
})
export class GraphTestComponent implements OnInit, OnDestroy {

  @ViewChild('graph', {static: true}) graph: ElementRef;
  destroyed$ = new Subject();

  constructor(
    private performanceService: PerformanceService,
  ) { }

  ngOnInit() {
    this.performanceService.performance$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async ({ result: url })=> {
        console.log('performance url', url);
        if (!url) { return; }
        const report = new ObjectReport({ jsonColumns: { tags: { prefix: 'tag_' }} });
        await report.addCSVFromURL(url);
        console.log(report.rows);
        this.renderGraph(report.rows);
      })
    this.performanceService.refreshPerformance();
  }

  renderGraph(data: Record<string, any>[]) {
    // Grapher.render({
    //   element: this.graph.nativeElement,
    //   data,
    //   xAxisColumn: 'date',
    //   // jsonColumns: {
    //   //   'tags': { prefix: 'tag_'},
    //   // },
    //   groupBy: {
    //     columns: ['tag_channel', 'tag_os'],
    //   },
    //   aggregate: {
    //     sum: 'spend',
    //   },
    //   renderOptions: {
    //     yAxisOptions: {
    //       label: 'Spend',
    //       format: TracesFormatEnum.Dollar,
    //     },
    //     distinctValueIndex: -2,
    //     traceIndex: -1,
    //   },
    //   graphers: [],
    // });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
