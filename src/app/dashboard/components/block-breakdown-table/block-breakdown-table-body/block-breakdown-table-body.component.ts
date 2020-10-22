import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { ModelBreakdownTable, TemplateBreakdownTable } from 'src/app/dashboard/services/breakdown-table.service';

@Component({
  selector: 'app-block-breakdown-table-body',
  templateUrl: './block-breakdown-table-body.component.html',
  styleUrls: ['./block-breakdown-table-body.component.scss'],
})
export class BlockBreakdownTableBodyComponent implements OnInit, OnChanges {
  @Input() dataRefreshing = true;
  @Input() template: TemplateBreakdownTable;
  @Input() viewModel: ModelBreakdownTable;

  get viewRefreshing(): boolean {
    return this.dataRefreshing || !this.viewModel;
  }

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['viewModel']) {
      // This is a hack fix for the issue where the
      // breakdown table's first column doesn't render
      // until the user clicks (i.e., the view is checked
      // again). So we trigger a manual detection after
      // the view initially gets a chance to settle
      setTimeout(() => {
        this.changeDetectorRef.detectChanges();
      }, 50);
    }
  }

}

