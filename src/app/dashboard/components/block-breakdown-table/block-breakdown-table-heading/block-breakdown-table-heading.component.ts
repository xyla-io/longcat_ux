import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { TemplateBreakdownTable } from 'src/app/dashboard/services/breakdown-table.service';
import { EnhancedTemplateMaster } from 'src/app/dashboard/interfaces/master';
import { NbMenuHelper } from 'src/app/util/nb-menu-helper';
import { Daterange } from 'src/app/dashboard/interfaces/query';

@Component({
  selector: 'app-block-breakdown-table-heading',
  templateUrl: './block-breakdown-table-heading.component.html',
  styleUrls: ['./block-breakdown-table-heading.component.scss'],
})
export class BlockBreakdownTableHeadingComponent implements OnInit {
  @Input() template: TemplateBreakdownTable;
  @Input() masterTemplate: EnhancedTemplateMaster;
  @Input() menu: NbMenuHelper;
  @Output() daterangeChange = new EventEmitter<Daterange>();

  constructor(
  ) { }

  ngOnInit() {
  }

  onDaterangeChange(daterange: Daterange) {
    this.daterangeChange.emit(daterange);
  }

  breakdownDisplayNameForIdentifier(identifier: string) {
    return this.masterTemplate.structure.templateBreakdowns
      .find(templateBreakdown => templateBreakdown.metadata.identifier === identifier).displayName;
  }
}
